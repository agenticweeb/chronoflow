/**
 * useProgress Hook
 * Manages user watch progress in localStorage
 * Persists across sessions, no server needed
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProgress, EntryProgress, WatchOrderEntry } from "@/types";

const PROGRESS_KEY = "chronoflow_progress";

export function useProgress(franchiseId: string) {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${PROGRESS_KEY}_${franchiseId}`);
      if (raw) {
        setProgress(JSON.parse(raw));
      } else {
        setProgress({
          franchiseId,
          entries: {},
          startedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          totalWatched: 0,
          totalEpisodes: 0,
        });
      }
    } catch {
      setProgress({
        franchiseId,
        entries: {},
        startedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalWatched: 0,
        totalEpisodes: 0,
      });
    }
  }, [franchiseId]);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    if (progress) {
      localStorage.setItem(
        `${PROGRESS_KEY}_${franchiseId}`,
        JSON.stringify(progress)
      );
    }
  }, [progress, franchiseId]);

  const toggleWatched = useCallback(
    (entryId: string, entry: WatchOrderEntry) => {
      setProgress((prev) => {
        if (!prev) return prev;
        const isWatched = !prev.entries[entryId]?.watched;
        const episodes = entry.episodeCount || 1;

        return {
          ...prev,
          entries: {
            ...prev.entries,
            [entryId]: {
              watched: isWatched,
              episodesWatched: isWatched ? episodes : 0,
              watchedAt: isWatched ? new Date().toISOString() : undefined,
            },
          },
          totalWatched: isWatched
            ? prev.totalWatched + episodes
            : Math.max(0, prev.totalWatched - episodes),
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    []
  );

  const updateProgress = useCallback(
    (entryId: string, episodesWatched: number, entry: WatchOrderEntry) => {
      setProgress((prev) => {
        if (!prev) return prev;
        const maxEpisodes = entry.episodeCount || 1;
        const clamped = Math.max(0, Math.min(episodesWatched, maxEpisodes));
        const oldCount = prev.entries[entryId]?.episodesWatched || 0;

        return {
          ...prev,
          entries: {
            ...prev.entries,
            [entryId]: {
              watched: clamped >= maxEpisodes,
              episodesWatched: clamped,
              watchedAt:
                clamped >= maxEpisodes
                  ? new Date().toISOString()
                  : prev.entries[entryId]?.watchedAt,
            },
          },
          totalWatched: prev.totalWatched - oldCount + clamped,
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    []
  );

  const rateEntry = useCallback((entryId: string, rating: number) => {
    setProgress((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [entryId]: {
            ...prev.entries[entryId],
            rating: Math.max(1, Math.min(10, rating)),
          },
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const addNote = useCallback((entryId: string, note: string) => {
    setProgress((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [entryId]: {
            ...prev.entries[entryId],
            notes: note,
          },
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const getCompletionRate = useCallback(() => {
    if (!progress) return 0;
    const total = Object.keys(progress.entries).length;
    if (total === 0) return 0;
    const watched = Object.values(progress.entries).filter(
      (e) => e.watched
    ).length;
    return Math.round((watched / total) * 100);
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
