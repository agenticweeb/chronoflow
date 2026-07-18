"use server";

import { z } from "zod";
import { generateIntelligentWatchOrder } from "@/lib/ai/orchestrator";
import { searchAniList } from "@/lib/anilist-client";
import { searchAnime } from "@/lib/jikan-client";
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

    const [anilistResults, jikanResults] = await Promise.allSettled([
      searchAniList(validatedQuery, 8),
      searchAnime(validatedQuery, 8),
    ]);

    const anilistData =
      anilistResults.status === "fulfilled" ? anilistResults.value : [];
    const jikanData =
      jikanResults.status === "fulfilled" ? jikanResults.value : [];

    if (anilistResults.status === "rejected" && jikanResults.status === "rejected") {
      return {
        success: false,
        error: "Both anime databases are unreachable. Try again shortly.",
      };
    }

    const merged: AnimeSearchResult[] = [...jikanData];
    for (const ani of anilistData) {
      const existing = merged.find(
        (j) => j.malId && ani.malId && j.malId === ani.malId
      );
      if (existing) {
        if (ani.anilistId) existing.anilistId = ani.anilistId;
        if (ani.imageUrl) existing.imageUrl = ani.imageUrl;
        if (ani.score && !existing.score) existing.score = ani.score;
        if (ani.episodes && !existing.episodes) existing.episodes = ani.episodes;
        if (ani.isFranchise) existing.isFranchise = true;
      } else {
        merged.push(ani);
      }
    }

    const low = validatedQuery.toLowerCase();
    const words = low.split(/\s+/).filter((w) => w.length >= 2);
    const filtered = merged.filter((c) => {
      const title = (c.title || "").toLowerCase();
      if (words.length === 0) return true;
      const hits = words.filter((w) => title.includes(w)).length;
      return hits / words.length >= 0.25 || c.score >= 7 || c.isFranchise;
    });

    const list = (filtered.length > 0 ? filtered : merged).slice(0, 10);
    return { success: true, data: list };
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Search execution failed"),
    };
  }
}

function getGraphQLType(v: string): string {
  if (v === "genres") return "[String]";
  if (v === "scoreGreater" || v === "yearGreater" || v === "yearLesser") return "Int";
  if (v === "sort") return "[MediaSort]";
  if (v === "countryOfOrigin") return "CountryCode";
  return "String";
}

/**
 * Real-time, dynamic compiled AniList Explorer with Language Matrix
 */
export async function discoverAnimeAction(filters: {
  genres: string[];
  minRating: number;
  yearEra: string;
  sortBy: string;
  language: string; // JP, US, CN, KR, FR etc
}): Promise<SearchActionResult> {
  try {
    let queryArgs = "type: ANIME";
    const variables: Record<string, any> = {};

    // Dynamic Multi-Genre compilation
    if (filters.genres && filters.genres.length > 0 && !filters.genres.includes("All")) {
      queryArgs += ", genre_in: $genres";
      variables.genres = filters.genres;
    }

    // Dynamic Rating compilation
    if (filters.minRating > 0) {
      queryArgs += ", averageScore_greater: $scoreGreater";
      variables.scoreGreater = Math.round(filters.minRating * 10);
    }

    // Dynamic Era compilation (Fixed: real calendar bounds)
    if (filters.yearEra === "2020s") {
      queryArgs += ", startDate_greater: $yearGreater, startDate_lesser: $yearLesser";
      variables.yearGreater = 20200101;
      variables.yearLesser = 20291231;
    } else if (filters.yearEra === "2010s") {
      queryArgs += ", startDate_greater: $yearGreater, startDate_lesser: $yearLesser";
      variables.yearGreater = 20100101;
      variables.yearLesser = 20191231;
    } else if (filters.yearEra === "2000s") {
      queryArgs += ", startDate_greater: $yearGreater, startDate_lesser: $yearLesser";
      variables.yearGreater = 20000101;
      variables.yearLesser = 20091231;
    }

    // Dynamic Language / Country of origin compilation
    if (filters.language && filters.language !== "All") {
      queryArgs += ", countryOfOrigin: $countryOfOrigin";
      variables.countryOfOrigin = filters.language;
    }

    // Dynamic Sort compilation
    queryArgs += ", sort: $sort";
    if (filters.sortBy === "score" || filters.sortBy === "underrated") {
      variables.sort = ["SCORE_DESC", "POPULARITY_DESC"];
    } else if (filters.sortBy === "title") {
      variables.sort = ["TITLE_ROMAJI"];
    } else {
      variables.sort = ["POPULARITY_DESC"];
    }

    const varSignature = Object.keys(variables)
      .map((v) => `$${v}: ${getGraphQLType(v)}`)
      .join(", ");

    const q = `
      query(${varSignature}) {
        Page(perPage: 25) {
          media(${queryArgs}) {
            id idMal title { english romaji native } format episodes coverImage { large } averageScore description startDate { year } status popularity
            relations { edges { relationType } }
          }
        }
      }
    `;

    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, variables }),
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

    // Algorithmic Underrated Gems Sorter (IMDb High Score + Mainstream Popularity Penalty)
    if (filters.sortBy === "underrated") {
      mapped = mapped
        .map((item: any) => {
          const popularityPenalty = (item.popularity || 0) / 15000;
          const underratedGemScore = item.score - popularityPenalty;
          return { ...item, _gemScore: underratedGemScore };
        })
        .sort((a: any, b: any) => (b._gemScore || 0) - (a._gemScore || 0));
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
      },
    });

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
