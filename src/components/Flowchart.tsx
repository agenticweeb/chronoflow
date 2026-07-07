"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  Star,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Share2,
  Play,
  SkipForward,
} from "lucide-react";
import { WatchOrderEntry, WatchOrderResult } from "@/types";
import { useProgress } from "@/hooks/useProgress";
import { cn, generateShareText } from "@/lib/utils";

interface FlowchartProps {
  result: WatchOrderResult;
}

export function Flowchart({ result }: FlowchartProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { progress, toggleWatched, getCompletionRate } = useProgress(
    result.franchiseId
  );

  const handleShare = () => {
    const text = generateShareText(
      result.franchise,
      result.entries,
      result.totalDuration
    );
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const completionRate = getCompletionRate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient">
              {result.franchise}
            </h1>
            <p className="text-chrono-text-muted mt-1">{result.description}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-chrono-text-dim">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {result.totalDuration} total
              </span>
              <span>•</span>
              <span>{result.totalEntries} entries</span>
              <span>•</span>
              <span>{result.totalEpisodes} episodes</span>
              {result.confidence < 80 && (
                <span className="flex items-center gap-1 text-chrono-warning">
                  <AlertTriangle className="w-4 h-4" />
                  Limited data — AI-generated
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 sm:w-48">
              <div className="flex justify-between text-xs text-chrono-text-muted mb-1">
                <span>Progress</span>
                <span>{completionRate}%</span>
              </div>
              <div className="h-2 bg-chrono-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-chrono-primary to-chrono-accent transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
            <button
              onClick={handleShare}
              className="btn-secondary flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-chrono-text-dim">
          <span>Powered by</span>
          <span className="px-2 py-0.5 bg-chrono-primary/10 text-chrono-primary rounded-full font-medium">
            {result.aiProvider}
          </span>
          <span>
            • Generated {new Date(result.generatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Flowchart */}
      <div className="relative">
        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-chrono-primary/50 via-chrono-border to-chrono-border" />

        <div className="space-y-0">
          {result.entries.map((entry, index) => (
            <FlowchartNode
              key={entry.id}
              entry={entry}
              index={index}
              isExpanded={expandedId === entry.id}
              onToggle={() =>
                setExpandedId(expandedId === entry.id ? null : entry.id)
              }
              isWatched={progress?.entries[entry.id]?.watched || false}
              onToggleWatched={() => toggleWatched(entry.id, entry)}
              isLast={index === result.entries.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Individual Node ────────────────────────────────────────
interface FlowchartNodeProps {
  entry: WatchOrderEntry;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isWatched: boolean;
  onToggleWatched: () => void;
  isLast: boolean;
}

function FlowchartNode({
  entry,
  index,
  isExpanded,
  onToggle,
  isWatched,
  onToggleWatched,
  isLast,
}: FlowchartNodeProps) {
  const tierStyles = {
    essential: "tier-essential",
    recommended: "tier-recommended",
    optional: "tier-optional",
    skip: "tier-skip",
  };

  const tierBadges = {
    essential: "badge-essential",
    recommended: "badge-recommended",
    optional: "badge-optional",
    skip: "badge-skip",
  };

  return (
    <div className="relative pl-14 sm:pl-16">
      {/* Node dot */}
      <div
        className={cn(
          "absolute left-4 sm:left-6 top-6 w-4 h-4 rounded-full border-2 z-10 transition-all",
          isWatched
            ? "bg-chrono-success border-chrono-success"
            : entry.tier === "essential"
            ? "bg-tier-essential border-tier-essential"
            : entry.tier === "recommended"
            ? "bg-tier-recommended border-tier-recommended"
            : entry.tier === "optional"
            ? "bg-tier-optional border-tier-optional"
            : "bg-tier-skip border-tier-skip"
        )}
      >
        {isWatched && (
          <Check className="w-3 h-3 text-white absolute -top-0.5 -left-0.5" />
        )}
      </div>

      {/* Card */}
      <div
        className={cn(
          "glass-card mb-4 transition-all duration-200 hover:bg-chrono-surface-hover",
          tierStyles[entry.tier],
          isWatched && "opacity-60"
        )}
      >
        {/* Header */}
        <div
          className="p-4 cursor-pointer flex items-start gap-4"
          onClick={onToggle}
        >
          {/* Thumbnail */}
          <div className="w-16 h-24 rounded-lg overflow-hidden bg-chrono-surface flex-shrink-0 hidden sm:block">
            {entry.imageUrl ? (
              <img
                src={entry.imageUrl}
                alt={entry.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-6 h-6 text-chrono-text-dim" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn("text-xs font-medium", tierBadges[entry.tier])}
              >
                {entry.tier.toUpperCase()}
              </span>
              <span className="text-xs text-chrono-text-dim bg-chrono-surface px-2 py-0.5 rounded-full">
                {entry.type}
              </span>
              {entry.arcName && (
                <span className="text-xs text-chrono-primary bg-chrono-primary/10 px-2 py-0.5 rounded-full">
                  {entry.arcName}
                </span>
              )}
            </div>

            <h3 className="font-semibold text-chrono-text mt-1 truncate">
              {entry.title}
            </h3>

            <div className="flex items-center gap-3 mt-2 text-sm text-chrono-text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {entry.timeEstimate}
              </span>
              {entry.episodeCount && <span>{entry.episodeCount} eps</span>}
              {entry.malScore && entry.malScore > 0 && (
                <span className="flex items-center gap-1 text-chrono-accent">
                  <Star className="w-3.5 h-3.5" />
                  {entry.malScore.toFixed(1)}
                </span>
              )}
            </div>

            <p className="text-sm text-chrono-text-dim mt-2 line-clamp-2">
              {entry.whyWatch}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatched();
              }}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                isWatched
                  ? "bg-chrono-success/20 text-chrono-success"
                  : "bg-chrono-surface text-chrono-text-dim hover:text-chrono-text hover:bg-chrono-surface-hover"
              )}
              title={isWatched ? "Mark unwatched" : "Mark watched"}
            >
              <Check className="w-5 h-5" />
            </button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-chrono-text-dim" />
            ) : (
              <ChevronDown className="w-5 h-5 text-chrono-text-dim" />
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-chrono-border/30 pt-4 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Why Watch */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-chrono-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-chrono-text">
                      Why Watch
                    </p>
                    <p className="text-sm text-chrono-text-muted mt-1">
                      {entry.whyWatch}
                    </p>
                  </div>
                </div>

                {entry.skipWarning && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-chrono-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-chrono-warning">
                        If You Skip
                      </p>
                      <p className="text-sm text-chrono-text-muted mt-1">
                        {entry.skipWarning}
                      </p>
                    </div>
                  </div>
                )}

                {entry.fillerReason && (
                  <div className="flex items-start gap-2">
                    <SkipForward className="w-4 h-4 text-chrono-text-dim mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-chrono-text-dim">
                        Filler Type
                      </p>
                      <p className="text-sm text-chrono-text-muted mt-1 capitalize">
                        {entry.fillerClassification?.replace("-", " ")}
                      </p>
                      <p className="text-sm text-chrono-text-muted">
                        {entry.fillerReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="space-y-3">
                {entry.synopsis && (
                  <div>
                    <p className="text-sm font-medium text-chrono-text">
                      Synopsis
                    </p>
                    <p className="text-sm text-chrono-text-muted mt-1 line-clamp-4">
                      {entry.synopsis}
                    </p>
                  </div>
                )}

                {entry.genres && entry.genres.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-chrono-text">
                      Genres
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.genres.map((g) => (
                        <span
                          key={g}
                          className="text-xs px-2 py-0.5 bg-chrono-surface text-chrono-text-muted rounded-full"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.watchIf && entry.watchIf.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-chrono-text">
                      Watch If You Like
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.watchIf.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-chrono-primary/10 text-chrono-primary rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.aired && (
                  <p className="text-xs text-chrono-text-dim">
                    Aired: {entry.aired}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
