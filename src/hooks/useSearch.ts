/**
 * useSearch Hook
 * Debounced anime search with loading states
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { AnimeSearchResult } from "@/types";
import { debounce } from "@/lib/utils";

interface UseSearchReturn {
  results: AnimeSearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
  clear: () => void;
}

export function useSearch(): UseSearchReturn {
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/search/?q=${encodeURIComponent(query)}&limit=8`,
        {
          signal: abortControllerRef.current.signal,
        }
      );

      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(debounce(doSearch, 300), [doSearch]);
  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, clear };
}
