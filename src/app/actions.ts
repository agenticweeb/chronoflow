"use server";

import { z } from "zod";
import { generateIntelligentWatchOrder } from "@/lib/ai/orchestrator";
import { searchAniList } from "@/lib/anilist-client";
import { redis } from "@/lib/redis";
import type { AnimeSearchResult } from "@/types";
import type { WatchOrderResultV2 } from "@/types/intelligent";

const SearchSchema = z
  .string()
  .trim()
  .min(1, "Query required")
  .max(100, "Query too long");

const DailyScheduleSchema = z.object({
  enabled: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
});

const CustomScheduleSchema = z.object({
  enabled: z.boolean(),
  monday: DailyScheduleSchema,
  tuesday: DailyScheduleSchema,
  wednesday: DailyScheduleSchema,
  thursday: DailyScheduleSchema,
  friday: DailyScheduleSchema,
  saturday: DailyScheduleSchema,
  sunday: DailyScheduleSchema,
});

const PreferencesSchema = z.object({
  timeBudget: z.enum(["casual", "regular", "dedicated", "binge"]).or(z.string()),
  mood: z.array(z.string()).default(["all"]),
  skipPreference: z.enum([
    "smart-skip",
    "watch-everything",
    "canon-only",
    "skip-all-filler",
  ]),
  includeMovies: z.boolean(),
  includeOVAs: z.boolean(),
  includeSpecials: z.boolean(),
  includeRecaps: z.boolean(),
  preferredPath: z.enum(["release", "chronological", "optimal", "manga"]),
  language: z.enum(["english", "japanese", "both"]),
  customSchedule: CustomScheduleSchema.optional(),
  paceType: z.enum(["duration", "episodes"]).optional(),
  episodesPerDay: z.number().optional(),
});

const GenerateWatchOrderSchema = z.object({
  animeName: z.string().trim().min(1).max(120),
  anilistId: z.number().int().positive().optional(),
  malId: z.number().int().positive().optional(),
  scope: z.enum(["season", "franchise"]).default("franchise"),
  preferences: PreferencesSchema,
});

export type GenerateWatchOrderInput = z.infer<typeof GenerateWatchOrderSchema>;

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type SearchActionResult = ActionResult<AnimeSearchResult[]>;

export type GenerateActionResult = ActionResult<{
  dataV2: WatchOrderResultV2;
  provider: string;
  latency: number;
  debug: unknown;
}>;

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof z.ZodError) {
    return err.issues.map((i) => i.message).join("; ") || "Validation failed";
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export async function searchAnimeAction(
  query: string
): Promise<SearchActionResult> {
  try {
    const validatedQuery = SearchSchema.parse(query);

    const cacheKey = `search_v2:${validatedQuery.toLowerCase()}`;
    const cached = await redis.get<AnimeSearchResult[]>(cacheKey);
    if (cached) {
      console.log(`✅ Cache HIT for search: ${validatedQuery}`);
      return { success: true, data: cached };
    }

    const anilistResults = await searchAniList(validatedQuery, 8);
    
    if (anilistResults.length === 0) {
      return { success: true, data: [] };
    }

    const list = anilistResults.slice(0, 8);
    
    // FIX: Never cache empty arrays
    if (list.length > 0) {
      await redis.set(cacheKey, list, { ex: 3600 });
    } else {
      await redis.del(cacheKey);
    }
    
    // ANALYTICS: Increment the search term score in a Redis sorted set
    await redis.zincrby("analytics:searches", 1, validatedQuery.toLowerCase());

    return { success: true, data: list };
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Search execution failed"),
    };
  }
}

// FIX: Use a static, safe GraphQL query instead of dynamic string concatenation
const DISCOVER_QUERY = `
  query(
    $genres: [String],
    $scoreGreater: Int,
    $yearGreater: FuzzyDateInt,
    $yearLesser: FuzzyDateInt,
    $countryOfOrigin: CountryCode,
    $sort: [MediaSort]
  ) {
    Page(perPage: 25) {
      media(
        type: ANIME
        genre_in: $genres
        averageScore_greater: $scoreGreater
        startDate_greater: $yearGreater
        startDate_lesser: $yearLesser
        countryOfOrigin: $countryOfOrigin
        sort: $sort
      ) {
        id idMal title { english romaji native } format episodes coverImage { large } averageScore description startDate { year } status popularity
        relations { edges { relationType } }
      }
    }
  }
`;

