/**
 * API Route: Generate Watch Order
 * 
 * Flow:
 * 1. Receive anime name + user preferences
 * 2. Check cache first
 * 3. Call AI with auto-failover
 * 4. Parse AI response into structured data
 * 5. Enrich with Jikan + AniList live data
 * 6. Apply user filters (time budget, skip preference, mood)
 * 7. Cache result
 * 8. Return formatted watch order
 */

import { NextRequest, NextResponse } from "next/server";
import { buildWatchOrderPrompt, callAIWithFallback } from "@/lib/ai-providers";
import { searchAnime, getAnimeDetails } from "@/lib/jikan-client";
import { searchAniList } from "@/lib/anilist-client";
import { cache } from "@/lib/cache";
import {
  WatchOrderResult,
  WatchOrderEntry,
  UserPreferences,
  AIGeneratedOrder,
} from "@/types";

// ── Layer 2 & 1: Image Probe & Re-resolve Pipeline ──────────
async function fetchAniListImageByMalId(malId: number): Promise<string | undefined> {
  try {
    const query = `
      query($idMal: Int) {
        Media(idMal: $idMal, type: ANIME) {
          coverImage { large }
        }
      }
    `;
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { idMal: malId } }),
    });
    if (res.ok) {
      const body = await res.json();
      return body?.data?.Media?.coverImage?.large;
    }
  } catch (err) {
    console.error("AniList re-resolution fetch failed:", err);
  }
  return undefined;
}

async function probeAndResolveImageUrl(
  malId?: number,
  anilistId?: number,
  currentUrl?: string
): Promise<string> {
  if (!currentUrl && !malId && !anilistId) return "";

  // Bias toward AniList: If currentUrl is already an AniList stable link, skip validation
  if (currentUrl?.includes("anilist.co")) {
    return currentUrl;
  }

  // Layer 2: Probe MAL CDN with a lightweight HEAD check
  if (currentUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5-second budget
      const res = await fetch(currentUrl, {
        method: "HEAD",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return currentUrl; // MAL URL is fully healthy
      }
    } catch (e) {
      console.warn(`HEAD probe failed for ${currentUrl}. Transitioning to stable re-resolution.`);
    }
  }

  // Layer 1: Resolve dead/missing images via stable AniList URLs
  if (malId) {
    const aniListUrl = await fetchAniListImageByMalId(malId);
    if (aniListUrl) return aniListUrl;
  }

  return currentUrl || "";
}


