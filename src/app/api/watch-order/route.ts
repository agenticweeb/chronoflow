/**
 * API Route: Generate Watch Order V2 - Intelligent Grounding First
 * Replaces old hallucination route
 * 
 * Flow: Search already done in orchestrator -> Build Graph -> Classify -> Prompt -> Validate
 */

import { NextRequest, NextResponse } from "next/server";
import { generateIntelligentWatchOrder } from "@/lib/ai/orchestrator";
import { cache } from "@/lib/cache";
import { WatchOrderResultV2 } from "@/types/intelligent";
import { WatchOrderResult, WatchOrderEntry } from "@/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // allow up to 60s for graph building + AI

function convertV2ToLegacy(v2: WatchOrderResultV2): WatchOrderResult {
  // Convert nested V2 to flat old shape so old UI keeps working during migration
  const flatEntries = v2.allEntriesFlat;

  const legacyEntries: WatchOrderEntry[] = flatEntries.map((e, idx) => ({
    id: e.id,
    malId: e.malId,
    anilistId: e.anilistId,
    title: e.title,
    titleJapanese: e.titleJapanese,
    type: e.format as any,
    tier: e.tier,
    episodeCount: e.episodeCount,
    durationMinutes: e.durationMinutes,
    timeEstimate: e.timeEstimate,
    position: e.position,
    prerequisites: e.prerequisites || [],
    unlocks: e.unlocks || [],
    contentTags: e.contentTags as any,
    arcName: e.arcName,
    isFiller: e.isFiller,
    fillerClassification: (e.fillerType as any) || "none",
    fillerReason: e.fillerReason,
    whyWatch: e.whyWatch,
    skipWarning: e.skipWarning,
    watchIf: e.watchIf,
    imageUrl: e.imageUrl || (e.coverImage?.large as any) || (e.coverImage?.medium as any) || "",
    bannerUrl: e.bannerUrl || (e.coverImage?.large as any) || (e.coverImage?.medium as any) || "",
    malScore: e.malScore,
    anilistScore: e.anilistScore,
    popularity: e.popularity,
    synopsis: e.synopsis,
    genres: e.genres,
    aired: e.aired,
    status: e.status,
    watched: e.watched,
    progress: e.progress,
    trailerUrl: e.trailerUrl || (e.coverImage?.trailer ? e.coverImage.trailer : null) || null,
  }));

  // Convert V2 paths to old paths format (flatten groups)
  const legacyPaths = v2.paths.map((p) => ({
    name: p.name,
    description: p.description,
    entries: p.groups.flatMap((g) => g.entries.map((e) => e.title)),
    totalTime: p.totalTime,
    bestFor: p.bestFor,
  }));

  return {
    franchise: v2.franchise,
    franchiseId: v2.franchiseId,
    description: v2.summary,
    totalEntries: v2.totalEntries,
    totalEpisodes: v2.totalEpisodes,
    totalDuration: v2.totalDuration,
    entries: legacyEntries,
    paths: legacyPaths as any,
    generatedAt: v2.generatedAt,
    aiProvider: v2.aiProvider,
    confidence: v2.confidence,
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { animeName, preferences, scope, id, malId, anilistId } = body as {
      animeName: string;
      preferences?: any;
      scope?: "season" | "franchise";
      id?: number;
      malId?: number;
      anilistId?: number;
    };

    if (!animeName?.trim()) {
      return NextResponse.json({ success: false, error: "Anime name is required" }, { status: 400 });
    }

    const finalScope = scope || "franchise"; // default to franchise for mega franchises like Fate

    const defaultPrefs = {
      timeBudget: "regular",
      mood: ["all"],
      skipPreference: "smart-skip" as const,
      includeMovies: true,
      includeOVAs: true,
      includeSpecials: true,
      includeRecaps: false,
      preferredPath: "optimal" as const,
      language: "english" as const,
    };

    const finalPrefs = { ...defaultPrefs, ...(preferences || {}) };

    const cacheKey = `v2_order_${animeName.toLowerCase().replace(/\s+/g, "_")}_${finalScope}_${JSON.stringify(finalPrefs)}_${id || anilistId || malId || ""}`;
    const cached = cache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        dataV2: cached.dataV2,
        cached: true,
        provider: cached.provider,
        latency: Date.now() - startTime,
        debug: cached.debug,
      });
    }

    // Resolve IDs: if id is provided from search UI, try to determine if it's anilist or mal
    let resolvedAnilistId = anilistId;
    let resolvedMalId = malId;
    if (id && !resolvedAnilistId && !resolvedMalId) {
      // Heuristic: anilist ids are usually > 10000 for recent, but we try both
      // The orchestrator will search and resolve anyway, so we pass as anilistId first
      resolvedAnilistId = id;
    }

    const orchestratorResult = await generateIntelligentWatchOrder({
      animeName: animeName.trim(),
      anilistId: resolvedAnilistId,
      malId: resolvedMalId,
      scope: finalScope,
      preferences: finalPrefs,
    });

    const v2Result = orchestratorResult.result;
    const legacyResult = convertV2ToLegacy(v2Result);

    const responsePayload = {
      success: true,
      data: legacyResult, // old UI keeps working
      dataV2: v2Result, // new UI will use this
      provider: orchestratorResult.provider,
      latency: orchestratorResult.latency,
      cached: false,
      debug: orchestratorResult.debug,
    };

    // Cache for 7 days
    cache.set(cacheKey, responsePayload, 7 * 24 * 60 * 60 * 1000, orchestratorResult.provider);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("V2 Watch order generation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        latency: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "ChronoFlow V2 Intelligent Watch Order API",
    version: "2.0-grounding-first",
    features: [
      "Relation graph grounding from AniList + Jikan",
      "Shape classification (mega_franchise, long_runner, canon_movie_sandwich, route_branching, remake_divergence)",
      "5 specialized prompts",
      "Hallucination validation - only allowed IDs",
      "Nested Paths > Groups > Entries structure",
    ],
    usage: "POST with { animeName, preferences, scope: 'franchise'|'season', id? }",
  });
}
