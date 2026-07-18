/**
 * ChronoFlow Orchestrator V2.4 - Grounded Graph + Airing-Progress Grounded
 */

import { buildRelationGraph, findAllowedTitleById, findAllowedTitleByFuzzy } from "@/lib/knowledge/relation-graph";
import { classifyAnimeShape, getGroupTemplateForShape } from "@/lib/knowledge/classifier";
import { buildPromptForShape, createGenerationPayload } from "@/lib/ai/prompts";
import { callAIWithFallback } from "@/lib/ai-providers";
import { searchAnime } from "@/lib/jikan-client";
import { searchAniList } from "@/lib/anilist-client";
import { findCuratedFranchise, curatedToV2Result } from "@/lib/knowledge/curated-franchises";
import { selectBestAnimeMatch } from "@/lib/knowledge/title-matcher";
import {
  AllowedTitle,
  WatchOrderResultV2,
  WatchOrderPathV2,
  WatchOrderGroup,
  WatchOrderEntryV2,
  AIGeneratedOrderV2,
  ValidationResult,
  RelationGraph,
  ShapeDetectionResult,
} from "@/types/intelligent";

function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();
  const m = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (m) cleaned = m[1].trim();
  const fb = cleaned.indexOf("[");
  const fc = cleaned.indexOf("{");
  let s = -1, e = -1;
  if (fb !== -1 && (fc === -1 || fb < fc)) { s = fb; e = cleaned.lastIndexOf("]"); }
  else if (fc !== -1) { s = fc; e = cleaned.lastIndexOf("}"); }
  if (s !== -1 && e !== -1 && e > s) cleaned = cleaned.slice(s, e + 1);
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(?:^|\s)\/\/.*$/gm, "").replace(/,\s*([\]}])/g, "$1");
  try { return JSON.parse(cleaned); }
  catch {
    try {
      const r = cleaned.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (mm, g) => '"' + g.replace(/\n/g, "\\n") + '"');
      return JSON.parse(r);
    } catch (err) {
      console.error("JSON parse fail", cleaned.slice(0, 800));
      throw new Error("AI JSON invalid");
    }
  }
}

function parseDuration(d?: number | string, f?: string): number {
  if (typeof d === "number" && d > 0) return d;
  if (typeof d === "string") {
    const lo = d.toLowerCase();
    const mm = lo.match(/(\d+)\s*min/);
    if (mm) return parseInt(mm[1], 10);
    const hr = lo.match(/(\d+)\s*hr/);
    if (hr) return parseInt(hr[1], 10) * 60;
  }
  return f === "MOVIE" ? 90 : 24;
}

// Fixed to calculate cumulative hours based strictly on currently watchable episodes
function calcDuration(entries: WatchOrderEntryV2[]) {
  const mins = entries.reduce((s, e) => {
    const eps = typeof e.releasedEpisodeCount === "number" ? e.releasedEpisodeCount : e.episodeCount || 1;
    return s + eps * (e.durationMinutes || 24);
  }, 0);
  const h = Math.floor(mins / 60), m = mins % 60;
  return { text: h ? `${h}h ${m}m` : `${m}m`, minutes: mins };
}

export interface OrchestratorParams {
  animeName: string;
  anilistId?: number;
  malId?: number;
  scope: "season" | "franchise";
  preferences: {
    timeBudget: string;
    mood: string[];
    skipPreference: "smart-skip" | "watch-everything" | "canon-only" | "skip-all-filler";
    includeMovies: boolean;
    includeOVAs: boolean;
    includeSpecials: boolean;
    includeRecaps: boolean;
    preferredPath: "release" | "chronological" | "optimal" | "manga";
    language: "english" | "japanese" | "both";
  };
}

export interface OrchestratorResult {
  result: WatchOrderResultV2;
  provider: string;
  latency: number;
  debug: { graphSize: number; classification: ShapeDetectionResult; validation: ValidationResult; warnings: string[] };
}

function isMangaTitle(t: AllowedTitle | string): boolean {
  const title = typeof t === "string" ? t.toLowerCase() : (t.title || "").toLowerCase();
  if (title.includes("chapter 1") && title.includes("capital")) return true;
  if (title.includes("chapter 2") && title.includes("mansion")) return true;
  if ((t as AllowedTitle).format === "MANGA" as any) return true;
  return false;
}

