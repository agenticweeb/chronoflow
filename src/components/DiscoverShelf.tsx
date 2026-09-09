"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchShelfPageAction } from "@/app/actions";
import { DiscoverCard } from "@/components/DiscoverCard";
import { cn } from "@/lib/utils";
import type { DiscoverCardData, ShelfRecipe } from "@/lib/discover/shelf-recipes";

interface DiscoverShelfProps {
  recipe: ShelfRecipe;
  onSelect: (card: DiscoverCardData) => void;
}

function ShelfCardSkeleton() {
  return (
    <div className="w-[140px] sm:w-[160px] shrink-0">
      <div className="skeleton aspect-[2/3] rounded-xl border border-chrono-border/10" />
      <div className="skeleton mt-2 h-3 w-3/4 rounded" />
    </div>
  );
}

export function DiscoverShelf({ recipe, onSelect }: DiscoverShelfProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    // Client cache key mirrors the server Redis namespace (shelf_v1)
    queryKey: ["shelf_v1", recipe.id],
    queryFn: ({ pageParam }) => fetchShelfPageAction(recipe.id, pageParam),
    initialPageParam: 1,
    // The ONLY trusted pagination signal — AniList's total/lastPage are unreliable
    getNextPageParam: (lastPage) =>
      lastPage.success && lastPage.data.pageInfo.hasNextPage
        ? lastPage.data.pageInfo.currentPage + 1
        : undefined,
    staleTime: 1000 * 60 * 30,
    maxPages: 5,
  });

  // AniList's sort orders (especially TRENDING_DESC) are NOT stable across
  // requests, and Redis caches each page at a different moment — the same
  // title can legitimately appear at the end of page 1 AND the start of page 2.
  // Dedupe by anilistId when flattening; the earlier page's occurrence wins.
  const cards: DiscoverCardData[] = useMemo(() => {
    const seen = new Set<number>();
    const out: DiscoverCardData[] = [];
    for (const page of data?.pages ?? []) {
      if (!page.success) continue;
      for (const card of page.data.cards) {
        if (seen.has(card.anilistId)) continue;
        seen.add(card.anilistId);
        out.push(card);
      }
    }
    return out;
  }, [data]);

  const scrollBy = useCallback((dir: 1 | -1) => {
    trackRef.current?.scrollBy({
      left: dir * trackRef.current.clientWidth * 0.85,
      behavior: "smooth",
    });
  }, []);

  // Near-end prefetch: append the next page before the user ever sees a gap
  const handleTrackScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      el.scrollLeft + el.clientWidth > el.scrollWidth - 400
    ) {
      fetchNextPage();
    }
  };

  // Graceful collapse: an empty shelf hides itself instead of showing noise
  if (!isLoading && !isError && cards.length === 0) return null;

  const header = (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2
          className={cn(
            "bg-gradient-to-r bg-clip-text text-base font-extrabold tracking-tight text-transparent sm:text-lg",
            recipe.accent
          )}
        >
          {recipe.title}
        </h2>
        <p className="mt-0.5 text-[11px] text-chrono-text-dim">{recipe.subtitle}</p>
      </div>
      {/* Arrow controls — desktop hover only; mobile swipes natively */}
      <div className="hidden shrink-0 gap-1.5 opacity-0 transition-opacity group-hover/shelf:opacity-100 sm:flex">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label={`Scroll ${recipe.title} left`}
          className="rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/25 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label={`Scroll ${recipe.title} right`}
          className="rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/25 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (isError && cards.length === 0) {
    return (
      <section>
        {header}
        <div className="glass-card flex items-center justify-between gap-4 rounded-xl p-4">
          <span className="text-xs text-chrono-text-dim">Couldn't load this shelf.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn-secondary cursor-pointer px-3 py-1.5 text-xs"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="group/shelf relative">
      {header}

      <div className="relative">
        {/* Edge fades — rows, not walls */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-chrono-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-chrono-bg to-transparent" />

        <div
          ref={trackRef}
          onScroll={handleTrackScroll}
          className="flex snap-x gap-3 overflow-x-auto scroll-smooth px-0.5 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ShelfCardSkeleton key={i} />)
            : cards.map((card) => (
                <DiscoverCard
                  key={card.anilistId ?? card.title}
                  card={card}
                  onSelect={onSelect}
                />
              ))}
          {/* Appended-only skeleton — never flash the loaded cards */}
          {isFetchingNextPage && <ShelfCardSkeleton />}
        </div>
      </div>
    </section>
  );
}