export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { animeName, preferences } = body as {
      animeName: string;
      preferences: UserPreferences;
    };

    if (!animeName?.trim()) {
      return NextResponse.json(
        { success: false, error: "Anime name is required" },
        { status: 400 }
      );
    }

    // ── Step 1: Check cache ────────────────────────────────
    const cacheKey = `order_${animeName.toLowerCase().replace(/\s+/g, "_")}_${JSON.stringify(preferences)}`;
    const cached = cache.get<WatchOrderResult>(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        latency: Date.now() - startTime,
      });
    }

    // ── Step 2: Parallel search across APIs ──────────────────
    const [jikanResults, anilistResults] = await Promise.allSettled([
      searchAnime(animeName, 5),
      searchAniList(animeName, 5),
    ]);

    const jikanData =
      jikanResults.status === "fulfilled" ? jikanResults.value : [];
    const anilistData =
      anilistResults.status === "fulfilled" ? anilistResults.value : [];

    // Merge and deduplicate
    const mergedResults = [...jikanData];
    for (const ani of anilistData) {
      const existing = mergedResults.find((j) => j.malId === ani.malId);
      if (existing) {
        existing.anilistId = ani.anilistId;
        if (ani.imageUrl) existing.imageUrl = ani.imageUrl;
      } else {
        mergedResults.push(ani);
      }
    }

    const bestMatch = mergedResults[0];
    if (!bestMatch) {
      return NextResponse.json(
        { success: false, error: `No anime found matching "${animeName}"` },
        { status: 404 }
      );
    }

    // ── Step 3: Generate watch order with AI ─────────────────
    const prompt = buildWatchOrderPrompt(bestMatch.title, preferences);
    const aiResponse = await callAIWithFallback(prompt);

    // Parse AI response (extract JSON from markdown if needed)
    let aiData: AIGeneratedOrder;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse.content;
      aiData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("AI response parse error:", parseError);
      return NextResponse.json(
        { success: false, error: "Failed to parse AI response. Try again." },
        { status: 500 }
      );
    }

    // ── Step 4: Enrich entries with live data ──────────────
    const enrichedEntries: WatchOrderEntry[] = await Promise.all(
      aiData.entries.map(async (entry, index) => {
        // Try to find matching anime in search results
        const match = mergedResults.find(
          (r) =>
            r.title.toLowerCase().includes(entry.title.toLowerCase()) ||
            entry.title.toLowerCase().includes(r.title.toLowerCase())
        );

        let enrichment = null;
        if (match?.malId) {
          try {
            enrichment = await getAnimeDetails(match.malId);
          } catch (e) {
            console.warn(`Enrichment failed for ${entry.title}:`, e);
          }
        }

        const rawImageUrl = match?.imageUrl || enrichment?.imageUrl;
        const resolvedImageUrl = await probeAndResolveImageUrl(
          match?.malId,
          match?.anilistId,
          rawImageUrl
        );

        return {
          id: `entry_${index}`,
          malId: match?.malId,
          anilistId: match?.anilistId,
          title: entry.title,
          titleJapanese: match?.titleJapanese,
          type: entry.type,
          tier: entry.tier,
          episodeCount: entry.episodeCount || match?.episodes,
          durationMinutes: entry.durationMinutes,
          timeEstimate: entry.timeEstimate,
          position: entry.position,
          prerequisites: entry.prerequisites,
          unlocks: [],
          contentTags: entry.contentTags,
          arcName: entry.arcName,
          isFiller: entry.isFiller,
          fillerClassification: entry.fillerClassification,
          fillerReason: entry.fillerReason,
          whyWatch: entry.whyWatch,
          skipWarning: entry.skipWarning,
          watchIf: entry.watchIf,
          imageUrl: resolvedImageUrl,
          malScore: enrichment?.score || match?.score,
          anilistScore: match?.score,
          popularity: enrichment?.popularity,
          memberCount: enrichment?.members,
          synopsis: enrichment?.synopsis || match?.synopsis,
          genres: enrichment?.genres || match?.genres,
          aired: enrichment?.aired || match?.aired,
          status: enrichment?.status || match?.status,
        };
      })
    );

    // Compute unlocks (reverse of prerequisites)
    const entryMap = new Map(enrichedEntries.map((e) => [e.title, e.id]));
    enrichedEntries.forEach((entry) => {
      entry.prerequisites.forEach((prereq) => {
        const prereqId = entryMap.get(prereq);
        if (prereqId) {
          const prereqEntry = enrichedEntries.find((e) => e.id === prereqId);
          if (prereqEntry && !prereqEntry.unlocks.includes(entry.id)) {
            prereqEntry.unlocks.push(entry.id);
          }
        }
      });
    });

    // ── Step 5: Apply user filters ───────────────────────────
    const filteredEntries = applyFilters(enrichedEntries, preferences);

    // ── Step 6: Build result ─────────────────────────────────
    const result: WatchOrderResult = {
      franchise: aiData.franchise || bestMatch.title,
      franchiseId: `fr_${bestMatch.malId || bestMatch.anilistId || Date.now()}`,
      description: aiData.description || `Complete watch order for ${bestMatch.title}`,
      totalEntries: filteredEntries.length,
      totalEpisodes: filteredEntries.reduce((sum, e) => sum + (e.episodeCount || 0), 0),
      totalDuration: calculateTotalDuration(filteredEntries),
      entries: filteredEntries,
      paths: aiData.paths || [],
      generatedAt: new Date().toISOString(),
      aiProvider: aiResponse.provider,
      confidence: aiData.confidence || 75,
    };

    // ── Step 7: Cache and return ─────────────────────────────
    cache.set(cacheKey, result, 7 * 24 * 60 * 60 * 1000, aiResponse.provider);

    return NextResponse.json({
      success: true,
      data: result,
      provider: aiResponse.provider,
      latency: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Watch order generation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// ── Filter Engine ──────────────────────────────────────────
function applyFilters(entries: WatchOrderEntry[], prefs: UserPreferences): WatchOrderEntry[] {
  let filtered = [...entries];

  // Type filters
  if (!prefs.includeMovies) {
    filtered = filtered.filter((e) => e.type !== "Movie");
  }
  if (!prefs.includeOVAs) {
    filtered = filtered.filter((e) => e.type !== "OVA");
  }
  if (!prefs.includeSpecials) {
    filtered = filtered.filter((e) => e.type !== "Special");
  }
  if (!prefs.includeRecaps) {
    filtered = filtered.filter((e) => e.type !== "Recap");
  }

  // Skip preference
  if (prefs.skipPreference === "skip-all-filler") {
    filtered = filtered.filter((e) => !e.isFiller);
  } else if (prefs.skipPreference === "canon-only") {
    filtered = filtered.filter((e) => e.tier === "essential");
  } else if (prefs.skipPreference === "smart-skip") {
    filtered = filtered.filter((e) => e.tier !== "skip");
  }

  // Mood filter
  if (prefs.mood && prefs.mood.length > 0 && !prefs.mood.includes("all")) {
    const moodSet = new Set(prefs.mood.map((m) => m.toLowerCase()));
    filtered = filtered.filter((e) =>
      e.contentTags.some((tag) => moodSet.has(tag.toLowerCase()))
    );
  }

  // Time budget (rough estimation)
  if (prefs.timeBudget && prefs.timeBudget !== "binge") {
    const budgetHours: Record<string, number> = {
      "1hour": 1,
      "3hours": 3,
      "1day": 8,
      "1week": 20,
    };
    const budget = budgetHours[prefs.timeBudget] || Infinity;

    let accumulatedHours = 0;
    filtered = filtered.filter((e) => {
      const entryHours = ((e.episodeCount || 1) * (e.durationMinutes || 24)) / 60;
      if (accumulatedHours + entryHours <= budget) {
        accumulatedHours += entryHours;
        return true;
      }
      return false;
    });
  }

  return filtered;
}

function calculateTotalDuration(entries: WatchOrderEntry[]): string {
  const totalMinutes = entries.reduce(
    (sum, e) => sum + (e.episodeCount || 1) * (e.durationMinutes || 24),
    0
  );
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