export async function generateIntelligentWatchOrder(params: OrchestratorParams): Promise<OrchestratorResult> {
  const start = Date.now();
  const warnings: string[] = [];
  let bestMatch: any = null;

  if (params.anilistId || params.malId) {
    bestMatch = { anilistId: params.anilistId, malId: params.malId, title: params.animeName };
  } else {
    const [jRes, aRes] = await Promise.allSettled([searchAnime(params.animeName, 5), searchAniList(params.animeName, 5)]);
    const jData = jRes.status === "fulfilled" ? jRes.value : [];
    const aData = aRes.status === "fulfilled" ? aRes.value : [];
    const merged = [...jData];
    for (const ani of aData) {
      const ex = merged.find((j: any) => j.malId === ani.malId);
      if (ex) { (ex as any).anilistId = ani.anilistId; if (ani.imageUrl) (ex as any).imageUrl = ani.imageUrl; }
      else merged.push(ani as any);
    }
    bestMatch = selectBestAnimeMatch(params.animeName, merged) || merged[0];
    if (!bestMatch) throw new Error(`No anime found matching "${params.animeName}"`);
  }

  // Season scope - single entry focus
  if (params.scope === "season") {
    const { graph, allowedTitles, root } = await buildRelationGraph({
      title: bestMatch.title || params.animeName,
      anilistId: bestMatch.anilistId,
      malId: bestMatch.malId,
      scope: "season",
      maxDepth: 0,
    });
    const single = allowedTitles[0] || {
      id: `ani_${bestMatch.anilistId || 0}`,
      anilistId: bestMatch.anilistId || 0,
      malId: bestMatch.malId,
      title: bestMatch.title || params.animeName,
      normalizedTitle: (bestMatch.title || "").toLowerCase(),
      aliases: [] as string[],
      format: "TV" as any,
      episodes: (graph.root as any).episodes || 12,
      duration: 24,
      popularity: 0,
      isMainEntry: true,
    };
    const eps = (single as any).episodes || 12;
    const dur = 24;
    const totalMins = eps * dur;
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    const totalDurText = h ? `${h}h ${m}m` : `${m}m`;
    const entry: WatchOrderEntryV2 = {
      id: single.id,
      malId: (single as any).malId,
      anilistId: (single as any).anilistId,
      title: single.title,
      titleJapanese: (graph.root as any).titleNative,
      titleEnglish: single.title,
      titleRomaji: (graph.root as any).titleRomaji,
      format: (single as any).format || "TV",
      type: (single as any).format || "TV",
      tier: "essential",
      tierReason: "You selected Focus This Season - exact season you asked for",
      episodeCount: eps,
      releasedEpisodeCount: eps,
      durationMinutes: dur,
      timeEstimate: `${eps} eps × ${dur}m`,
      year: (single as any).year,
      position: 1,
      groupPosition: 1,
      prerequisites: [],
      unlocks: [],
      contentTags: [],
      isFiller: false,
      fillerType: "none" as any,
      whyWatch: `Focused view of ${single.title}. ${eps} episodes, ${totalDurText} total. Self-contained.`,
      watchIf: [],
      imageUrl: (graph.root as any).coverImage?.large || "",
      bannerUrl: undefined,
      coverImage: (graph.root as any).coverImage,
      malScore: (graph.root as any).averageScore ? (graph.root as any).averageScore / 10 : undefined,
      anilistScore: (graph.root as any).averageScore ? (graph.root as any).averageScore / 10 : undefined,
      popularity: (graph.root as any).popularity,
      synopsis: (graph.root as any).description?.replace(/<[^>]*>/g, "").slice(0, 300),
      genres: (graph.root as any).genres || [],
      status: (graph.root as any).status,
      trailerUrl: (graph.root as any).trailer?.site === "youtube" && (graph.root as any).trailer?.id ? `https://www.youtube.com/watch?v=${(graph.root as any).trailer.id}` : null,
      watched: false,
      progress: 0,
      relationType: undefined,
    } as any;
    const group: WatchOrderGroup = {
      id: "season_only",
      name: `${single.title} - Focused Season`,
      description: `${eps} episodes, ${totalDurText}`,
      timelineType: "main_timeline" as any,
      orderNote: undefined,
      entries: [entry],
      totalEntries: 1,
      totalEpisodes: eps,
      totalTime: totalDurText,
      isCollapsedByDefault: false,
      isSpoiler: false,
      bestFor: [],
    } as any;
    const path: WatchOrderPathV2 = {
      id: "path_season_only",
      name: "This Season Only",
      description: `Focused view of ${single.title}`,
      longDescription: undefined,
      groups: [group],
      totalEntries: 1,
      totalEpisodes: eps,
      totalTime: totalDurText,
      totalTimeMinutes: totalMins,
      bestFor: ["Focused viewing"],
      difficulty: "beginner" as any,
      isSpoilerFree: true,
      isRecommended: true,
      warnings: [],
    } as any;
    const result: WatchOrderResultV2 = {
      franchise: single.title,
      franchiseId: `fr_${(single as any).anilistId}`,
      franchiseImage: (graph.root as any).coverImage?.large,
      classification: "single_core" as any,
      classificationReason: "User selected Focus This Season - single entry view",
      summary: `Focused view of ${single.title}. ${eps} episodes, ${totalDurText} total.`,
      whyConfusing: `You clicked Focus This Season for ${single.title}`,
      recommendedPathId: path.id,
      paths: [path],
      totalGroups: 1,
      totalEntries: 1,
      totalEpisodes: eps,
      totalDuration: totalDurText,
      totalDurationMinutes: totalMins,
      allEntriesFlat: [entry],
      graphStats: { totalNodesDiscovered: 1, totalNodesUsed: 1, sources: ["anilist"] as any, maxDepthTraversed: 0 },
      generatedAt: new Date().toISOString(),
      aiProvider: "season-focus",
      confidence: 100,
      warnings,
      debug: { classification: { shape: "single_core" as any, confidence: 100, reasoning: "season focus", signals: {} as any }, allowedTitlesCount: 1, validationAttempts: 1 },
    } as any;
    return {
      result,
      provider: "season-focus",
      latency: Date.now() - start,
      debug: { graphSize: 1, classification: result.debug!.classification as any, validation: { isValid: true, errors: [], warnings: [], fixedEntries: 0, droppedEntries: [] }, warnings },
    };
  }

  // Curated ground truth check - for top confusing franchises
  if (params.scope === "franchise") {
    const curated = findCuratedFranchise(params.animeName);
    if (curated) {
      let rootImage: any = null;
      try {
        const rootData = await buildRelationGraph({
          title: bestMatch.title || params.animeName,
          anilistId: bestMatch.anilistId,
          malId: bestMatch.malId,
          scope: "season",
          maxDepth: 0,
        });
        rootImage = rootData.root;
      } catch {}
      const result = curatedToV2Result(curated, rootImage);
      return {
        result,
        provider: "curated-ground-truth",
        latency: Date.now() - start,
        debug: {
          graphSize: result.totalEntries,
          classification: { shape: curated.classification as any, confidence: 100, reasoning: "curated ground truth - verified", signals: {} as any },
          validation: { isValid: true, errors: [], warnings: [], fixedEntries: 0, droppedEntries: [] },
          warnings: [`Used curated ground truth for ${curated.franchise}`],
        },
      };
    }
  }

  // Franchise scope - depth 4 to capture long chains like Re:Zero S1->S2->S3->S4
  const { graph, allowedTitles: rawAllowed, root, warnings: gWarn } = await buildRelationGraph({
    title: bestMatch.title || params.animeName,
    anilistId: bestMatch.anilistId,
    malId: bestMatch.malId,
    scope: params.scope,
    maxDepth: params.scope === "franchise" ? 4 : 1,
  });
  warnings.push(...gWarn);

  const allowedTitles = rawAllowed.filter((t: any) => {
    if (isMangaTitle(t)) { warnings.push(`Filtered manga: ${t.title}`); return false; }
    const fmt = (t.format as any)?.toString().toUpperCase();
    if (["MANGA", "NOVEL", "ONE_SHOT", "MANHWA", "MANHUA"].includes(fmt)) { warnings.push(`Filtered non-anime ${fmt}: ${t.title}`); return false; }
    return true;
  });

  if (allowedTitles.length === 0) throw new Error("Failed to build franchise graph - no anime titles after filtering");

  const classification = classifyAnimeShape(graph, allowedTitles as any, root.title);
  const groupTemplates = getGroupTemplateForShape(classification.shape, graph as any);
  const whyConfusing = buildWhyConfusing(classification.shape, root.title, graph as any);

  const payload = createGenerationPayload({
    franchiseName: root.title,
    allowedTitles: allowedTitles as any,
    shape: classification.shape,
    whyConfusing,
    userPreferences: {
      skipPreference: params.preferences.skipPreference,
      includeMovies: params.preferences.includeMovies,
      includeOVAs: params.preferences.includeOVAs,
      includeSpecials: params.preferences.includeSpecials,
      mood: params.preferences.mood,
    },
    groupsTemplate: groupTemplates.map((g: any) => ({
      id: g.id,
      name: g.name,
      timelineType: g.timelineType,
      description: g.description,
      allowedEntryIds: allowedTitles.map((t: any) => t.id),
      instruction: g.description,
    })),
    graphStats: { totalNodes: graph.nodes.size, sources: ["anilist", "jikan"] },
  });

  const prompt = buildPromptForShape(classification.shape, payload);
  const aiResponse = await callAIWithFallback(prompt, 2);
  let aiData: AIGeneratedOrderV2;
  try { aiData = cleanAndParseJSON(aiResponse.content); }
  catch (e) { console.error("AI parse failed", aiResponse.content.slice(0, 1000)); throw new Error("AI returned invalid JSON"); }

  const validation = validateAndFixAIResponse(aiData, allowedTitles as any, graph as any);
  warnings.push(...validation.warnings);
  let enrichedPaths = enrichPaths(aiData, allowedTitles as any, graph as any);

  const det = buildDeterministicPaths(
    root as any,
    allowedTitles as any,
    graph as any,
    classification.shape,
    whyConfusing
  );

  const rootId = root ? `ani_${root.anilistId}` : null;
  const hasEntries = enrichedPaths.some((p) => p.groups.some((g) => g.entries.length > 0));
  const hasMainTimeline = enrichedPaths.some((p) =>
    p.groups.some((g) => g.timelineType === "main_timeline" && g.entries.length > 0)
  );
  const enoughEntries = enrichedPaths.some(
    (p) => p.totalEntries >= Math.max(3, Math.floor(allowedTitles.length * 0.4))
  );
  const rootPresent = rootId
    ? enrichedPaths.some((p) =>
        p.groups.some((g) => g.entries.some((e) => e.id === rootId))
      )
    : true;

  if (!hasEntries || !hasMainTimeline || !enoughEntries || !rootPresent) {
    if (!hasEntries) {
      enrichedPaths = det;
      warnings.push("Used deterministic graph order because AI output was empty or invalid.");
    } else if (!hasMainTimeline) {
      enrichedPaths = det;
      warnings.push("Switched to deterministic graph order because no main timeline was detected.");
    } else if (!rootPresent) {
      enrichedPaths = det;
      warnings.push(
        `Switched to deterministic graph order because the root title "${root?.title}" was missing from AI output.`
      );
    } else if (!enoughEntries && classification.shape !== "single_core") {
      enrichedPaths = det;
      warnings.push(
        "Switched to deterministic graph order because AI covered too few entries for this franchise."
      );
    }
  } else if (classification.shape === "single_core" || classification.shape === "canon_movie_sandwich") {
    enrichedPaths = interleaveMoviesIntoMainTimeline(enrichedPaths, det);
  }

  enrichedPaths = markAiringStatuses(enrichedPaths, graph as any);
  let filteredPaths = applyFiltersToPaths(enrichedPaths, params.preferences);
  filteredPaths = applyPathPreference(filteredPaths, params.preferences.preferredPath, params.preferences.mood);

  const recommended =
    filteredPaths.find((p) => p.isRecommended)?.id ||
    filteredPaths[0]?.id ||
    "path_main";

  const allFlat = filteredPaths.flatMap((p: any) => p.groups.flatMap((g: any) => g.entries));
  const { text: totalText, minutes: totalMins } = calcDuration(allFlat as any);

  const result: WatchOrderResultV2 = {
    franchise: (aiData as any).franchise || root.title,
    franchiseId: `fr_${(root as any).anilistId || (root as any).malId || Date.now()}`,
    franchiseImage: (root as any).coverImage?.large,
    classification: (aiData as any).classification || classification.shape,
    classificationReason: (aiData as any).classificationReason || classification.reasoning,
    summary: (aiData as any).summary || `Complete watch order for ${root.title}`,
    whyConfusing: (aiData as any).whyConfusing || whyConfusing, 
    recommendedPathId: recommended,
    paths: filteredPaths as any,
    totalGroups: filteredPaths.reduce((s: number, p: any) => s + p.groups.length, 0),
    totalEntries: allFlat.length,
    // GROUNDED SUM OF RELEASED WATCHABLE EPISODES ONLY
    totalEpisodes: allFlat.reduce((s: number, e: any) => s + (typeof e.releasedEpisodeCount === "number" ? e.releasedEpisodeCount : e.episodeCount || 0), 0),
    totalDuration: totalText,
    totalDurationMinutes: totalMins,
    allEntriesFlat: allFlat as any,
    graphStats: { totalNodesDiscovered: (graph as any).totalDiscovered, totalNodesUsed: allowedTitles.length, sources: ["anilist", "jikan"] as any, maxDepthTraversed: (graph as any).maxDepth },
    generatedAt: new Date().toISOString(),
    aiProvider: aiResponse.provider,
    confidence: (aiData as any).confidence || classification.confidence,
    warnings: [...((aiData as any).warnings || []), ...warnings],
    debug: { classification, allowedTitlesCount: allowedTitles.length, validationAttempts: 1 },
  } as any;

  return { result, provider: aiResponse.provider, latency: Date.now() - start, debug: { graphSize: graph.nodes.size, classification, validation, warnings } };
}

