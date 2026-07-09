/**
 * API Route: Generate Watch Order
 * 
 * Flow:
 * 1. Receive anime name + user preferences
 * 2. Check cache first
 * 3. Search and find the best match
 * 4. Pre-fetch real franchise relation graph from AniList/MAL (RAG Context)
 * 5. Call AI with auto-failover, feeding it the verified entries
 * 6. Parse AI response and enrich using live parsed database stats
 * 7. Apply user filters & return formatted, accurate watch order
 */

import { NextRequest, NextResponse } from "next/server";
import { buildWatchOrderPrompt, callAIWithFallback } from "@/lib/ai-providers";
import { searchAnime, getAnimeDetails } from "@/lib/jikan-client";
import { searchAniList, getMediaDetails } from "@/lib/anilist-client";
import { cache } from "@/lib/cache";
import {
  WatchOrderResult,
  WatchOrderEntry,
  UserPreferences,
  AIGeneratedOrder,
} from "@/types";

// Helper: Safely parses human-readable Jikan duration strings into minutes
function parseDuration(durationStr?: string, type?: string): number {
  if (!durationStr) {
    return type === "Movie" ? 90 : 24;
  }
  const clean = durationStr.toLowerCase();
  
  // 1. Handle seconds first (e.g., "44 sec per ep" or "30 sec")
  if (clean.includes("sec") || clean.includes("second")) {
    const match = clean.match(/(\d+)\s*sec/);
    if (match) {
      const seconds = parseInt(match[1], 10);
      return Math.ceil(seconds / 60); // Converts 44 seconds -> 1 minute
    }
    return 1;
  }
  
  // 2. Handle minutes (e.g., "24 min per ep" or "24 min")
  if (clean.includes("per ep") || clean.includes("min")) {
    const match = clean.match(/(\d+)\s*min/);
    if (match) return parseInt(match[1], 10);
  }
  
  // 3. Handle hours (e.g., "1 hr 45 min" or "2 hr")
  if (clean.includes("hr") || clean.includes("hour")) {
    const hrMatch = clean.match(/(\d+)\s*hr/);
    const minMatch = clean.match(/(\d+)\s*min/);
    let total = 0;
    if (hrMatch) total += parseInt(hrMatch[1], 10) * 60;
    if (minMatch) total += parseInt(minMatch[1], 10);
    if (total > 0) return total;
  }
  
  return type === "Movie" ? 90 : 24;
}

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

  if (currentUrl?.includes("anilist.co")) {
    return currentUrl;
  }

  if (currentUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(currentUrl, {
        method: "HEAD",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return currentUrl;
      }
    } catch (e) {
      console.warn(`HEAD probe failed for ${currentUrl}. Transitioning to stable re-resolution.`);
    }
  }

  if (malId) {
    const aniListUrl = await fetchAniListImageByMalId(malId);
    if (aniListUrl) return aniListUrl;
  }

  return currentUrl || "";
}

