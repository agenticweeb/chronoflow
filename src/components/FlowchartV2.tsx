/**
 * Flowchart V2 — Immersive watch path for anime fans
 * Paths → Groups → Entries · client Focus · time card · calendar · progress
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
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
  Target,
  Map,
  Layers,
  Sparkles,
  Tv,
  Film,
  ArrowLeft,
} from "lucide-react";

import {
  WatchOrderResultV2,
  WatchOrderEntryV2,
  EntryTier,
} from "@/types/intelligent";
import {
  calculateTimeBudget,
  paceFromTimeBudget,
} from "@/lib/time-calculator";
import { TimeBudgetCard } from "@/components/TimeBudgetCard";
import { useProgress } from "@/hooks/useProgress";
import { cn, generateShareText } from "@/lib/utils";
import { SuggestionImage } from "@/components/SuggestionImage";
import {
  generateWatchCalendarIcs,
  downloadIcsFile,
} from "@/lib/calendar-generator";
import { buildFocusedResult } from "@/lib/focus-entry";

interface FlowchartV2Props {
  data: WatchOrderResultV2;
  timeBudget?: string;
  onBackFromFocus?: () => void;
}

function getYoutubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (match?.[1])
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  if (url.includes("youtube.com/embed/"))
    return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
  return null;
}

const tierConfig: Record<
  EntryTier,
  { label: string; color: string; bg: string; border: string; badge: string }
> = {
  essential: {
    label: "Essential",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  recommended: {
    label: "Recommended",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
  optional: {
    label: "Optional",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  skip: {
    label: "Skip",
    color: "text-zinc-500",
    bg: "bg-zinc-800/50",
    border: "border-zinc-700",
    badge: "bg-zinc-800 text-zinc-500 border-zinc-700",
  },
};

export default function FlowchartV2({
  data: initialData,
  timeBudget = "regular",
}: FlowchartV2Props) {
  const [focusEntry, setFocusEntry] = useState<WatchOrderEntryV2 | null>(null);

  const data = useMemo(() => {
    if (!focusEntry) return initialData;
    return buildFocusedResult(focusEntry, initialData.franchise);
  }, [focusEntry, initialData]);

  const isFocused = !!focusEntry;

  const [activePathId, setActivePathId] = useState<string>(
    data.recommendedPathId || data.paths[0]?.id
  );

  // Reset path when entering/leaving focus
  useEffect(() => {
    setActivePathId(data.recommendedPathId || data.paths[0]?.id);
    setExpandedGroups(
      new Set(
        [data.paths[0]?.groups[0]?.id, data.paths[0]?.groups[1]?.id].filter(
          Boolean
        ) as string[]
      )
    );
  }, [data.franchiseId, data.recommendedPathId]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () =>
      new Set(
        [data.paths[0]?.groups[0]?.id, data.paths[0]?.groups[1]?.id].filter(
          Boolean
        ) as string[]
      )
  );
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(
    new Set()
  );
  const [activeTrailerUrl, setActiveTrailerUrl] = useState<string | null>(
    null
  );
  const [isCalOpen, setIsCalOpen] = useState(false);
  const [calStartDate, setCalStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [calEpsPerDay, setCalEpsPerDay] = useState(2);
  const [calStartTime, setCalStartTime] = useState("20:00");

  const activePath =
    data.paths.find((p) => p.id === activePathId) || data.paths[0];

  const heroImage =
    data.franchiseImage ||
    activePath?.groups?.[0]?.entries?.[0]?.imageUrl ||
    activePath?.groups?.[0]?.entries?.[0]?.coverImage?.large ||
    "";

  const pathEntries =
    activePath?.groups.flatMap((g) => g.entries) || data.allEntriesFlat || [];

  const { progress, toggleWatched, getCompletionRate } = useProgress(
    data.franchiseId
  );
  const completionRate = getCompletionRate();
  const preferredPace = paceFromTimeBudget(timeBudget);

  const timeData = useMemo(
    () =>
      calculateTimeBudget(
        data.franchise,
        pathEntries.map((e) => ({
          title: e.title,
          episodes: e.episodeCount ?? 1,
          durationMin: e.durationMinutes ?? 24,
          tier: e.tier,
          isFiller: e.isFiller && e.tier === "skip",
        })),
        new Date()
      ),
    [data.franchise, pathEntries]
  );

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleEntry = (id: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShare = () => {
    const text = generateShareText(
      data.franchise,
      pathEntries as any,
      data.totalDuration
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleExportCalendar = () => {
    const legacyEntries = pathEntries.map((e) => ({
      title: e.title,
      episodes: e.episodeCount ?? 1,
      durationMin: e.durationMinutes ?? 24,
      tier: e.tier,
    }));
    const icsContent = generateWatchCalendarIcs(
      data.franchise,
      legacyEntries as any,
      {
        startDate: calStartDate,
        episodesPerDay: calEpsPerDay,
        watchStartTime: calStartTime,
      }
    );
    const slug = data.franchise.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    downloadIcsFile(`chronoflow-${slug}-schedule.ics`, icsContent);
    setIsCalOpen(false);
  };

  if (!data?.paths?.length) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <h3 className="text-white font-semibold">No watch order generated</h3>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      {/* Focus banner */}
      {isFocused && (
        <div className="flex items-center gap-3 rounded-2xl border border-chrono-primary/30 bg-chrono-primary/10 px-4 py-3">
          <button
            onClick={() => setFocusEntry(null)}
            className="btn-secondary py-2 px-3 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to {initialData.franchise}
          </button>
          <p className="text-xs text-chrono-text-muted">
            Focused season only — same cover & data as the card you clicked. No
            re-search.
          </p>
        </div>
      )}

      {/* Hero header */}
      <div className="glass-card overflow-hidden relative border border-chrono-border/40">
        <div className="absolute inset-0 pointer-events-none">
          {heroImage && (
            <div
              className="absolute inset-0 opacity-20 blur-2xl scale-110"
              style={{
                backgroundImage: `url(${heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-chrono-bg via-chrono-bg/95 to-chrono-primary/20" />
        </div>

        <div className="relative p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row gap-5">
            {heroImage && (
              <div className="w-28 h-40 sm:w-32 sm:h-48 rounded-xl overflow-hidden border border-white/10 shadow-2xl shrink-0 mx-auto sm:mx-0">
                <SuggestionImage
                  src={heroImage}
                  alt={data.franchise}
                  franchise={data.franchise}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {data.franchise}
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-chrono-primary/20 text-violet-200 border border-violet-500/30 uppercase tracking-wider">
                  {data.classification.replace(/_/g, " ")}
                </span>
              </div>

              <p className="text-sm text-chrono-text-muted leading-relaxed max-w-3xl">
                {data.summary}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-chrono-text-dim">
                <span className="inline-flex items-center gap-2 rounded-full border border-chrono-border/60 bg-white/5 px-3 py-1.5 text-chrono-text">
                  <Sparkles className="w-3.5 h-3.5 text-chrono-primary" />
                  {data.classification.replace(/_/g, " ")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-chrono-border/60 bg-chrono-primary/10 px-3 py-1.5 text-chrono-primary">
                  Confidence {Math.round(data.confidence)}%
                </span>
              </div>
              {data.classificationReason && (
                <p className="text-xs text-chrono-text-muted mt-2 max-w-3xl">
                  {data.classificationReason}
                </p>
              )}

              {data.whyConfusing && (
                <div className="mt-3 flex gap-2 text-sm bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 max-w-3xl">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-amber-100/85">
                    <span className="font-semibold text-amber-300">
                      Why it confuses people:{" "}
                    </span>
                    {data.whyConfusing}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-chrono-text-dim">
                <span className="inline-flex items-center gap-1.5 text-chrono-text-muted">
                  <Clock className="w-3.5 h-3.5 text-chrono-primary" />
                  <strong className="text-chrono-text">
                    {activePath?.totalTime || data.totalDuration}
                  </strong>{" "}
                  this path
                </span>
                <span>
                  {activePath?.totalEntries || data.totalEntries} titles
                </span>
                <span>
                  {activePath?.totalEpisodes || data.totalEpisodes} episodes
                </span>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-[11px] text-chrono-text-muted mb-1">
                    <span>Your progress</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-chrono-primary to-chrono-accent transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsCalOpen(true)}
                    className="btn-secondary py-2 px-3 text-xs inline-flex items-center gap-1.5 border-chrono-primary/30 text-chrono-primary"
                  >
                    <CalendarDays className="w-3.5 h-3.5" /> Schedule
                  </button>
                  <button
                    onClick={handleShare}
                    className="btn-secondary py-2 px-3 text-xs inline-flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time experience for active path */}
      <TimeBudgetCard data={timeData} preferredPaceLabel={preferredPace} />

      {/* Path picker */}
      {data.paths.length > 1 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-chrono-text-dim font-semibold mb-2 px-1">
            Choose a path
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {data.paths.map((path) => {
              const isActive = path.id === activePathId;
              return (
                <button
                  key={path.id}
                  onClick={() => setActivePathId(path.id)}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-start gap-1 px-4 py-3 rounded-2xl border text-left transition-all min-w-[210px] max-w-[280px]",
                    isActive
                      ? "bg-white text-black border-white shadow-xl shadow-chrono-primary/20"
                      : "bg-chrono-surface/80 text-zinc-300 border-chrono-border hover:border-chrono-primary/40"
                  )}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[13px]">{path.name}</span>
                    {path.isRecommended && (
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                          isActive
                            ? "bg-black/10"
                            : "bg-violet-500/20 text-violet-300"
                        )}
                      >
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs line-clamp-2 leading-snug",
                      isActive ? "text-black/60" : "text-zinc-500"
                    )}
                  >
                    {path.description}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] mt-0.5",
                      isActive ? "text-black/50" : "text-zinc-600"
                    )}
                  >
                    {path.totalTime}
                    {path.bestFor?.[0] ? ` · ${path.bestFor[0]}` : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Groups timeline */}
      {activePath && (
        <div className="space-y-3">
          {activePath.groups.map((group, gIdx) => {
            const isOpen = expandedGroups.has(group.id);
            const isMain = group.timelineType === "main_timeline";
            return (
              <div
                key={group.id}
                className={cn(
                  "rounded-2xl border overflow-hidden backdrop-blur-sm",
                  isMain
                    ? "border-chrono-primary/25 bg-chrono-surface/50"
                    : "border-chrono-border/50 bg-chrono-surface/30"
                )}
              >
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] text-left transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={cn(
                        "p-2 rounded-xl",
                        isMain
                          ? "bg-chrono-primary/20 text-violet-200"
                          : "bg-zinc-800 text-zinc-400"
                      )}
                    >
                      {isMain ? (
                        <Map className="w-4 h-4" />
                      ) : (
                        <Layers className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-chrono-text-dim font-mono">
                          {String(gIdx + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-semibold text-white text-[15px]">
                          {group.name}
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-medium text-white">
                        {group.totalEntries} titles
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {group.totalTime}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "p-1 rounded-lg transition-transform",
                        isOpen && "rotate-90"
                      )}
                    >
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 sm:p-4 space-y-3 bg-black/25 border-t border-white/5">
                        {group.orderNote && (
                          <div className="flex gap-2 text-xs text-sky-200/90 bg-sky-500/10 border border-sky-500/20 rounded-xl p-3">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{group.orderNote}</span>
                          </div>
                        )}
                        <div className="relative">
                          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-chrono-primary/40 via-chrono-border to-transparent hidden sm:block" />
                          <div className="space-y-0">
                            {group.entries.map((entry, idx) => (
                              <EntryNode
                                key={`${group.id}-${entry.id}-${idx}`}
                                entry={entry}
                                index={idx + 1}
                                isExpanded={expandedEntries.has(entry.id)}
                                onToggle={() => toggleEntry(entry.id)}
                                isWatched={
                                  !!progress?.entries[entry.id]?.watched
                                }
                                onToggleWatched={() =>
                                  toggleWatched(entry.id, entry as any)
                                }
                                onPlayTrailer={setActiveTrailerUrl}
                                onFocus={() => {
                                  // Exact card — never re-search
                                  setFocusEntry(entry);
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }}
                                showFocus={!isFocused}
                                isLast={idx === group.entries.length - 1}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar modal */}
      {isCalOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999]">
            <div className="glass-card w-full max-w-md overflow-hidden shadow-2xl border border-chrono-border">
              <div className="p-5 border-b border-chrono-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-chrono-primary" />
                  <h3 className="text-lg font-bold">Export schedule</h3>
                </div>
                <button
                  onClick={() => setIsCalOpen(false)}
                  className="p-1.5 rounded-lg bg-chrono-surface hover:bg-chrono-surface-hover"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chrono-text-muted uppercase tracking-wider block">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={calStartDate}
                    onChange={(e) => setCalStartDate(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-chrono-text-muted">Pace</span>
                    <span className="text-chrono-primary font-bold">
                      {calEpsPerDay} ep/day
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 4, 8].map((v) => (
                      <button
                        key={v}
                        onClick={() => setCalEpsPerDay(v)}
                        className={cn(
                          "py-2 rounded-lg text-xs font-semibold border",
                          calEpsPerDay === v
                            ? "bg-chrono-primary border-chrono-primary text-white"
                            : "bg-chrono-surface border-chrono-border/50 text-chrono-text-dim"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chrono-text-muted uppercase tracking-wider block">
                    Daily start time
                  </label>
                  <input
                    type="time"
                    value={calStartTime}
                    onChange={(e) => setCalStartTime(e.target.value)}
                    className="input-field w-full"
                  />
                </div>
              </div>
              <div className="p-5 border-t border-chrono-border/40 flex justify-end gap-3">
                <button
                  onClick={() => setIsCalOpen(false)}
                  className="btn-secondary py-2.5 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportCalendar}
                  className="btn-primary py-2.5 px-5 text-xs font-bold inline-flex items-center gap-2"
                >
                  <CalendarDays className="w-4 h-4" /> Download .ics
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Trailer modal */}
      {activeTrailerUrl &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[99999]">
            <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden relative border border-zinc-800 shadow-2xl bg-black">
              <button
                onClick={() => setActiveTrailerUrl(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white z-50 border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              {getYoutubeEmbedUrl(activeTrailerUrl) ? (
                <iframe
                  src={getYoutubeEmbedUrl(activeTrailerUrl)!}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-zinc-400">
                  <Play className="w-12 h-12 mb-3" />
                  <a
                    href={activeTrailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-chrono-primary underline text-sm"
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

function EntryNode({
  entry,
  index,
  isExpanded,
  onToggle,
  isWatched,
  onToggleWatched,
  onPlayTrailer,
  onFocus,
  showFocus,
  isLast,
}: {
  entry: WatchOrderEntryV2;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isWatched: boolean;
  onToggleWatched: () => void;
  onPlayTrailer: (url: string) => void;
  onFocus: () => void;
  showFocus: boolean;
  isLast: boolean;
}) {
  const tier = tierConfig[entry.tier] || tierConfig.optional;
  const FormatIcon =
    entry.format === "MOVIE" ? Film : entry.format === "TV" ? Tv : Sparkles;
  const airing =
    entry.status === "Airing" ||
    entry.status === "RELEASING" ||
    entry.status === "Upcoming";

  return (
    <div className={cn("relative pl-12 sm:pl-16", !isLast && "pb-1")}>
      <div
        className={cn(
          "absolute left-4 sm:left-6 top-7 w-4 h-4 rounded-full border-2 z-10 flex items-center justify-center text-[8px] font-bold",
          isWatched
            ? "bg-chrono-success border-chrono-success text-white"
            : entry.tier === "essential"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : entry.tier === "recommended"
                ? "bg-sky-500 border-sky-500 text-white"
                : entry.tier === "optional"
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "bg-zinc-600 border-zinc-600 text-white"
        )}
      >
        {isWatched ? <Check className="w-2.5 h-2.5" /> : index}
      </div>

      <div
        className={cn(
          "glass-card mb-3 transition-all border",
          tier.border,
          tier.bg,
          isWatched && "opacity-55"
        )}
      >
        <div
          className="p-3.5 sm:p-4 cursor-pointer flex gap-3 sm:gap-4"
          onClick={onToggle}
        >
          <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 relative border border-white/5">
            <SuggestionImage
              src={entry.imageUrl}
              alt={entry.title}
              franchise={entry.title}
              className="w-full h-full"
            />
            <div className="absolute top-1 left-1">
              <span
                className={cn(
                  "text-[8px] font-bold px-1 py-0.5 rounded border backdrop-blur-md",
                  tier.badge
                )}
              >
                {tier.label.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                  tier.badge
                )}
              >
                {entry.tier.toUpperCase()}
              </span>
              <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <FormatIcon className="w-3 h-3" /> {entry.format}
              </span>
              {airing && (
                <span className="text-[10px] font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  {entry.status === "Upcoming" ? "UPCOMING" : "AIRING"}
                </span>
              )}
              {entry.arcName && (
                <span className="text-[10px] text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full">
                  {entry.arcName}
                </span>
              )}
              {entry.episodeRange && (
                <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">
                  Eps {entry.episodeRange}
                </span>
              )}
            </div>

            <h3 className="font-semibold text-white mt-1.5 line-clamp-2 leading-snug">
              {entry.title}
            </h3>

            <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> {entry.timeEstimate}
              </span>
              {entry.episodeCount ? (
                <span>· {entry.episodeCount} eps</span>
              ) : null}
              {entry.year ? <span>· {entry.year}</span> : null}
              {entry.malScore || entry.anilistScore ? (
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {(entry.malScore || entry.anilistScore || 0).toFixed(1)}
                </span>
              ) : null}
            </div>

            <p className="text-[13px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
              {entry.whyWatch}
            </p>

            {entry.watchAfter && (
              <div className="mt-2 text-xs text-sky-300 bg-sky-500/10 border border-sky-500/25 rounded-lg px-2.5 py-1 w-fit inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {entry.watchAfter}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatched();
              }}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                isWatched
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
              )}
              title="Mark watched"
            >
              <Check className="w-4 h-4" />
            </button>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-white/5 pt-4 bg-black/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-chrono-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-white uppercase tracking-wider">
                      Why watch
                    </p>
                    <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                      {entry.whyWatch}
                    </p>
                    {entry.tierReason && (
                      <p className="text-xs text-zinc-500 mt-2">
                        <span className="text-zinc-400 font-medium">
                          Tier reason:{" "}
                        </span>
                        {entry.tierReason}
                      </p>
                    )}
                  </div>
                </div>
                {entry.skipWarning && (
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-400 uppercase">
                        If you skip
                      </p>
                      <p className="text-sm text-zinc-400 mt-1">
                        {entry.skipWarning}
                      </p>
                    </div>
                  </div>
                )}
                {entry.fillerReason && (
                  <div className="flex gap-2">
                    <SkipForward className="w-4 h-4 text-zinc-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase">
                        Filler note
                      </p>
                      <p className="text-sm text-zinc-400">
                        {entry.fillerReason}
                      </p>
                    </div>
                  </div>
                )}
                {entry.innerOrder && entry.innerOrder.ranges.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Layers className="w-3 h-3" /> Arc map
                    </p>
                    <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                      {entry.innerOrder.ranges.slice(0, 20).map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs bg-zinc-900/80 rounded-lg px-2.5 py-1.5 border border-zinc-800/50 gap-2"
                        >
                          <span className="font-mono text-zinc-300 shrink-0">
                            {r.start}-{r.end}
                          </span>
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0",
                              r.type === "canon" || r.type === "none"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : String(r.type).includes("filler")
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-amber-500/20 text-amber-300"
                            )}
                          >
                            {String(r.type).replace(/_/g, " ")}
                          </span>
                          <span className="text-zinc-500 truncate flex-1 text-right">
                            {r.title || ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {entry.synopsis && (
                  <div>
                    <p className="text-xs font-semibold text-white uppercase">
                      Synopsis
                    </p>
                    <p className="text-sm text-zinc-400 mt-1 line-clamp-4 leading-relaxed">
                      {entry.synopsis}
                    </p>
                  </div>
                )}
                {entry.genres && entry.genres.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-white uppercase mb-1">
                      Genres
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {entry.genres.map((g) => (
                        <span
                          key={g}
                          className="text-[11px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entry.watchIf && entry.watchIf.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-white uppercase mb-1">
                      Watch if
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {entry.watchIf.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded-full border border-violet-500/20"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  {entry.trailerUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrailer(entry.trailerUrl!);
                      }}
                      className="btn-primary py-2 px-3 text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Trailer
                    </button>
                  )}
                  {showFocus && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFocus();
                      }}
                      className="btn-secondary py-2 px-3 text-xs font-semibold inline-flex items-center gap-1.5 border border-violet-500/40 text-violet-200 hover:bg-violet-500/10"
                    >
                      <Target className="w-3.5 h-3.5" /> Focus this season
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