function buildWhyConfusing(shape: any, title: string, graph: RelationGraph): string {
  switch (shape) {
    case "mega_franchise": return `${title} has ${graph.nodes.size} related entries across multiple timelines and spin-offs, making it unclear where to start`;
    case "long_runner": return `${title} has ${(graph.root as any).episodes || 100}+ episodes with significant filler that disrupts pacing`;
    case "canon_movie_sandwich": return `${title} has canon movies and OVAs that directly continue the main story - skipping breaks continuity`;
    case "route_branching": return `${title} has multiple routes that are parallel realities, not sequels`;
    case "remake_divergence": return `${title} has both original and remake versions`;
    default: return `${title} watch order has optional OVAs that confuse first timers`;
  }
}

function validateAndFixAIResponse(aiData: AIGeneratedOrderV2, allowedTitles: AllowedTitle[], graph: RelationGraph): ValidationResult {
  const errors: string[] = []; const warnings: string[] = []; let fixed = 0; const dropped: string[] = [];
  const allowedIds = new Set(allowedTitles.map(t => t.id));
  const allowedAnilistIds = new Set(allowedTitles.map(t => String(t.anilistId)));
  for (const path of (aiData as any).paths || []) {
    for (const group of path.groups || []) {
      const valid: any[] = [];
      for (const entry of (group as any).entries || []) {
        const idStr = String(entry.id);
        if (isMangaTitle(idStr)) { errors.push(`Dropped manga ${idStr}`); dropped.push(idStr); continue; }
        const titleCheck = (entry as any).title || "";
        if (isMangaTitle(titleCheck)) { errors.push(`Dropped manga title ${titleCheck}`); dropped.push(idStr); continue; }
        if (allowedIds.has(idStr) || allowedAnilistIds.has(idStr) || idStr.startsWith("ani_")) {
          const found = findAllowedTitleById(allowedTitles, entry.id);
          if (found) { entry.id = found.id; valid.push(entry); }
          else if (allowedIds.has(idStr)) { valid.push(entry); }
          else {
            const fuzzy = findAllowedTitleByFuzzy(allowedTitles, (entry as any).title || "");
            if (fuzzy) { warnings.push(`Fixed ${entry.id} -> ${fuzzy.id}`); entry.id = fuzzy.id; valid.push(entry); fixed++; }
            else { errors.push(`Dropped unallowed ${entry.id}`); dropped.push(idStr); }
          }
        } else {
          const fuzzy = findAllowedTitleByFuzzy(allowedTitles, (entry as any).title || "");
          if (fuzzy) { warnings.push(`Rescued "${(entry as any).title}" ${entry.id} -> ${fuzzy.id}`); entry.id = fuzzy.id; valid.push(entry); fixed++; }
          else { errors.push(`Dropped hallucinated ${entry.id}`); dropped.push(idStr); }
        }
      }
      (group as any).entries = valid;
      if (valid.length === 0) warnings.push(`Group ${group.id} empty after validation`);
    }
  }
  return { isValid: errors.length === 0 || fixed > 0, errors, warnings, fixedEntries: fixed, droppedEntries: dropped };
}