// Pre-fetches immediate franchise network nodes dynamically before prompting the AI
async function getFranchiseGraph(bestMatch: any): Promise<any[]> {
  const entries: any[] = [];
  
  // 1. Add the main queried show
  entries.push({
    malId: bestMatch.malId,
    anilistId: bestMatch.anilistId,
    title: bestMatch.title,
    type: bestMatch.type,
    episodes: bestMatch.episodes,
    relation: "Main Query"
  });

  // 2. Fetch all immediate relation nodes from AniList (extremely fast single graph query)
  if (bestMatch.anilistId) {
    try {
      const details = await getMediaDetails(bestMatch.anilistId);
      const relations = details?.Media?.relations?.edges || [];
      for (const edge of relations) {
        const node = edge.node;
        if (node) {
          entries.push({
            malId: node.idMal,
            anilistId: node.id,
            title: node.title.english || node.title.romaji || node.title.native,
            type: node.format,
            episodes: node.episodes,
            relation: edge.relationType
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch relations from AniList:", err);
    }
  } else if (bestMatch.malId) {
    // Fallback Jikan relation fetch
    try {
      const details = await getAnimeDetails(bestMatch.malId);
      const relations = details?.relations || [];
      for (const r of relations) {
        if (r.entry) {
          entries.push({
            malId: r.entry.malId,
            title: r.entry.title,
            type: r.entry.type,
            relation: r.relation
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch relations from Jikan:", err);
    }
  }

  // Deduplicate entries by malId, anilistId, or lowercase title name
  const uniqueEntries: any[] = [];
  const seenKeys = new Set<string>();

  for (const entry of entries) {
    const key = entry.anilistId 
      ? `ani_${entry.anilistId}` 
      : entry.malId 
      ? `mal_${entry.malId}` 
      : `title_${entry.title.toLowerCase()}`;
      
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueEntries.push(entry);
    }
  }

  return uniqueEntries;
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

    // ── Step 3: Fetch verified relation graph & prompt AI ──
    const franchiseGraph = await getFranchiseGraph(bestMatch);
    
    // Convert verified database items to a context block for the AI prompt
    const franchiseContext = franchiseGraph
      .map((entry) => `- Title: "${entry.title}" | Type: ${entry.type || "Unknown"} | Episodes: ${entry.episodes || "Unknown"} | Relation: ${entry.relation || "Self"}`)
      .join("\n");

    const basePrompt = buildWatchOrderPrompt(bestMatch.title, preferences);
    
    // Inject database context directly into the instruction payload
    const prompt = `${basePrompt}\n\nVERIFIED DATABASE ENTRIES (You MUST only construct the watch order from this exact list of entries. Do not invent other seasons, movies, or shows. Map these entries directly to your recommendation tiers):\n${franchiseContext}`;

    const aiResponse = await callAIWithFallback(prompt);

    // Parse AI response safely
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
        // Find matching anime in our fetched franchise graph first, fallback to search results
        const match = franchiseGraph.find(
          (r) =>
            r.title.toLowerCase().includes(entry.title.toLowerCase()) ||
            entry.title.toLowerCase().includes(r.title.toLowerCase())
        ) || mergedResults.find(
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

        // Parse runtime safely and guard against multi-episode/season calculation bloats
        const parsedRealDuration = parseDuration(enrichment?.duration, entry.type);
        let finalDuration = parsedRealDuration || entry.durationMinutes || (entry.type === "Movie" ? 90 : 24);
        
        // Safety Clamping Safeguard: TV shows should not have hallucinated per-episode runtimes over 60 minutes
        if (entry.type === "TV" && finalDuration > 60) {
          finalDuration = 24;
        }

        return {
          id: `entry_${index}`,
          malId: match?.malId,
          anilistId: match?.anilistId,
          title: entry.title,
          titleJapanese: match?.titleJapanese,
          type: entry.type,
          tier: entry.tier,
          episodeCount: entry.episodeCount || match?.episodes || 12,
          durationMinutes: finalDuration,
          timeEstimate: `${entry.episodeCount || match?.episodes || 12} eps × ${finalDuration}m`,
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
          trailerUrl: enrichment?.trailerUrl || null, // ADD THIS LINE TO FORWARD TRAILERS
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

    // Compute unlocks
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

  if (prefs.skipPreference === "skip-all-filler") {
    filtered = filtered.filter((e) => !e.isFiller);
  } else if (prefs.skipPreference === "canon-only") {
    filtered = filtered.filter((e) => e.tier === "essential");
  } else if (prefs.skipPreference === "smart-skip") {
    filtered = filtered.filter((e) => e.tier !== "skip");
  }

  if (prefs.mood && prefs.mood.length > 0 && !prefs.mood.includes("all")) {
    const moodSet = new Set(prefs.mood.map((m) => m.toLowerCase()));
    filtered = filtered.filter((e) =>
      e.contentTags.some((tag) => moodSet.has(tag.toLowerCase()))
    );
  }

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