export async function discoverAnimeAction(filters: {
  genres: string[];
  minRating: number;
  yearEra: string;
  sortBy: string;
  language: string;
}): Promise<SearchActionResult> {
  try {
    const cacheKey = `discover_v5:${JSON.stringify(filters)}`;
    const cached = await redis.get<AnimeSearchResult[]>(cacheKey);
    if (cached) {
      console.log(`✅ Cache HIT for discover filters`);
      return { success: true, data: cached };
    }

    const { getEraDates } = await import("@/lib/eras");
    const eraDates = filters.yearEra !== "All Time" 
      ? getEraDates(filters.yearEra) 
      : { startDateGreater: undefined, startDateLesser: undefined };

    const variables: Record<string, any> = {
      genres: filters.genres?.length > 0 && !filters.genres.includes("All") 
        ? filters.genres 
        : undefined,
      scoreGreater: filters.minRating > 0 ? Math.round(filters.minRating * 10) : undefined,
      yearGreater: eraDates.startDateGreater,
      yearLesser: eraDates.startDateLesser,
      countryOfOrigin: filters.language !== "All" ? filters.language : undefined,
      sort: filters.sortBy === "score" || filters.sortBy === "underrated" 
        ? ["SCORE_DESC", "POPULARITY_DESC"] 
        : filters.sortBy === "title" 
          ? ["TITLE_ROMAJI"] 
          : ["POPULARITY_DESC"],
    };

    // Remove undefined values so AniList doesn't receive nulls
    const cleanVariables = Object.fromEntries(
      Object.entries(variables).filter(([, v]) => v !== undefined)
    );

    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: DISCOVER_QUERY, variables: cleanVariables }),
      next: { revalidate: 3600 } as any,
    });

    if (!res.ok) throw new Error(`AniList query failed: ${res.status}`);
    const raw = await res.json();
    const mediaList = raw?.data?.Page?.media || [];

    let mapped: AnimeSearchResult[] = mediaList.map((item: any) => ({
      malId: item.idMal || item.id,
      anilistId: item.id,
      title: item.title?.english || item.title?.romaji || item.title?.native,
      titleJapanese: item.title?.native,
      imageUrl: item.coverImage?.large || "",
      type: item.format,
      episodes: item.episodes,
      score: (item.averageScore || 0) / 10,
      synopsis: item.description?.replace(/<[^>]*>/g, "") || "",
      genres: [],
      aired: item.startDate?.year ? `${item.startDate.year}` : "",
      status: item.status,
      isFranchise: (item.relations?.edges?.length || 0) > 0,
      popularity: item.popularity || 0,
    }));

    if (filters.sortBy === "underrated") {
      mapped = mapped
        .map((item: any) => {
          const popularityPenalty = (item.popularity || 0) / 15000;
          const underratedGemScore = item.score - popularityPenalty;
          return { ...item, _gemScore: underratedGemScore };
        })
        .sort((a: any, b: any) => (b._gemScore || 0) - (a._gemScore || 0));
    }

    // FIX: Never cache empty arrays
    if (mapped.length > 0) {
      await redis.set(cacheKey, mapped, { ex: 3600 });
    } else {
      await redis.del(cacheKey);
    }

    return { success: true, data: mapped };
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Discover compilation failed"),
    };
  }
}

export async function generateWatchOrderAction(
  payload: GenerateWatchOrderInput
): Promise<GenerateActionResult> {
  try {
    const validated = GenerateWatchOrderSchema.parse(payload);

    const prefHash = JSON.stringify(validated.preferences);
    const cacheKey = `watchorder_v2:${validated.anilistId || validated.animeName}:${validated.scope}:${prefHash}`;
    const cached = await redis.get<{ result: WatchOrderResultV2; provider: string; latency: number }>(cacheKey);
    
    if (cached) {
      console.log(`✅ Cache HIT for watch order: ${validated.animeName}`);
      return { success: true, data: { dataV2: cached.result, provider: cached.provider, latency: 0, debug: { cached: true } } };
    }

    const result = await generateIntelligentWatchOrder({
      animeName: validated.animeName,
      anilistId: validated.anilistId,
      malId: validated.malId,
      scope: validated.scope,
      preferences: {
        timeBudget: validated.preferences.timeBudget,
        mood: validated.preferences.mood,
        skipPreference: validated.preferences.skipPreference,
        includeMovies: validated.preferences.includeMovies,
        includeOVAs: validated.preferences.includeOVAs,
        includeSpecials: validated.preferences.includeSpecials,
        includeRecaps: validated.preferences.includeRecaps,
        preferredPath: validated.preferences.preferredPath,
        language: validated.preferences.language,
        customSchedule: validated.preferences.customSchedule,
        paceType: validated.preferences.paceType,
        episodesPerDay: validated.preferences.episodesPerDay,
      },
    });

    await redis.set(cacheKey, { result: result.result, provider: result.provider, latency: result.latency }, { ex: 604800 });

    return {
      success: true,
      data: {
        dataV2: result.result,
        provider: result.provider,
        latency: result.latency,
        debug: result.debug,
      },
    };
  } catch (err) {
    console.error("[generateWatchOrderAction]", err);
    return {
      success: false,
      error: errorMessage(err, "Generation execution failed"),
    };
  }
}

export async function fetchCurrentlyAiring() {
  const query = `
    query {
      Page(page: 1, perPage: 12) {
        media(
          type: ANIME
          status: RELEASING
          sort: [POPULARITY_DESC]
          format_in: [TV, TV_SHORT]
          isAdult: false
        ) {
          id
          title { english romaji userPreferred }
          episodes
          coverImage { large medium }
          nextAiringEpisode { airingAt episode }
        }
      }
    }
  `;
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600, tags: ['airing'] },
    });
    if (!res.ok) throw new Error('AniList HTTP error');
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    return json.data.Page.media.map((m: any) => ({
      id: m.id,
      title: m.title.english || m.title.romaji || m.title.userPreferred,
      coverImage: m.coverImage.large || m.coverImage.medium || '',
      episodes: m.episodes ?? null,
      nextAiringEpisode: m.nextAiringEpisode ? { airingAt: m.nextAiringEpisode.airingAt, episode: m.nextAiringEpisode.episode } : null,
    }));
  } catch (e) {
    console.error('Failed to fetch currently airing:', e);
    return [];
  }
}
