/**
 * useWatchOrder Hook
 * Manages watch order generation state, API calls, caching
 */

"use client";

import { useState, useCallback } from "react";
import { WatchOrderResult, UserPreferences, APIResponse } from "@/types";

interface UseWatchOrderReturn {
  result: WatchOrderResult | null;
  loading: boolean;
  error: string | null;
  provider: string | null;
  latency: number | null;
  generate: (animeName: string, preferences: UserPreferences) => Promise<void>;
  reset: () => void;
}

export function useWatchOrder(): UseWatchOrderReturn {
  const [result, setResult] = useState<WatchOrderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const generate = useCallback(
    async (animeName: string, preferences: UserPreferences) => {
      setLoading(true);
      setError(null);
      setResult(null);
      setProvider(null);
      setLatency(null);

      try {
        const res = await fetch("/api/watch-order/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ animeName, preferences }),
        });

        const data: APIResponse<WatchOrderResult> = await res.json();

        if (!data.success || !data.data) {
          throw new Error(data.error || "Failed to generate watch order");
        }

        setResult(data.data);
        setProvider(data.provider || null);
        setLatency(data.latency || null);
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
    setError(null);
    setProvider(null);
    setLatency(null);
  }, []);

  return { result, loading, error, provider, latency, generate, reset };
}