function enrichPaths(aiData: AIGeneratedOrderV2, allowedTitles: AllowedTitle[], graph: RelationGraph): WatchOrderPathV2[] {
  const nodeMap = new Map<number, any>();
  for (const n of Array.from((graph as any).nodes.values() as any[])) {
    const nn = n as any;
    nodeMap.set(nn.anilistId, nn);
  }
  return ((aiData as any).paths || []).map((path: any) => {
    const groups: WatchOrderGroup[] = (path.groups || []).map((group: any) => {
      const entries: WatchOrderEntryV2[] = (group.entries || []).map((entry: any, idx: number) => {
        const allowed = findAllowedTitleById(allowedTitles, entry.id);
        const node = allowed ? nodeMap.get(allowed.anilistId) : null;
        const format = (node?.format || allowed?.format || "TV").toUpperCase() as any;
        
        let episodes = node?.episodes || (allowed as any)?.episodes || 12;

        // MULTI-TIER MATH SEGMENTATION GUARDS
        let rangeStr = entry.episodeRange;
        if (!rangeStr) {
          const titleMatch = (entry.title || "").match(/Eps?\s*(\d+)\s*-\s*(\d+)/i);
          if (titleMatch) {
            rangeStr = `${titleMatch[1]}-${titleMatch[2]}`;
          }
        }

        if (rangeStr) {
          const matchRange = rangeStr.match(/(\d+)\s*-\s*(\d+)/);
          if (matchRange) {
            const start = parseInt(matchRange[1], 10);
            const end = parseInt(matchRange[2], 10);
            if (start > 0 && end >= start) {
              episodes = end - start + 1;
            }
          }
        } else if (entry.episodeCount && entry.episodeCount < episodes) {
          episodes = entry.episodeCount;
        }

        // AIRING PROGRESS CALCULATION HUB
        let rawStatus = (node?.status || allowed?.status || "").toUpperCase();
        
        // DYNAMIC HALLUCINATION OMISSION FILTER
        // If the AI generated a continuation/sequel that maps back to the same original finished ID
        const cleanTitle = (entry.title || "").toLowerCase();
        if (cleanTitle.includes("upcoming") || cleanTitle.includes("announced") || cleanTitle.includes("edgerunners 2") || cleanTitle.includes("season 2") || cleanTitle.includes("continuation")) {
          rawStatus = "NOT_YET_RELEASED";
        }

        let releasedEpisodes = episodes;

        if (rawStatus === "NOT_YET_RELEASED") {
          releasedEpisodes = 0; // Upcoming show has exactly 0 released episodes
        } else if (rawStatus === "RELEASING") {
          const nextAiring = (node as any)?.nextAiringEpisode?.episode;
          if (nextAiring) {
            releasedEpisodes = Math.min(episodes, nextAiring - 1);
          } else {
            releasedEpisodes = Math.max(1, Math.min(episodes, 1));
          }
        }

        const duration = parseDuration(node?.duration || (allowed as any)?.duration, format);
        const cover = node?.coverImage;
        const trailer = node?.trailer;
        let trailerUrl: string | null = null;
        if (trailer?.site?.toLowerCase() === "youtube" && trailer?.id) trailerUrl = `https://www.youtube.com/watch?v=${trailer.id}`;
        
        const timeEst = format === "MOVIE" ? `${duration}m` : `${episodes} eps × ${duration}m`;
        const entryImage = entry.imageUrl || cover?.large || cover?.medium || "";
        
        return {
          id: entry.id, malId: allowed?.malId, anilistId: allowed?.anilistId,
          title: allowed?.title || entry.title || "Unknown",
          titleJapanese: node?.titleNative, titleEnglish: allowed?.title, titleRomaji: node?.titleRomaji,
          format, type: format, tier: entry.tier, tierReason: entry.tierReason,
          episodeCount: episodes, 
          releasedEpisodeCount: releasedEpisodes, // MAPS AIRING PROGRESS
          durationMinutes: duration, timeEstimate: timeEst,
          year: (allowed as any)?.year, position: entry.position || idx + 1, groupPosition: entry.groupPosition || idx + 1,
          prerequisites: entry.prerequisites || [], unlocks: [], watchAfter: entry.watchAfter,
          contentTags: entry.contentTags || [], arcName: entry.arcName, episodeRange: rangeStr || entry.episodeRange,
          isFiller: entry.isFiller || false, fillerType: (entry.fillerType as any) || "none", fillerReason: entry.fillerReason,
          whyWatch: entry.whyWatch, skipWarning: entry.skipWarning, watchIf: entry.watchIf || [],
          imageUrl: entryImage, bannerUrl: undefined, coverImage: cover,
          malScore: node?.averageScore ? node.averageScore / 10 : undefined,
          anilistScore: node?.averageScore ? node.averageScore / 10 : undefined,
          popularity: node?.popularity, synopsis: node?.description ? node.description.replace(/<[^>]*>/g, "").slice(0, 300) : undefined,
          genres: node?.genres || [], status: node?.status, trailerUrl, watched: false, progress: 0,
          innerOrder: entry.innerOrder ? { totalEpisodes: episodes, canonEpisodes: 0, fillerEpisodes: 0, ranges: (entry.innerOrder.ranges || []).map((r: any) => ({ start: r.start, end: r.end, type: r.type as any, title: r.title })), skipEpisodes: entry.innerOrder.skipEpisodes || [], watchEpisodes: [] } : undefined,
          relationType: node?.relationType,
        } as any;
      });
      const totEp = entries.reduce((s, e) => s + (typeof e.releasedEpisodeCount === "number" ? e.releasedEpisodeCount : e.episodeCount || 0), 0);
      const { text: totTime } = calcDuration(entries as any);
      return {
        id: group.id, name: group.name, description: group.description, timelineType: group.timelineType as any,
        orderNote: group.orderNote, entries, totalEntries: entries.length, totalEpisodes: totEp, totalTime: totTime,
        isCollapsedByDefault: group.timelineType === "spin_off" || group.timelineType === "side_story", isSpoiler: false, bestFor: [],
      } as any;
    });
    const all = groups.flatMap(g => g.entries);
    const { text: tt, minutes: tm } = calcDuration(all as any);
    return {
      id: path.id, name: path.name, description: path.description, longDescription: undefined,
      groups, totalEntries: all.length, totalEpisodes: all.reduce((s, e) => s + (typeof e.releasedEpisodeCount === "number" ? e.releasedEpisodeCount : e.episodeCount || 0), 0),
      totalTime: tt, totalTimeMinutes: tm, bestFor: path.bestFor || [], difficulty: path.difficulty || "beginner",
      isSpoilerFree: path.isSpoilerFree ?? true, isRecommended: path.isRecommended || false, warnings: path.warnings || [],
    } as any;
  });
}

