/**
 * Client-side "Focus This Season" — never re-searches.
 * Builds a single_core result from the exact entry the user clicked.
 */

import {
  WatchOrderEntryV2,
  WatchOrderResultV2,
  WatchOrderPathV2,
  WatchOrderGroup,
} from "@/types/intelligent";

function calcDurationText(entries: WatchOrderEntryV2[]): {
  text: string;
  minutes: number;
  episodes: number;
} {
  let minutes = 0;
  let episodes = 0;
  for (const e of entries) {
    const eps = e.episodeCount || 1;
    const dur = e.durationMinutes || 24;
    minutes += eps * dur;
    episodes += eps;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const text = h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  return { text, minutes, episodes };
}

export function buildFocusedResult(
  entry: WatchOrderEntryV2,
  franchiseName?: string
): WatchOrderResultV2 {
  const { text, minutes, episodes } = calcDurationText([entry]);
  const title = entry.title;
  const focusedEntry: WatchOrderEntryV2 = {
    ...entry,
    position: 1,
    groupPosition: 1,
    tier: entry.tier === "skip" ? "optional" : entry.tier,
    whyWatch:
      entry.whyWatch ||
      `Focused view of ${title}. ${episodes} episode${episodes === 1 ? "" : "s"}, ${text} total. Self-contained for now.`,
    tierReason:
      entry.tierReason ||
      "You chose Focus This Season — exact title you clicked, nothing else.",
  };

  const group: WatchOrderGroup = {
    id: "focused_season",
    name: `${title} — Focused`,
    description: `${episodes} episodes · ${text} · self-contained`,
    timelineType: "main_timeline",
    orderNote: "No related titles. This is only the season you focused.",
    entries: [focusedEntry],
    totalEntries: 1,
    totalEpisodes: episodes,
    totalTime: text,
    isCollapsedByDefault: false,
    isSpoiler: false,
    bestFor: ["Focused viewing"],
  };

  const path: WatchOrderPathV2 = {
    id: "path_focused",
    name: "This Season Only",
    description: `Focused view of ${title}`,
    groups: [group],
    totalEntries: 1,
    totalEpisodes: episodes,
    totalTime: text,
    totalTimeMinutes: minutes,
    bestFor: ["I only want this season right now"],
    difficulty: "beginner",
    isSpoilerFree: true,
    isRecommended: true,
    warnings: [],
  };

  return {
    franchise: title,
    franchiseId: `focus_${entry.id}`,
    franchiseImage: entry.coverImage?.large || entry.imageUrl || undefined,
    classification: "single_core",
    classificationReason:
      "User focused a single title from a franchise result — exact card data, no re-search.",
    summary: `Focused view of ${title}. ${episodes} episode${episodes === 1 ? "" : "s"}, ${text} total. Self-contained.`,
    whyConfusing: "Not confusing — straightforward focused season view.",
    recommendedPathId: path.id,
    paths: [path],
    totalGroups: 1,
    totalEntries: 1,
    totalEpisodes: episodes,
    totalDuration: text,
    totalDurationMinutes: minutes,
    allEntriesFlat: [focusedEntry],
    graphStats: {
      totalNodesDiscovered: 1,
      totalNodesUsed: 1,
      sources: ["anilist"],
      maxDepthTraversed: 0,
    },
    generatedAt: new Date().toISOString(),
    aiProvider: "client-focus",
    confidence: 100,
    warnings: franchiseName
      ? [`Focused from ${franchiseName}`]
      : [],
  };
}
