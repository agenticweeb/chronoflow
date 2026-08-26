"use client";

import { useCallback, useEffect, useRef } from "react";
import { encodeCheckpoint, decodeCheckpoint } from "@/lib/checkpoint";
import { useWatchStore } from "@/lib/store";

const DEBOUNCE_MS = 1500;

export function useCheckpointSync(franchiseId: string) {
  const progressMap = useWatchStore((s) => s.progressMap);
  const hydrateFromCheckpoint = useWatchStore((s) => s.hydrateFromCheckpoint);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined" || !franchiseId) return;
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    const checkpoint = decodeCheckpoint(hash);
    if (checkpoint && checkpoint.franchiseId === franchiseId) {
      hydrateFromCheckpoint(franchiseId, checkpoint.completed);
    }
  }, [franchiseId, hydrateFromCheckpoint]);

  useEffect(() => {
    if (!franchiseId) return;
    const progress = progressMap[franchiseId];
    if (!progress) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const completed = Object.entries(progress.entries)
        .filter(([_, p]) => p.watched)
        .map(([id, _]) => id);

      if (completed.length === 0) {
        if (window.location.hash) {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        return;
      }

      const state = {
        franchiseId,
        completed,
        updatedAt: Date.now(),
        v: 1,
      };

      const encoded = encodeCheckpoint(state);
      if (encoded !== window.location.hash.replace(/^#/, '')) {
        history.replaceState(null, '', `#${encoded}`);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [franchiseId, progressMap]);

  const copyShareUrl = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    navigator.clipboard.writeText(url.toString());
  }, []);

  return { copyShareUrl };
}