function applyFiltersToPaths(paths: WatchOrderPathV2[], prefs: { includeMovies: boolean; includeOVAs: boolean; includeSpecials: boolean; includeRecaps: boolean; skipPreference: string; }): WatchOrderPathV2[] {
  return paths.map((p: any) => {
    const groups = p.groups.map((g: any) => {
      let e = [...g.entries];
      if (prefs.includeMovies === false) {
        e = e.filter((x: any) => x.format !== "MOVIE" || x.tier === "essential");
      }
      if (prefs.includeOVAs === false) {
        e = e.filter((x: any) => (x.format !== "OVA" && x.format !== "ONA") || x.tier === "essential");
      }
      if (prefs.includeSpecials === false) {
        e = e.filter((x: any) => x.format !== "SPECIAL" || x.tier === "essential");
      }

      const skip = prefs.skipPreference;
      if (skip === "canon-only") {
        e = e.filter((x: any) => x.tier === "essential");
      } else if (skip === "smart-skip" || skip === "skip-all-filler") {
        e = e.filter(
          (x: any) =>
            x.tier !== "skip" &&
            x.fillerType !== "recap" &&
            x.fillerType !== "pure_filler"
        );
      }

      const totEp = e.reduce((s: number, x: any) => s + (typeof x.releasedEpisodeCount === "number" ? x.releasedEpisodeCount : x.episodeCount || 0), 0);
      const { text } = calcDuration(e as any);
      return {
        ...g,
        entries: e,
        totalEntries: e.length,
        totalEpisodes: totEp,
        totalTime: text,
      };
    }).filter((g: any) => g.entries.length > 0);

    const all = groups.flatMap((g: any) => g.entries);
    const { text, minutes } = calcDuration(all as any);
    return {
      ...p,
      groups,
      totalEntries: all.length,
      totalEpisodes: all.reduce((s: number, x: any) => s + (typeof x.releasedEpisodeCount === "number" ? x.releasedEpisodeCount : x.episodeCount || 0), 0),
      totalTime: text,
      totalTimeMinutes: minutes,
    };
  }).filter((p: any) => p.groups.length > 0) as any;
}

