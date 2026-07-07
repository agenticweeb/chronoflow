/**
 * API Route: Universal Anime Search
 * Searches Jikan (MAL) and AniList simultaneously
 * Returns merged, deduplicated results
 */

import { NextRequest, NextResponse } from "next/server";
import { searchAnime } from "@/lib/jikan-client";
import { searchAniList } from "@/lib/anilist-client";
import { AnimeSearchResult } from "@/types";


export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

  if (!query?.trim()) {
    return NextResponse.json(
      { success: false, error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    // Parallel search across both APIs
    const [jikanResults, anilistResults] = await Promise.allSettled([
      searchAnime(query, limit),
      searchAniList(query, limit),
    ]);

    const jikanData =
      jikanResults.status === "fulfilled" ? jikanResults.value : [];
    const anilistData =
      anilistResults.status === "fulfilled" ? anilistResults.value : [];

    // Merge: prefer AniList images, Jikan scores, combine metadata
    const mergedMap = new Map<number, AnimeSearchResult>();

    jikanData.forEach((item) => {
      mergedMap.set(item.malId, { ...item });
    });

    anilistData.forEach((item) => {
      if (item.malId && mergedMap.has(item.malId)) {
        const existing = mergedMap.get(item.malId)!;
        if (
          item.imageUrl &&
          (!existing.imageUrl || item.imageUrl.includes("anilist"))
        ) {
          existing.imageUrl = item.imageUrl;
        }
        existing.anilistId = item.anilistId || existing.anilistId;
        existing.isFranchise = existing.isFranchise || item.isFranchise;
        existing.franchiseEntries = Math.max(
          existing.franchiseEntries || 0,
          item.franchiseEntries || 0
        );
      } else {
        mergedMap.set(
          item.malId || item.anilistId || Date.now(),
          { ...item }
        );
      }
    });

    const results = Array.from(mergedMap.values()).slice(0, limit);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      sources: {
        jikan: jikanData.length,
        anilist: anilistData.length,
      },
      latency: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Search failed",
      },
      { status: 500 }
    );
  }
}
