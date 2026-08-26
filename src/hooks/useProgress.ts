"use client";

import { useCallback, useMemo } from "react";
import { useWatchStore } from "@/lib/store";
import { UserProgress, WatchOrderEntry } from "@/types";

export function useProgress(franchiseId: string) {
  const progress = useWatchStore((state) => state.progressMap[franchiseId] || null);
  const toggleWatchedStore = useWatchStore((state) => state.toggleWatched);
  const updateProgressStore = useWatchStore((state) => state.updateProgress);
  const rateEntryStore = useWatchStore((state) => state.rateEntry);
  const addNoteStore = useWatchStore((state) => state.addNote);

  const toggleWatched = useCallback(
    (entryId: string, entry: WatchOrderEntry) => {
      toggleWatchedStore(franchiseId, entryId, entry.episodeCount || 1);
    },
    [franchiseId, toggleWatchedStore]
  );

  const updateProgress = useCallback(
    (entryId: string, episodesWatched: number, entry: WatchOrderEntry) => {
      updateProgressStore(franchiseId, entryId, episodesWatched, entry.episodeCount || 1);
    },
    [franchiseId, updateProgressStore]
  );

  const rateEntry = useCallback(
    (entryId: string, rating: number) => {
      rateEntryStore(franchiseId, entryId, rating);
    },
    [franchiseId, rateEntryStore]
  );

  const addNote = useCallback(
    (entryId: string, note: string) => {
      addNoteStore(franchiseId, entryId, note);
    },
    [franchiseId, addNoteStore]
  );

  const getCompletionRate = useCallback(() => {
    if (!progress) return 0;
    const entries = Object.values(progress.entries);
    if (entries.length === 0) return 0;
    
    // Calculate based on EPISODES, not just entry count
    const totalEpisodes = entries.reduce((sum, e) => sum + (e.maxEpisodes || 1), 0);
    const watchedEpisodes = entries.reduce((sum, e) => sum + (e.watched ? (e.maxEpisodes || 1) : (e.episodesWatched || 0)), 0);
    
    if (totalEpisodes === 0) return 0;
    return Math.round((watchedEpisodes / totalEpisodes) * 100);
  }, [progress]);

  const generateShareCode = useCallback(() => {
    if (!progress) return "";
    const code = btoa(
      JSON.stringify({
        f: progress.franchiseId,
        e: Object.entries(progress.entries).map(([id, p]) => [
          id,
          p.watched,
          p.episodesWatched,
        ]),
      })
    );
    return code;
  }, [progress]);

  return {
    progress,
    toggleWatched,
    updateProgress,
    rateEntry,
    addNote,
    getCompletionRate,
    generateShareCode,
  };
}