function applyPathPreference(
  paths: WatchOrderPathV2[],
  preferredPath: string,
  mood?: string[]
): WatchOrderPathV2[] {
  if (!paths.length) return paths;
  const lower = (s: string) => s.toLowerCase();
  let pickId: string | null = null;

  if (preferredPath === "chronological") {
    pickId =
      paths.find((p) => lower(p.name).includes("chrono") || lower(p.id).includes("chrono"))?.id ||
      null;
  } else if (preferredPath === "release") {
    pickId =
      paths.find((p) => lower(p.name).includes("release") || lower(p.id).includes("release"))?.id ||
      null;
  } else {
    pickId =
      paths.find((p) => p.isRecommended)?.id ||
      paths.find((p) => lower(p.name).includes("spoiler") || lower(p.name).includes("recommended") || lower(p.name).includes("optimal"))?.id ||
      paths[0]?.id ||
      null;
  }

  const moods = (mood || []).filter((m) => m !== "all");
  if (moods.includes("mindfuck")) {
    const alt = paths.find((p) => lower(p.name).includes("route") || lower(p.name).includes("true"));
    if (alt) pickId = alt.id;
  }

  return paths.map((p) => ({
    ...p,
    isRecommended: pickId ? p.id === pickId : p.isRecommended,
  }));
}

