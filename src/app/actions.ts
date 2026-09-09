"use server";

import { z } from "zod";
import { generateIntelligentWatchOrder } from "@/lib/ai/orchestrator";
import { queryAniList, searchAniList } from "@/lib/anilist-client";
import { redis } from "@/lib/redis";
import type { AnimeSearchResult } from "@/types";
import type { WatchOrderResultV2 } from "@/types/intelligent";
import { fetchShelfPage } from "@/lib/discover/shelf-service";
import type { ShelfPageData } from "@/lib/discover/shelf-recipes";

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

// ── Discover Grid (Phase 2 — paginated + slop mutes) ──────────
// Static, safe GraphQL (no string concatenation). Pagination contract:
// nextPage derives ONLY from pageInfo.hasNextPage (AniList's total/lastPage
// are unreliable by design).
const DISCOVER_QUERY = `
  query(
    $page: Int,
    $perPage: Int,
    $genres: [String],
    $excludedGenres: [String],
    $excludedTags: [String],
    $scoreGreater: Int,
    $yearGreater: FuzzyDateInt,
    $yearLesser: FuzzyDateInt,
    $countryOfOrigin: CountryCode,
    $sort: [MediaSort]
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { currentPage hasNextPage }
      media(
        type: ANIME
        isAdult: false
        genre_in: $genres
        genre_not_in: $excludedGenres
        tag_not_in: $excludedTags
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

const DiscoverFiltersSchema = z.object({
  genres: z.array(z.string()).default([]),
  excludedGenres: z.array(z.string()).default([]),
  excludedTags: z.array(z.string()).default([]),
  minRating: z.number().min(0).max(10).default(0),
  yearEra: z.string().default("All Time"),
  sortBy: z.string().default("popularity"),
  language: z.string().default("All"),
});
const DiscoverPageSchema = z.number().int().min(1).max(100);

export interface DiscoverPageData {
  items: AnimeSearchResult[];
  pageInfo: { currentPage: number; hasNextPage: boolean };
}
export type DiscoverPageResult = ActionResult<DiscoverPageData>;

export async function discoverAnimeAction(
  filters: {
    genres: string[];
    excludedGenres?: string[];
    excludedTags?: string[];
    minRating: number;
    yearEra: string;
    sortBy: string;
    language: string;
  },
  page: number = 1
): Promise<DiscoverPageResult> {
  try {
    // Fail-fast validation, matching this file's other actions
    const f = DiscoverFiltersSchema.parse(filters);
    const pageNo = DiscoverPageSchema.parse(page);

    // v6 key: new page-aware shape — orphaned v5 keys expire naturally within 1h
    const cacheKey = `discover_v6:${JSON.stringify(f)}:${pageNo}`;
    const cached = await redis.get<DiscoverPageData>(cacheKey);
    if (cached) {
      console.log(`✅ Cache HIT for discover filters page ${pageNo}`);
      return { success: true, data: cached };
    }

    const { getEraDates } = await import("@/lib/eras");
    const eraDates = f.yearEra !== "All Time" 
      ? getEraDates(f.yearEra) 
      : { startDateGreater: undefined, startDateLesser: undefined };

    const variables: Record<string, any> = {
      page: pageNo,
      perPage: 25,
      genres: f.genres?.length > 0 && !f.genres.includes("All") 
        ? f.genres 
        : undefined,
      excludedGenres: f.excludedGenres?.length > 0 ? f.excludedGenres : undefined,
      excludedTags: f.excludedTags?.length > 0 ? f.excludedTags : undefined,
      scoreGreater: f.minRating > 0 ? Math.round(f.minRating * 10) : undefined,
      yearGreater: eraDates.startDateGreater,
      yearLesser: eraDates.startDateLesser,
      countryOfOrigin: f.language !== "All" ? f.language : undefined,
      sort: f.sortBy === "score" || f.sortBy === "underrated" 
        ? ["SCORE_DESC", "POPULARITY_DESC"] 
        : f.sortBy === "title" 
          ? ["TITLE_ROMAJI"] 
          : ["POPULARITY_DESC"],
    };

    // Remove undefined values so AniList doesn't receive nulls
    const cleanVariables = Object.fromEntries(
      Object.entries(variables).filter(([, v]) => v !== undefined)
    );

    // Phase 2: hardened fetcher (429 backoff, 5xx retry) instead of raw fetch
    const data = await queryAniList(DISCOVER_QUERY, cleanVariables);
    const pageInfo = data?.Page?.pageInfo ?? {};
    const mediaList = data?.Page?.media || [];

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

    // Per-page penalty re-sort (preserved behavior). With pagination the
    // global order remains AniList's SCORE_DESC; the penalty reorders each page.
    if (f.sortBy === "underrated") {
      mapped = mapped
        .map((item: any) => {
          const popularityPenalty = (item.popularity || 0) / 15000;
          const underratedGemScore = item.score - popularityPenalty;
          return { ...item, _gemScore: underratedGemScore };
        })
        .sort((a: any, b: any) => (b._gemScore || 0) - (a._gemScore || 0));
    }

    const result: DiscoverPageData = {
      items: mapped,
      pageInfo: {
        currentPage: pageInfo.currentPage ?? pageNo,
        hasNextPage: Boolean(pageInfo.hasNextPage),
      },
    };

    // FIX: Never cache empty arrays
    if (result.items.length > 0) {
      await redis.set(cacheKey, result, { ex: 3600 });
    } else {
      await redis.del(cacheKey);
    }

    return { success: true, data: result };
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
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://anilist.co/'
      },
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
// ── Discovery Shelves (Phase 0 — Discovery Tab Overhaul) ──────
const ShelfIdSchema = z.string().trim().min(1).max(40);
const ShelfPageSchema = z.number().int().min(1).max(100);

export type ShelfPageResult = ActionResult<ShelfPageData>;

export async function fetchShelfPageAction(
  shelfId: string,
  page: number
): Promise<ShelfPageResult> {
  try {
    const id = ShelfIdSchema.parse(shelfId);
    const pageNo = ShelfPageSchema.parse(page);
    const data = await fetchShelfPage(id, pageNo);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Shelf fetch failed"),
    };
  }
}
