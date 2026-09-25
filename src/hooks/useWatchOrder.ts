/**
 * useWatchOrder — franchise generate by default.
 * Focus season is client-side (see focus-entry.ts), not a re-generate.
 */

"use client";

import { useState, useCallback } from "react";
import { UserPreferences } from "@/types";
import { WatchOrderResultV2 } from "@/types/intelligent";

interface UseWatchOrderReturn {
  result: any | null;
  resultV2: WatchOrderResultV2 | null;
  loading: boolean;
  error: string | null;
  provider: string | null;
  latency: number | null;
  debug?: any;
  generate: (
    animeName: string,
    preferences: UserPreferences,
    selectedAnime?: any
  ) => Promise<void>;
  reset: () => void;
}

export function useWatchOrder(): UseWatchOrderReturn {
  const [result, setResult] = useState<any | null>(null);
  const [resultV2, setResultV2] = useState<WatchOrderResultV2 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [debug, setDebug] = useState<any>(null);

  const generate = useCallback(
    async (
      animeName: string,
      preferences: UserPreferences,
      selectedAnime?: any
    ) => {
      setLoading(true);
      setError(null);
      setResult(null);
      setResultV2(null);
      try {
        // Product rule: Generate = franchise by default.
        // Season focus is client-side only.
        const scope = "franchise";
        const payload: any = { animeName, preferences, scope };

        if (selectedAnime?.anilistId) payload.anilistId = selectedAnime.anilistId;
        if (selectedAnime?.malId) payload.malId = selectedAnime.malId;
        if (selectedAnime?.id && !payload.anilistId && !payload.malId) {
          // Prefer treating search id as anilist when present
          if (selectedAnime.anilistId) payload.anilistId = selectedAnime.anilistId;
          else payload.id = selectedAnime.id;
        }

        const res = await fetch("/api/watch-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to generate watch order");
        }

        if (json.dataV2) {
          setResultV2(json.dataV2);
          setResult(json.data);
        } else if (json.data?.paths?.[0]?.groups) {
          setResultV2(json.data as WatchOrderResultV2);
        } else {
          setResult(json.data);
        }
        setProvider(json.provider || null);
        setLatency(json.latency || null);
        setDebug(json.debug || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setResultV2(null);
    setError(null);
    setProvider(null);
    setLatency(null);
    setDebug(null);
  }, []);

  return {
    result,
    resultV2,
    loading,
    error,
    provider,
    latency,
    debug,
    generate,
    reset,
  };
}