function markAiringStatuses(paths: WatchOrderPathV2[], graph: RelationGraph): WatchOrderPathV2[] {
  const nodeMap = new Map<number, any>();
  for (const n of Array.from((graph as any).nodes?.values?.() || [])) {
    nodeMap.set((n as any).anilistId, n);
  }
  return paths.map((p) => ({
    ...p,
    groups: p.groups.map((g) => ({
      ...g,
      entries: g.entries.map((e) => {
        const node = e.anilistId ? nodeMap.get(e.anilistId) : null;
        let status = (node?.status || e.status || "").toUpperCase();
        
        // DYNAMIC HALLUCINATION OMISSION FILTER
        const cleanTitle = (e.title || "").toLowerCase();
        if (cleanTitle.includes("upcoming") || cleanTitle.includes("announced") || cleanTitle.includes("edgerunners 2") || cleanTitle.includes("season 2") || cleanTitle.includes("continuation")) {
          status = "NOT_YET_RELEASED";
        }

        if (status === "RELEASING" || status === "NOT_YET_RELEASED") {
          return {
            ...e,
            status: status === "RELEASING" ? "Airing" : "Upcoming",
            whyWatch:
              (e.whyWatch || "") +
              (status === "RELEASING"
                ? " Currently airing — total time will increase as more episodes drop."
                : " Announced / upcoming — not fully out yet."),
          };
        }
        return e;
      }),
    })),
  })) as any;
}

