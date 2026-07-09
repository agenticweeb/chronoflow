/**
 * API Route: Generate Watch Order
 */

import { NextRequest, NextResponse } from "next/server";
import { buildWatchOrderPrompt, callAIWithFallback } from "@/lib/ai-providers";
import { searchAnime } from "@/lib/jikan-client";
import { searchAniList, getMediaDetails } from "@/lib/anilist-client";
import { cache } from "@/lib/cache";
import {
  WatchOrderResult,
  WatchOrderEntry,
  UserPreferences,
  AIGeneratedOrder,
} from "@/types";

// Helper: Safely parses human-readable Jikan/AniList duration strings into minutes
function parseDuration(durationStr?: string, type?: string): number {
  if (!durationStr) {
    return type === "Movie" ? 90 : 24;
  }
  const clean = durationStr.toLowerCase();
  
  if (clean.includes("sec") || clean.includes("second")) {
    const match = clean.match(/(\d+)\s*sec/);
    if (match) {
      const seconds = parseInt(match[1], 10);
      return Math.ceil(seconds / 60); 
    }
    return 1;
  }
  
  if (clean.includes("per ep") || clean.includes("min")) {
    const match = clean.match(/(\d+)\s*min/);
    if (match) return parseInt(match[1], 10);
  }
  
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

// Pre-fetches franchise relations, prioritizing main items & capping to prevent LLM timeouts
async function getFranchiseGraph(bestMatch: any): Promise<any[]> {
  const entries: any[] = [];
  
  if (bestMatch.anilistId) {
    try {
      const details = await getMediaDetails(bestMatch.anilistId);
      const media = details?.Media;
      
      if (media) {
        entries.push({
          malId: media.idMal,
          anilistId: media.id,
          title: media.title?.english || media.title?.romaji || media.title?.native,
          type: media.format,
          episodes: media.episodes,
          duration: media.duration,
          averageScore: media.averageScore,
          description: media.description,
          genres: media.genres,
          imageUrl: media.coverImage?.large,
          status: media.status,
          trailer: media.trailer,
          popularity: media.popularity || 0,
          relation: "Main Show"
        });
      }

      const relations = media?.relations?.edges || [];
      const relationNodes: any[] = [];

      for (const edge of relations) {
        const node = edge.node;
        if (node) {
          // Omit music PVs or recaps to protect generation speeds on long series (like One Piece)
          const ignoredFormats = ["music", "special"];
          if (ignoredFormats.includes(node.format?.toLowerCase() || "")) {
            continue;
          }

          relationNodes.push({
            malId: node.idMal,
            anilistId: node.id,
            title: node.title?.english || node.title?.romaji || node.title?.native,
            type: node.format,
            episodes: node.episodes,
            duration: node.duration,
            averageScore: node.averageScore,
            description: node.description,
            genres: node.genres,
            imageUrl: node.coverImage?.large,
            status: node.status,
            trailer: node.trailer,
            popularity: node.popularity || 0,
            relationType: edge.relationType
          });
        }
      }

      // Sort relations by popularity and limit to top 15 most popular entries (+ main show)
      const sortedRelations = relationNodes
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 15);

      entries.push(...sortedRelations);
    } catch (err) {
      console.warn("Failed to fetch relations from AniList GraphQL query:", err);
    }
  }

  // Deduplicate entries safely
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

// Robust JSON sanitizer to prevent conversational markdown parsing failures
function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();

  // 1. Strip markdown code fences
  const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(markdownRegex);
  if (match) {
    cleaned = match[1].trim();
  }

  // 2. Identify outermost structural brackets
  const firstBracket = cleaned.indexOf('[');
  const firstBrace = cleaned.indexOf('{');
  
  let startIdx = -1;
  let endIdx = -1;

  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf(']');
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf('}');
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.slice(startIdx, endIdx + 1);
  }

  // 3. Remove inline javascript comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  cleaned = cleaned.replace(/(?:^|\s)\/\/.*$/gm, '');

  // 4. Eliminate trailing commas
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    try {
      // 5. Escape newline controls within string fields
      const repaired = cleaned.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (m, group) => {
        return '"' + group.replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
      });
      return JSON.parse(repaired);
    } catch (secondError) {
      console.error('Critical JSON Parsing Failure. Cleansed block was:', cleaned);
      throw new Error(`Failed to parse LLM response arrays.`);
    }
  }
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

    const [jikanResults, anilistResults] = await Promise.allSettled([
      searchAnime(animeName, 5),
      searchAniList(animeName, 5),
    ]);

    const jikanData = jikanResults.status === "fulfilled" ? jikanResults.value : [];
    const anilistData = anilistResults.status === "fulfilled" ? anilistResults.value : [];

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

    const bestMatch = mergedResults.find(
      (item) => item.title.toLowerCase().includes(animeName.toLowerCase()) || 
                animeName.toLowerCase().includes(item.title.toLowerCase())
    ) || mergedResults[0];

    if (!bestMatch) {
      return NextResponse.json(
        { success: false, error: `No anime found matching "${animeName}"` },
        { status: 404 }
      );
    }

    // Step 3: Fetch dynamic graph capped to top 15 most popular entries to prevent LLM truncation
    const franchiseGraph = await getFranchiseGraph(bestMatch);
    
    const franchiseContext = franchiseGraph
      .map((entry) => `- Title: "${entry.title}" | Type: ${entry.type || "Unknown"} | Episodes: ${entry.episodes || "Unknown"}`)
      .join("\n");

    const basePrompt = buildWatchOrderPrompt(bestMatch.title, preferences);
    const prompt = `${basePrompt}\n\nVERIFIED DATABASE ENTRIES (You MUST strictly map your timeline entries to match this list. Do not invent any other seasons, films, or titles):\n${franchiseContext}`;

    const aiResponse = await callAIWithFallback(prompt);

    // Parse Response
    let aiData: AIGeneratedOrder;
    try {
      aiData = cleanAndParseJSON(aiResponse.content);
    } catch (parseError) {
      console.error("Critical AI Response Parsing Crash. Raw content was:", aiResponse.content);
      return NextResponse.json(
        { success: false, error: "Failed to parse structured AI output cleanly." },
        { status: 500 }
      );
    }

    // Step 4: Map original metadata and trailers back into parsed entries on the server
    const enrichedEntries: WatchOrderEntry[] = aiData.entries.map((entry, index) => {
      const match = franchiseGraph.find(
        (r) =>
          r.title.toLowerCase().includes(entry.title.toLowerCase()) ||
          entry.title.toLowerCase().includes(r.title.toLowerCase())
      ) || mergedResults.find(
        (r) =>
          r.title.toLowerCase().includes(entry.title.toLowerCase()) ||
          entry.title.toLowerCase().includes(r.title.toLowerCase())
      );

      const cleanSynopsis = match?.description 
        ? match.description.replace(/<[^>]*>/g, "").trim()
        : match?.synopsis || "";

      let trailerUrl = null;
      if (match?.trailer?.site?.toLowerCase() === "youtube" && match?.trailer?.id) {
        trailerUrl = `https://www.youtube.com/watch?v=${match.trailer.id}`; // Fix: Corrected string template typo
      }

      // Safe fallbacks to prevent "0 Hours" bug if AI returns missing fields
      const episodesCount = match?.episodes || entry.episodeCount || 12;
      const durationMinutes = match?.duration || entry.durationMinutes || (entry.type === "Movie" ? 90 : 24);
      const finalDuration = (entry.type === "TV" && durationMinutes > 60) ? 24 : durationMinutes;

      return {
        id: `entry_${index}`,
        malId: match?.malId,
        anilistId: match?.anilistId,
        title: entry.title,
        titleJapanese: match?.titleJapanese,
        type: entry.type,
        tier: entry.tier,
        episodeCount: episodesCount,
        durationMinutes: finalDuration,
        timeEstimate: `${episodesCount} eps × ${finalDuration}m`,
        position: entry.position,
        prerequisites: entry.prerequisites || [],
        unlocks: [],
        contentTags: entry.contentTags || [],
        arcName: entry.arcName || undefined,         
        isFiller: entry.isFiller || false,
        fillerClassification: entry.fillerClassification || "none",
        fillerReason: entry.fillerReason || "",
        whyWatch: entry.whyWatch,
        skipWarning: entry.skipWarning || undefined, 
        watchIf: entry.watchIf || [],
        imageUrl: match?.imageUrl || match?.coverImage?.large || "", 
        trailerUrl: trailerUrl || undefined,         
        malScore: match?.averageScore ? match.averageScore / 10 : match?.score,
        anilistScore: match?.averageScore ? match.averageScore / 10 : match?.score,
        synopsis: cleanSynopsis,
        genres: match?.genres || [],
        status: match?.status,
      };
    });

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

    const filteredEntries = applyFilters(enrichedEntries, preferences);

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
