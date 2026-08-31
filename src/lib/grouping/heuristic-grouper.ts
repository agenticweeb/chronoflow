import type { WatchOrderEntryV2 } from "@/types/intelligent";

export interface ArcGroup {
  id: string;
  name: string;
  entries: WatchOrderEntryV2[];
}

/**
 * Groups a flat list of entries into "Arcs" or "Seasons" based on AniList mediaId changes.
 * If the franchise is too short to group, it falls back to a single flat group.
 */
export function groupByHeuristic(entries: WatchOrderEntryV2[]): ArcGroup[] {
  if (!entries || entries.length === 0) return [];
  if (entries.length <= 4) {
    return [{ id: 'flat', name: 'Main Timeline', entries }];
  }

  const groups: ArcGroup[] = [];
  let currentGroup: WatchOrderEntryV2[] = [];
  let currentMediaId = entries[0].anilistId;
  let groupIndex = 1;

  for (const entry of entries) {
    // If the media ID changes and the format is TV, we assume it's a new season/cour
    if (entry.anilistId !== currentMediaId && entry.format === "TV" && currentGroup.length > 0) {
      groups.push({
        id: `arc-${groupIndex}`,
        name: currentGroup[0].titleEnglish || currentGroup[0].title || `Season ${groupIndex}`,
        entries: currentGroup
      });
      currentGroup = [];
      groupIndex++;
    }
    currentGroup.push(entry);
    currentMediaId = entry.anilistId;
  }

  // Push the final group
  if (currentGroup.length > 0) {
    groups.push({
      id: `arc-${groupIndex}`,
      name: currentGroup[0].titleEnglish || currentGroup[0].title || `Season ${groupIndex}`,
      entries: currentGroup
    });
  }

  // Fallback: if grouping resulted in only 1 group, just return it as is to avoid nested UI clutter
  if (groups.length === 1) {
    return groups;
  }

  return groups;
}
