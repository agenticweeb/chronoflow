import { getCuratedArcMap } from '@/data/arc-maps';
import type { WatchOrderEntryV2 } from '@/types/intelligent';

export interface ArcGroup {
  id: string;
  name: string;
  entries: WatchOrderEntryV2[];
}

/**
 * Groups entries into Arcs.
 * 1. Expands single-entry long runners (e.g., One Piece) into curated arcs.
 * 2. Falls back to deterministic mediaId grouping for multi-season franchises.
 */
export function groupByHeuristic(entries: WatchOrderEntryV2[], rootAnilistId?: number): ArcGroup[] {
  if (!entries || entries.length === 0) return [];
  
  // 1. Check for Curated Map (Expansion Logic)
  if (rootAnilistId) {
    const curatedMap = getCuratedArcMap(rootAnilistId);
    if (curatedMap) {
      const expandedGroups: ArcGroup[] = [];
      
      for (const entry of entries) {
        // If this entry is the long runner we have a map for, split it
        if (curatedMap.primaryMediaIds.includes(entry.anilistId || 0)) {
          for (const arc of curatedMap.arcs) {
            const range = arc.ranges[0];
            const start = range.startEpisode;
            // If endEpisode is Infinity, use the entry's total episodes
            const end = range.endEpisode === Infinity ? (entry.episodeCount || 9999) : range.endEpisode;
            const count = start > end ? 0 : (end - start + 1);
            
            // Create a synthetic entry for this arc
            const arcEntry: WatchOrderEntryV2 = {
              ...entry,
              id: `${entry.id}-${arc.id}`,
              title: arc.name, // Title becomes "East Blue Saga"
              arcName: arc.shortName || arc.name,
              episodeRange: `${start}-${end}`,
              episodeCount: count,
            };
            
            expandedGroups.push({
              id: arc.id,
              name: arc.name,
              entries: [arcEntry]
            });
          }
        } else {
          // If it's a movie/OVA attached to the franchise, keep it as its own group
          expandedGroups.push({ id: entry.id, name: entry.title, entries: [entry] });
        }
      }
      return expandedGroups;
    }
  }

  // 2. Heuristic Fallback (Multi-season TV shows)
  if (entries.length <= 4) {
    return [{ id: 'flat', name: 'Main Timeline', entries }];
  }

  const groups: ArcGroup[] = [];
  let currentGroup: WatchOrderEntryV2[] = [];
  let currentMediaId = entries[0].anilistId;
  let groupIndex = 1;

  for (const entry of entries) {
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

  if (currentGroup.length > 0) {
    groups.push({
      id: `arc-${groupIndex}`,
      name: currentGroup[0].titleEnglish || currentGroup[0].title || `Season ${groupIndex}`,
      entries: currentGroup
    });
  }

  if (groups.length === 1) {
    return groups;
  }

  return groups;
}
