"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { fetchOffPathAction } from "@/app/actions";
import { getUnexploredGenres, getExploredGenres } from "@/lib/discover/taste-graph";
import { DiscoverCard } from "@/components/DiscoverCard";
import type { DiscoverCardData } from "@/lib/discover/shelf-recipes";
import type { RecommendationCard } from "@/app/actions";

interface Props {
  onSelect: (card: DiscoverCardData) => void;
}

export function OffYourUsualPathShelf({ onSelect }: Props) {
  const [cards, setCards] = useState<RecommendationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [unexplored, setUnexplored] = useState<string[]>([]);
  const [explored, setExplored] = useState<string[]>([]);

  useEffect(() => {
    const check = () => {
      const unexp = getUnexploredGenres();
      const exp = getExploredGenres();
      setUnexplored(unexp);
      setExplored(exp);

      // Only show if user has explored at least 1 genre (otherwise there's no "usual path")
      if (exp.length === 0) {
        setLoading(false);
        return;
      }

      if (unexp.length === 0) {
        setLoading(false);
        return;
      }
    };

    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (unexplored.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetchOffPathAction(unexplored);
        if (!cancelled && res.success && res.data) {
          setCards(res.data);
        }
      } catch {
        /* fail silently */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [unexplored.join(",")]);

  // Don't render if user hasn't explored anything yet, or has explored everything
  if (explored.length === 0 || unexplored.length === 0 || (!loading && cards.length === 0)) {
    return null;
  }

  const scroll = (dir: 1 | -1) => {
    const track = document.getElementById("offpath-track");
    if (track) track.scrollBy({ left: dir * track.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="group/shelf relative">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-base font-extrabold tracking-tight text-transparent sm:text-lg">
            Off Your Usual Path
          </h2>
          <p className="mt-0.5 text-[11px] text-chrono-text-dim">
            You've explored {explored.join(", ")} — try {unexplored.join(", ")}
          </p>
        </div>
        <div className="hidden shrink-0 gap-1.5 opacity-0 transition-opacity group-hover/shelf:opacity-100 sm:flex">
          <button onClick={() => scroll(-1)} className="rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/25 cursor-pointer">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll(1)} className="rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/25 cursor-pointer">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-chrono-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-chrono-bg to-transparent" />

        <div
          id="offpath-track"
          className="flex snap-x gap-3 overflow-x-auto scroll-smooth px-0.5 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[140px] sm:w-[160px] shrink-0">
                  <div className="skeleton aspect-[2/3] rounded-xl border border-chrono-border/10" />
                  <div className="skeleton mt-2 h-3 w-3/4 rounded" />
                </div>
              ))
            : cards.map((card) => {
                const shelfCard: DiscoverCardData = {
                  ...card,
                  franchiseEntries: 0,
                };
                return (
                  <DiscoverCard
                    key={card.anilistId ?? card.title}
                    card={shelfCard}
                    onSelect={onSelect}
                  />
                );
              })}
        </div>
      </div>
    </section>
  );
}
