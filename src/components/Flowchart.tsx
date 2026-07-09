"use client";
import { calculateTimeBudget } from "@/lib/time-calculator";
import { TimeBudgetCard } from "@/components/TimeBudgetCard";
import { useState } from "react";
import { createPortal } from "react-dom";
import { generateWatchCalendarIcs, downloadIcsFile } from "@/lib/calendar-generator";

import {
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  Star,
  AlertTriangle,
  Info,
  Share2,
  Play,
  SkipForward,
  CalendarDays,
  X,
} from "lucide-react";

import { WatchOrderEntry, WatchOrderResult } from "@/types";
import { useProgress } from "@/hooks/useProgress";
import { cn, generateShareText } from "@/lib/utils";
import { SuggestionImage } from "@/components/SuggestionImage";

interface FlowchartProps {
  result: WatchOrderResult;
}

// Helper: Safely converts various YouTube links to embeddable streams with autoplay
function getYoutubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  
  // Standard YouTube watch URLs or short links
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  }
  
  // Standard embed format
  if (url.includes("youtube.com/embed/")) {
    return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
  }
  
  return null;
}

export function Flowchart({ result }: FlowchartProps) {
  const [expanded, setExpanded] = useState(new Set<string>());
  const [activeTrailerUrl, setActiveTrailerUrl] = useState<string | null>(null);
  
  // Watch Calendar customization states
  const [isCalOpen, setIsCalOpen] = useState(false);
  const [calStartDate, setCalStartDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [calEpsPerDay, setCalEpsPerDay] = useState(2);
  const [calStartTime, setCalStartTime] = useState("20:00");

  const toggleEntry = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

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

  const handleExportCalendar = () => {
    const icsContent = generateWatchCalendarIcs(result.franchise, result.entries, {
      startDate: calStartDate,
      episodesPerDay: calEpsPerDay,
      watchStartTime: calStartTime,
    });
    const slug = result.franchise.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    downloadIcsFile(`chronoflow-${slug}-schedule.ics`, icsContent);
    setIsCalOpen(false);
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
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Progress status */}
            <div className="flex-1 sm:w-40 min-w-[120px]">
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

            {/* Actions button group */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCalOpen(true)}
                title="Generate custom watch calendar (.ics)"
                className="btn-secondary flex-1 sm:flex-initial flex items-center justify-center gap-2 border-chrono-primary/30 text-chrono-primary hover:bg-chrono-primary/5 transition-colors"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Schedule</span>
              </button>
              <button
                onClick={handleShare}
                className="btn-secondary flex-1 sm:flex-initial flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
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

      {/* Time Budget Card */}
      <TimeBudgetCard
        data={calculateTimeBudget(
          result.franchise,
          result.entries.map((e) => ({
            title: e.title,
            episodes: e.episodeCount ?? 1,
            durationMin: e.durationMinutes ?? 24,
            tier: e.tier,
          })),
          new Date(result.generatedAt)
        )}
      />

      {/* Flowchart Timeline */}
      <div className="relative">
        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-chrono-primary/50 via-chrono-border to-chrono-border" />

        <div className="space-y-0">
          {result.entries.map((entry, index) => (
            <FlowchartNode
              key={entry.id}
              entry={entry}
              index={index}
              isExpanded={expanded.has(entry.id)}
              onToggle={() => toggleEntry(entry.id)}
              isWatched={progress?.entries[entry.id]?.watched || false}
              onToggleWatched={() => toggleWatched(entry.id, entry)}
              isLast={index === result.entries.length - 1}
              onPlayTrailer={(url) => setActiveTrailerUrl(url)}
            />
          ))}
        </div>
      </div>

      {/* Watch Calendar Configuration Modal (Portal) */}
      {isCalOpen && typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999] animate-fade-in">
            <div className="glass-card w-full max-w-md overflow-hidden relative shadow-2xl animate-slide-up border border-chrono-border">
              
              {/* Header */}
              <div className="p-6 border-b border-chrono-border/40 flex items-center justify-between bg-chrono-surface/30">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-chrono-primary" />
                  <h3 className="text-lg font-bold text-chrono-text">Customize Calendar</h3>
                </div>
                <button
                  onClick={() => setIsCalOpen(false)}
                  className="p-1.5 rounded-lg bg-chrono-surface hover:bg-chrono-surface-hover text-chrono-text-dim hover:text-chrono-text transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chrono-text-muted uppercase tracking-wider block">
                    Schedule Start Date
                  </label>
                  <input
                    type="date"
                    value={calStartDate}
                    onChange={(e) => setCalStartDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-chrono-text-muted">Viewing Pace</span>
                    <span className="text-chrono-primary font-bold">
                      {calEpsPerDay === 1 ? "Casual (1 ep/day)" : calEpsPerDay === 2 ? "Regular (2 eps/day)" : calEpsPerDay === 4 ? "Dedicated (4 eps/day)" : "Binge (8 eps/day)"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "1 Ep", val: 1 },
                      { label: "2 Eps", val: 2 },
                      { label: "4 Eps", val: 4 },
                      { label: "8 Eps", val: 8 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setCalEpsPerDay(p.val)}
                        className={cn(
                          "py-2 rounded-lg text-xs font-semibold border transition-all",
                          calEpsPerDay === p.val
                            ? "bg-chrono-primary border-chrono-primary text-white"
                            : "bg-chrono-surface border-chrono-border/50 text-chrono-text-dim hover:text-chrono-text hover:bg-chrono-surface-hover"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-chrono-text-muted uppercase tracking-wider block">
                    Daily Watch Time
                  </label>
                  <input
                    type="time"
                    value={calStartTime}
                    onChange={(e) => setCalStartTime(e.target.value)}
                    className="input-field"
                  />
                </div>

                <p className="text-[11px] text-chrono-text-dim leading-relaxed bg-chrono-surface/30 p-3 rounded-lg border border-chrono-border/10">
                  This generates a fully compliant, zero-dependency calendar subscription feed containing exact time slots for every episode. Import it into Apple, Google, or Outlook Calendar to track targets.
                </p>
              </div>

              {/* Footer Button */}
              <div className="p-6 border-t border-chrono-border/40 bg-chrono-surface/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCalOpen(false)}
                  className="btn-secondary py-2.5 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExportCalendar}
                  className="btn-primary py-2.5 px-5 text-xs font-bold inline-flex items-center gap-2"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Download .ics Feed</span>
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}

      {/* Trailer Video Player Modal (Portal) */}
      {activeTrailerUrl && typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[99999] animate-fade-in">
            <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden relative border border-chrono-border shadow-2xl bg-black">
              {/* Close Button */}
              <button
                onClick={() => setActiveTrailerUrl(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors z-50 border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              
              {getYoutubeEmbedUrl(activeTrailerUrl) ? (
                <iframe
                  src={getYoutubeEmbedUrl(activeTrailerUrl)!}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-chrono-text-dim p-6">
                  <Play className="w-12 h-12 text-chrono-primary animate-pulse mb-3" />
                  <p className="text-sm">Could not load trailer stream. Try watching directly:</p>
                  <a
                    href={activeTrailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-chrono-primary hover:underline text-xs mt-2"
                  >
                    {activeTrailerUrl}
                  </a>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
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
  onPlayTrailer: (url: string) => void;
}

function FlowchartNode({
  entry,
  index,
  isExpanded,
  onToggle,
  isWatched,
  onToggleWatched,
  isLast,
  onPlayTrailer,
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
          {/* Poster Fallback Image */}
          <div className="w-16 h-24 rounded-lg overflow-hidden bg-chrono-surface flex-shrink-0 hidden sm:block relative">
            <SuggestionImage
              src={entry.imageUrl}
              alt={entry.title}
              franchise={entry.title}
              className="w-full h-full"
            />
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

                {entry.trailerUrl && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrailer(entry.trailerUrl!);
                      }}
                      className="btn-primary py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5 shadow-md shadow-chrono-primary/10"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Trailer</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