function buildDeterministicPaths(
  root: any,
  allowed: AllowedTitle[],
  graph: RelationGraph,
  shape: string,
  whyConfusing: string
): WatchOrderPathV2[] {
  const nodeMap = new Map<number, any>();
  for (const n of Array.from((graph as any).nodes?.values?.() || [])) {
    nodeMap.set((n as any).anilistId, n);
  }

  const sorted = [...allowed].sort((a, b) => {
    const ya = a.year || 9999;
    const yb = b.year || 9999;
    if (ya !== yb) return ya - yb;
    return (b.popularity || 0) - (a.popularity || 0);
  });

  const entries: WatchOrderEntryV2[] = sorted.map((t, idx) => {
    const node = nodeMap.get(t.anilistId);
    const format = (t.format || "TV").toUpperCase() as any;
    const episodes = t.episodes || node?.episodes || (format === "MOVIE" ? 1 : 12);
    const duration = parseDuration(node?.duration || t.duration, format);
    const rel = (t.relationType || "").toLowerCase();
    const isMovieLike = format === "MOVIE" || format === "OVA";
    let tier: any = "essential";
    if (rel.includes("spin") || rel.includes("character") || format === "SPECIAL") tier = "optional";
    if (rel.includes("summary") || rel.includes("other")) tier = "skip";
    if (isMovieLike && (rel.includes("sequel") || rel.includes("side") || rel.includes("parent") || shape === "canon_movie_sandwich")) {
      tier = "essential";
    }
    const cover = node?.coverImage;
    const trailer = node?.trailer;
    let trailerUrl: string | null = null;
    if (trailer?.site?.toLowerCase() === "youtube" && trailer?.id) {
      trailerUrl = `https://www.youtube.com/watch?v=${trailer.id}`;
    }
    const timeEst = format === "MOVIE" ? `${duration}m` : `${episodes} eps × ${duration}m`;
    
    // DETERMINISTIC AIRING PROGRESS COHERENCE MAPPING
    const rawStatus = (node?.status || t.status || "").toUpperCase();
    let releasedEpisodes = episodes;
    if (rawStatus === "NOT_YET_RELEASED") {
      releasedEpisodes = 0;
    } else if (rawStatus === "RELEASING") {
      const nextAiring = (node as any)?.nextAiringEpisode?.episode || (t as any)?.nextAiringEpisode?.episode;
      if (nextAiring) {
        releasedEpisodes = Math.min(episodes, nextAiring - 1);
      } else {
        releasedEpisodes = Math.max(1, Math.min(episodes, 1));
      }
    }

    return {
      id: t.id,
      malId: t.malId,
      anilistId: t.anilistId,
      title: t.title,
      titleEnglish: t.title,
      titleRomaji: node?.titleRomaji,
      titleJapanese: node?.titleNative,
      format,
      type: format,
      tier,
      tierReason:
        tier === "essential"
          ? isMovieLike
            ? "Canon continuation — watch in this position, not as optional extras"
            : "Main story entry in release/year order"
          : tier === "optional"
            ? "Side content — watch if you want more of this world"
            : "Low priority / recap-style",
      episodeCount: episodes,
      releasedEpisodeCount: releasedEpisodes, // MAPS AIRING PROGRESS FOR FALLBACK COHERENCE
      durationMinutes: duration,
      timeEstimate: timeEst,
      year: t.year,
      position: idx + 1,
      groupPosition: idx + 1,
      prerequisites: [],
      unlocks: [],
      watchAfter: idx > 0 ? `Watch after ${sorted[idx - 1].title}` : undefined,
      contentTags: [],
      isFiller: tier === "skip",
      fillerType: tier === "skip" ? "recap" : "none",
      whyWatch: `${t.title}${t.year ? ` (${t.year})` : ""}. ${format}${episodes ? ` · ${episodes} eps` : ""}. Grounded from AniList relation graph.`,
      watchIf: [],
      imageUrl: cover?.large || cover?.medium || "",
      coverImage: cover,
      malScore: node?.averageScore ? node.averageScore / 10 : undefined,
      anilistScore: node?.averageScore ? node.averageScore / 10 : undefined,
      popularity: t.popularity,
      synopsis: node?.description?.replace(/<[^>]*>/g, "").slice(0, 300),
      genres: node?.genres || [],
      status: node?.status,
      trailerUrl,
      watched: false,
      progress: 0,
      relationType: t.relationType,
    } as any;
  });

  const main = entries.filter((e) => e.tier === "essential" || e.tier === "recommended");
  const side = entries.filter((e) => e.tier === "optional" || e.tier === "skip");

  const { text: mainTime, minutes: mainMins } = calcDuration(main);
  const groups: WatchOrderGroup[] = [
    {
      id: "main_timeline",
      name:
        shape === "canon_movie_sandwich"
          ? "Main Timeline — TV + Canon Movies/OVAs"
          : "Main Timeline",
      description:
        shape === "canon_movie_sandwich"
          ? "Movies and OVAs that continue the story sit here in order — not optional extras"
          : "Watch in this order (year / sequel chain)",
      timelineType: "main_timeline",
      orderNote: whyConfusing,
      entries: main.length ? main : entries,
      totalEntries: (main.length ? main : entries).length,
      totalEpisodes: (main.length ? main : entries).reduce((s, e) => s + (typeof e.releasedEpisodeCount === "number" ? e.releasedEpisodeCount : e.episodeCount || 0), 0),
      totalTime: mainTime,
      isCollapsedByDefault: false,
      isSpoiler: false,
      bestFor: ["First time"],
    } as any,
  ];

  if (side.length && shape !== "single_core") {
    const { text: sideTime } = calcDuration(side);
    groups.push({
      id: "side_optional",
      name: "Side Stories & Optional",
      description: "Spin-offs, specials, recaps — optional unless you chose Watch Everything",
      timelineType: "side_story",
      entries: side,
      totalEntries: side.length,
      totalEpisodes: side.reduce((s, e) => s + (typeof e.releasedEpisodeCount === "number" ? e.releasedEpisodeCount : e.episodeCount || 0), 0),
      totalTime: sideTime,
      isCollapsedByDefault: true,
      isSpoiler: false,
      bestFor: [],
    } as any);
  }

  const all = groups.flatMap((g) => g.entries);
  const { text, minutes } = calcDuration(all);
  return [
    {
      id: "path_optimal",
      name: "Optimal (Spoiler-Safe)",
      description: "Release / year order that preserves story reveals",
      groups,
      totalEntries: all.length,
      totalEpisodes: all.reduce((s, e) => s + (typeof e.releasedEpisodeCount === "number" ? e.releasedEpisodeCount : e.episodeCount || 0), 0),
      totalTime: text,
      totalTimeMinutes: minutes,
      bestFor: ["First time viewers"],
      difficulty: "beginner",
      isSpoilerFree: true,
      isRecommended: true,
      warnings: [],
    } as any,
  ];
}

function interleaveMoviesIntoMainTimeline(
  aiPaths: WatchOrderPathV2[],
  detPaths: WatchOrderPathV2[]
): WatchOrderPathV2[] {
  if (!aiPaths.length) return detPaths;
  const main = aiPaths[0]?.groups?.find((g) => g.timelineType === "main_timeline");
  const hasCanonMovie =
    main?.entries?.some(
      (e) =>
        (e.format === "MOVIE" || e.format === "OVA") &&
        (e.tier === "essential" || e.tier === "recommended")
    ) ?? false;
  if (hasCanonMovie) return aiPaths;
  return detPaths.length ? detPaths : aiPaths;
}
