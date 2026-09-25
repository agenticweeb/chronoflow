import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

interface AniListPage<T> {
  success: boolean;
  data?: {
    cards?: T[];
    items?: T[];
    pageInfo: {
      currentPage: number;
      hasNextPage: boolean;
    };
  };
  error?: string;
}

// Relax the constraint to accept optional anilistId
export function useAniListInfiniteQuery<T extends { anilistId?: number }>(
  queryKey: unknown[],
  fetcher: (pageParam: number) => Promise<AniListPage<T>>,
  options?: { enabled?: boolean; staleTime?: number; maxPages?: number }
) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const res = await fetcher(pageParam as number);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.success && lastPage.data?.pageInfo.hasNextPage
        ? lastPage.data.pageInfo.currentPage + 1
        : undefined,
    enabled: options?.enabled,
    staleTime: options?.staleTime ?? 1000 * 60 * 5,
    maxPages: options?.maxPages ?? 10,
    placeholderData: (prev: any) => prev,
  });

  const cards = useMemo(() => {
    const seen = new Set<number>();
    const out: T[] = [];
    for (const page of query.data?.pages ?? []) {
      if (!page.success || !page.data) continue;
      const items = page.data.cards || page.data.items || [];
      for (const item of items) {
        if (item.anilistId === undefined) {
          out.push(item);
          continue;
        }
        if (seen.has(item.anilistId)) continue;
        seen.add(item.anilistId);
        out.push(item);
      }
    }
    return out;
  }, [query.data]);

  return {
    cards,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
