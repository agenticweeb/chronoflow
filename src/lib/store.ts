import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProgress, EntryProgress } from "@/types";

interface WatchStoreState {
  progressMap: Record<string, UserProgress>;
  // Audio Settings
  isAudioEnabled: boolean;
  toggleAudio: () => void;
  // Progress Actions
  toggleWatched: (franchiseId: string, entryId: string, episodeCount: number) => void;
  updateProgress: (franchiseId: string, entryId: string, episodesWatched: number, maxEpisodes: number) => void;
  rateEntry: (franchiseId: string, entryId: string, rating: number) => void;
  addNote: (franchiseId: string, entryId: string, note: string) => void;
  getProgress: (franchiseId: string) => UserProgress | null;
}

export const useWatchStore = create<WatchStoreState>()(
  persist(
    (set, get) => ({
      progressMap: {},
      
      // Audio Settings Implementation
      isAudioEnabled: false, // Default to false (browser autoplay policy)
      toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),

      getProgress: (franchiseId) => {
        return get().progressMap[franchiseId] || null;
      },

      toggleWatched: (franchiseId, entryId, episodeCount) => {
        set((state) => {
          const franchise = state.progressMap[franchiseId] || {
            franchiseId,
            entries: {},
            startedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            totalWatched: 0,
            totalEpisodes: 0,
          };

          const isWatched = !franchise.entries[entryId]?.watched;
          const episodes = episodeCount || 1;

          const updatedFranchise: UserProgress = {
            ...franchise,
            entries: {
              ...franchise.entries,
              [entryId]: {
                watched: isWatched,
                episodesWatched: isWatched ? episodes : 0,
                maxEpisodes: episodes, // <--- ADD THIS LINE
                watchedAt: isWatched ? new Date().toISOString() : undefined,
              },
            },
            totalWatched: isWatched
              ? franchise.totalWatched + episodes
              : Math.max(0, franchise.totalWatched - episodes),
            lastUpdated: new Date().toISOString(),
          };

          return { progressMap: { ...state.progressMap, [franchiseId]: updatedFranchise } };
        });
      },

      updateProgress: (franchiseId, entryId, episodesWatched, maxEpisodes) => {
        set((state) => {
          const franchise = state.progressMap[franchiseId];
          if (!franchise) return state;

          const clamped = Math.max(0, Math.min(episodesWatched, maxEpisodes));
          const oldCount = franchise.entries[entryId]?.episodesWatched || 0;

          const updatedFranchise: UserProgress = {
            ...franchise,
            entries: {
              ...franchise.entries,
              [entryId]: {
                watched: clamped >= maxEpisodes,
                episodesWatched: clamped,
                maxEpisodes: maxEpisodes, // <--- ADD THIS LINE
                watchedAt: clamped >= maxEpisodes ? new Date().toISOString() : franchise.entries[entryId]?.watchedAt,
              },
            },
            totalWatched: franchise.totalWatched - oldCount + clamped,
            lastUpdated: new Date().toISOString(),
          };

          return { progressMap: { ...state.progressMap, [franchiseId]: updatedFranchise } };
        });
      },

      rateEntry: (franchiseId, entryId, rating) => {
        set((state) => {
          const franchise = state.progressMap[franchiseId];
          if (!franchise) return state;
          
          const updatedFranchise = {
            ...franchise,
            entries: {
              ...franchise.entries,
              [entryId]: {
                ...franchise.entries[entryId],
                rating: Math.max(1, Math.min(10, rating)),
              },
            },
            lastUpdated: new Date().toISOString(),
          };
          return { progressMap: { ...state.progressMap, [franchiseId]: updatedFranchise } };
        });
      },

      addNote: (franchiseId, entryId, note) => {
        set((state) => {
          const franchise = state.progressMap[franchiseId];
          if (!franchise) return state;
          
          const updatedFranchise = {
            ...franchise,
            entries: {
              ...franchise.entries,
              [entryId]: {
                ...franchise.entries[entryId],
                notes: note,
              },
            },
            lastUpdated: new Date().toISOString(),
          };
          return { progressMap: { ...state.progressMap, [franchiseId]: updatedFranchise } };
        });
      },
    }),
    {
      name: "myaniwatchorder-progress-v2", // LocalStorage key
    }
  )
);
