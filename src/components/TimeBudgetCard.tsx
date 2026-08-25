"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Clock, Zap, Share2, Loader2, CalendarRange, Film, Layers, CheckCircle2 } from "lucide-react";
import { toPng } from "html-to-image";
import type { TimeBudgetResult, PaceEstimate } from "@/lib/time-calculator";
import { formatMinutesExact } from "@/lib/time-calculator";
import { cn } from "@/lib/utils";

type Mode = "view" | "export";

interface Props {
  data: TimeBudgetResult;
  preferredPaceLabel?: string;
  onShare?: (u: string) => void | Promise<void>;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "myaniwatchorder.app";

export function TimeBudgetCard({
  data,
  preferredPaceLabel,
  onShare,
}: Props) {
  const [mode, setMode] = useState<Mode>("view");
  const [sharing, setSharing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const totalHM = formatMinutesExact(data.totalMinutes);
  const watchableHM = formatMinutesExact(data.watchableMinutes);
  const skipHM = data.skippedMinutes > 0 ? formatMinutesExact(data.skippedMinutes) : null;

  const featured = useMemo(
    () =>
      data.paces.find((p) => p.label === preferredPaceLabel) ??
      data.paces.find((p) => p.label === "Custom") ??
      data.paces.find((p) => p.label === "Regular") ??
      data.paces[0],
    [data.paces, preferredPaceLabel]
  );

  const others = useMemo(
    () => data.paces.filter((p) => p.label !== featured?.label),
    [data.paces, featured]
  );

  const share = useCallback(async () => {
    if (!ref.current) return;
    setSharing(true);
    try {
      setMode("export");
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const png = await toPng(ref.current, {
        pixelRatio: 2,
        backgroundColor: "#0a0a12",
        cacheBust: true,
      });
      if (typeof window !== "undefined") {
        const b = await (await fetch(png)).blob();
        const f = new File(
          [b],
          `${slugify(data.franchise)}-time.png`,
          { type: "image/png" }
        );
        if (navigator.canShare?.({ files: [f] })) {
          await navigator.share({
            files: [f],
            title: `${data.franchise} — Time Budget`,
            text: `${featured?.duration} at ${featured?.label} pace`,
          });
        } else {
          const a = document.createElement("a");
          a.href = png;
          a.download = f.name;
          a.click();
        }
      }
      await onShare?.(png);
    } finally {
      setMode("view");
      setSharing(false);
    }
  }, [data.franchise, featured, onShare]);

  if (!data.paces.length) {
    return (
      <div className="glass-card p-6 text-center text-sm text-chrono-text-muted">
        No time data for &ldquo;{data.franchise}&rdquo;
      </div>
    );
  }

  return (
    <section
      ref={ref}
      className="glass-card overflow-hidden border border-chrono-border/50 bg-gradient-to-br from-chrono-surface/90 via-chrono-bg to-chrono-primary/5"
    >
      <header className="p-5 sm:p-6 border-b border-chrono-border/30 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-chrono-primary/80 font-semibold mb-1">
            Time experience
          </p>
          <h3 className="text-lg font-bold text-chrono-text">
            {data.franchise || "Untitled"}
          </h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-chrono-text-muted">
            <span>
              <strong className="text-chrono-text">
                {data.watchableEpisodes || data.totalEpisodes}
              </strong>{" "}
              watchable eps
            </span>
            <span aria-hidden>·</span>
            <span>
              <strong className="text-chrono-text">{watchableHM}</strong> watchable
            </span>
            {skipHM && (
              <>
                <span aria-hidden>·</span>
                <span className="text-chrono-accent inline-flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" />
                  <strong>{skipHM} saved</strong> by skip strategy
                </span>
              </>
            )}
          </div>
        </div>
        {mode === "view" && (
          <button
            onClick={share}
            disabled={sharing}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium shrink-0",
              "bg-chrono-primary/15 text-chrono-primary ring-1 ring-chrono-primary/30 hover:bg-chrono-primary/25 transition-colors"
            )}
          >
            {sharing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {sharing ? "Capturing…" : "Share card"}
          </button>
        )}
      </header>

      <div className="p-5 sm:p-6">
        {/* ADAPTIVE RENDERING BASED ON CONTENT TYPE */}
        
        {data.contentType === "single_sitting" ? (
          <div className="text-center py-8 space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-chrono-primary/10 border border-chrono-primary/30 mb-2">
              <Film className="w-8 h-8 text-chrono-primary" />
            </div>
            <div className="text-4xl font-extrabold text-white tracking-tight">
              {data.singleSittingTime}
            </div>
            <p className="text-sm text-chrono-text-muted">
              {data.canFinishToday 
                ? "You can finish this today in one sitting." 
                : "Plan for a single sitting session."}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-chrono-surface/50 border border-chrono-border/30 text-sm font-semibold text-chrono-text mt-2">
              <Clock className="w-4 h-4 text-chrono-primary" />
              Finish {featured.relativeLabel} ({featured.finishDate})
            </div>
          </div>
        ) : (
          <>
            {/* Mixed Franchise Breakdown Table */}
            {data.contentType === "mixed_franchise" && data.typeBreakdown && (
              <div className="mb-6 glass-card p-4 rounded-xl border border-chrono-border/20 space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-chrono-primary" />
                  <h4 className="text-xs font-bold text-chrono-text uppercase tracking-wider">Franchise Breakdown</h4>
                </div>
                {data.typeBreakdown.map((b) => (
                  <div key={b.type} className="flex justify-between items-center text-xs border-b border-chrono-border/10 pb-2 last:border-0 last:pb-0">
                    <span className="text-chrono-text-muted font-medium">{b.type}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-chrono-text-dim">{b.count} eps</span>
                      <span className="text-chrono-text font-bold w-16 text-right">{formatMinutesExact(b.watchableMinutes)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Standard Featured & Others Paces */}
            {featured && <Featured pace={featured} />}
            {others.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {others.map((p) => (
                  <Ref key={p.label} pace={p} />
                ))}
              </div>
            )}

            {data.contentType === "short_series" && (
              <div className="mt-4 flex items-center gap-2 text-xs text-sky-300 bg-sky-500/10 border border-sky-500/20 rounded-xl p-3">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Short series detected. Perfect for a weekend binge!</span>
              </div>
            )}
          </>
        )}

        <p className="mt-4 text-xs text-chrono-text-dim leading-relaxed">
          {data.mathNote}. Estimates assume daily viewing at the selected pace.
          Order never changes — only finish date.
        </p>
      </div>

      <footer className="px-5 sm:px-6 py-3 border-t border-chrono-border/30 bg-black/20 flex justify-between text-[11px] text-chrono-text-dim">
        <span>{SITE}</span>
        <span>
          Full path {totalHM}
          {skipHM ? ` · skip ${skipHM}` : ""}
        </span>
      </footer>
    </section>
  );
}

function Featured({ pace }: { pace: PaceEstimate }) {
  const isCustom = pace.label === "Custom";
  return (
    <div className="rounded-2xl border border-chrono-primary/35 bg-chrono-primary/[0.09] p-5 sm:p-6">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-chrono-primary/90 font-semibold">
        <span className="inline-flex items-center gap-1.5">
          {isCustom ? <CalendarRange className="h-3.5 w-3.5 text-chrono-primary" /> : <Clock className="h-3.5 w-3.5" />}
          {isCustom ? "Your Weekly Schedule" : `${pace.label} pace`}
        </span>
        <span>{isCustom ? "Custom active hours" : `${pace.minutesPerDay} min/day`}</span>
      </div>
      <div className="mt-3">
        <span className="text-3xl sm:text-5xl font-bold tracking-tight text-chrono-text">
          {pace.duration}
        </span>
        <span className="ml-2 text-sm text-chrono-text-muted font-medium">
          to finish
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-chrono-text-muted">
        <span>
          Done by{" "}
          <strong className="font-semibold text-chrono-accent">
            {pace.finishDate}
          </strong>
        </span>
        <span className="text-chrono-text-dim">({pace.relativeLabel})</span>
      </div>
    </div>
  );
}

function Ref({ pace }: { pace: PaceEstimate }) {
  return (
    <div className="rounded-xl border border-chrono-border/50 bg-chrono-surface/80 p-3">
      <div className="text-[10px] uppercase tracking-wider text-chrono-text-dim">
        {pace.label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-chrono-text">
        {pace.durationShort}
      </div>
      <div className="text-[10px] text-chrono-text-dim mt-0.5">
        {pace.finishDate}
      </div>
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
