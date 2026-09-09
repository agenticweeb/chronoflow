"use client";

import React, { useMemo } from "react";
import { Check, ChevronRight, Star } from "lucide-react";
import { SuggestionImage } from "@/components/SuggestionImage";
import { CountdownBadge } from "@/components/CountdownBadge";
import { useWatchStore } from "@/lib/store";
import type { DiscoverCardData } from "@/lib/discover/shelf-recipes";

interface DiscoverCardProps {
  card: DiscoverCardData;
  onSelect: (card: DiscoverCardData) => void;
}

interface CardProgressState {
  watched: boolean;
  episodesWatched: number;
  maxEpisodes: number;
  pct: number;
}

/**
 * Progress-aware badge lookup (client-side, zero fetches).
 * Scans the Zustand progressMap for an entry matching this card's anilistId.
 * Entry keys follow the documented AllowedTitle id contract in
 * types/intelligent.ts ("ani_12345"); the bare-id fallback covers alternate
 * keying. If nothing matches, the card renders badge-free — a safe no-op.
 */
function useCardProgress(anilistId: number): CardProgressState | null {
  const progressMap = useWatchStore((state) => state.progressMap);
  return useMemo(() => {
    const keys = [`ani_${anilistId}`, String(anilistId)];
    for (const franchise of Object.values(progressMap)) {
      for (const key of keys) {
        const entry = franchise.entries[key];
        if (entry) {
          const max = entry.maxEpisodes || 1;
          const watchedEps = entry.watched ? max : entry.episodesWatched || 0;
          return {
            watched: entry.watched,
            episodesWatched: watchedEps,
            maxEpisodes: max,
            pct: Math.min(100, Math.round((watchedEps / max) * 100)),
          };
        }
      }
    }
    return null;
  }, [progressMap, anilistId]);
}

export function DiscoverCard({ card, onSelect }: DiscoverCardProps) {
  const progress = useCardProgress(card.anilistId);
  const year = card.aired || (card.seasonYear ? String(card.seasonYear) : "");
  const eps = card.episodes ? `${card.episodes} eps` : "?";

  return (
    <button
      type="button"
      onClick={() => onSelect(card)}
      className="group relative w-[140px] sm:w-[160px] shrink-0 snap-start text-left cursor-pointer
                 transition-transform duration-300 ease-out
                 hover:z-20 hover:scale-[1.05] focus-visible:z-20 focus-visible:scale-[1.05]"
      aria-label={`Select ${card.title}`}
    >
      <div
        className="relative aspect-[2/3] overflow-hidden rounded-xl bg-chrono-surface shadow-lg
                   border border-chrono-border/10 transition-all duration-300
                   group-hover:border-chrono-primary/40 group-hover:shadow-xl"
        style={card.coverColor ? { backgroundColor: card.coverColor } : undefined}
      >
        <SuggestionImage
          src={card.imageUrl}
          alt={card.title}
          className="w-full h-full object-cover"
        />

        {/* Top-left badge stack — user state and curation can coexist */}
        <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1">
          {card.isEditorsPick && (
            <span className="rounded-full bg-chrono-accent/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-lg">
              Pick
            </span>
          )}
          {progress?.watched && (
            <span className="flex items-center gap-0.5 rounded-full bg-chrono-success/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-lg">
              <Check className="h-2.5 w-2.5" />
              Watched
            </span>
          )}
          {progress && !progress.watched && (
            <span className="rounded-full bg-chrono-primary/90 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-white shadow-lg">
              Ep {progress.episodesWatched}/{progress.maxEpisodes}
            </span>
          )}
        </div>

        {/* Airing countdown (Airing Now shelf) — self-positioning top-right */}
        {card.nextAiringEpisode && (
          <CountdownBadge
            airingAt={card.nextAiringEpisode.airingAt}
            episode={card.nextAiringEpisode.episode}
          />
        )}

        {/* Score badge */}
        {card.score ? (
          <span className="absolute bottom-2 left-2 z-10 flex items-center gap-0.5 rounded-full bg-chrono-primary/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
            <Star className="h-2.5 w-2.5 fill-current" />
            {card.score.toFixed(1)}
          </span>
        ) : null}

        {/* Episode-level progress bar along the bottom edge */}
        {progress && (
          <div className="absolute inset-x-0 bottom-0 z-10 h-[3px] bg-black/50">
            <div
              className={progress.watched ? "h-full bg-chrono-success" : "h-full bg-chrono-primary"}
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        )}

        {/* Hover reveal — title, meta, action hint */}
        <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2.5 pt-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="line-clamp-2 text-xs font-bold leading-tight text-white">{card.title}</p>
          <p className="mt-1 text-[10px] font-medium text-white/70">
            {card.type || "?"} · {eps}
            {year ? ` · ${year}` : ""}
          </p>
          <span className="mt-1.5 inline-flex items-center gap-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
            Get Watch Order
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </button>
  );
}
