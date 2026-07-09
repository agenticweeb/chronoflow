"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Clock, Zap, Share2, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import type { TimeBudgetResult, PaceEstimate } from "@/lib/time-calculator";
import { cn } from "@/lib/utils";

type Mode = "view" | "export";

interface TimeBudgetCardProps {
  data: TimeBudgetResult;
  preferredPaceLabel?: string;
  onShare?: (url: string) => void | Promise<void>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "chronoflow.app";

export function TimeBudgetCard({
  data,
  preferredPaceLabel,
  onShare,
}: TimeBudgetCardProps) {
  const [mode, setMode] = useState<Mode>("view");
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const totalHours = Math.round(data.totalMinutes / 60);
  const skipHours = Math.round(data.skippedMinutes / 60);

  const featured = useMemo(() => {
    return (
      data.paces.find((p) => p.label === preferredPaceLabel) ??
      data.paces.find((p) => p.label === "Regular") ??
      data.paces[0]
    );
  }, [data.paces, preferredPaceLabel]);

  const others = useMemo(() => {
    return data.paces.filter((p) => p.label !== featured?.label);
  }, [data.paces, featured]);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      setMode("export");
      // Yield to the event loop so the rendering mode switch takes visual effect
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      
      const png = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#0a0a0f",
        cacheBust: true,
      });

      if (typeof window !== "undefined") {
        const blob = await (await fetch(png)).blob();
        const file = new File(
          [blob],
          `${slugify(data.franchise)}-time-budget.png`,
          { type: "image/png" }
        );
        
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${data.franchise} — Time Budget`,
            text: `Time to finish ${data.franchise}: ${featured?.duration ?? "—"} at my pace.`,
          });
        } else {
          const a = document.createElement("a");
          a.href = png;
          a.download = file.name;
          a.click();
        }
      }
      await onShare?.(png);
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setMode("view");
      setSharing(false);
    }
  }, [data.franchise, featured?.duration, onShare]);

  if (!data.paces.length) {
    return (
      <div className="glass-card p-6 text-center text-sm text-chrono-text-dim">
        No time data for "{data.franchise}".
      </div>
    );
  }

  return (
    <section
      ref={cardRef}
      aria-labelledby="tbc-title"
      aria-live="polite"
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <header className="p-6 border-b border-chrono-border/30 flex items-center justify-between">
        <div>
          <h3 id="tbc-title" className="text-lg font-bold text-chrono-text">
            {data.franchise || "Untitled Franchise"}
          </h3>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-chrono-text-muted">
            <span>
              <strong className="text-chrono-text">{data.totalEpisodes}</strong> episodes
            </span>
            <span aria-hidden>·</span>
            <span>
              <strong className="text-chrono-text">{totalHours}h</strong> total
            </span>
            {skipHours > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="text-chrono-accent">
                  <Zap className="inline h-3.5 w-3.5 mr-1" aria-hidden />
                  <strong>{skipHours}h saved</strong> by Smart Skip
                </span>
              </>
            )}
          </div>
        </div>

        {mode === "view" && (
          <button
            onClick={handleShare}
            disabled={sharing}
            aria-label="Share time-budget card as image"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              "bg-chrono-primary/15 text-chrono-primary ring-1 ring-chrono-primary/30",
              "hover:bg-chrono-primary/25 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chrono-primary"
            )}
          >
            {sharing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Share2 className="h-4 w-4" aria-hidden />
            )}
            {sharing ? "Capturing…" : "Share"}
          </button>
        )}
      </header>

      {/* Featured Pace */}
      <div className="p-6">
        {featured && <FeaturedPace pace={featured} />}

        {/* Reference Paces */}
        {others.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {others.map((p) => (
              <ReferencePace key={p.label} pace={p} />
            ))}
          </div>
        )}

        {mode === "view" && (
          <p className="mt-4 text-xs text-chrono-text-dim">
            Estimates assume daily viewing at the listed pace.
          </p>
        )}
      </div>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-chrono-border/30 bg-chrono-surface/50">
        <div className="flex items-center justify-between text-xs text-chrono-text-dim">
          <span>{SITE_URL}</span>
          <span>Estimates assume daily viewing</span>
        </div>
      </footer>
    </section>
  );
}

function FeaturedPace({ pace }: { pace: PaceEstimate }) {
  const [year, month, day] = pace.finishDate.split("-").map(Number);
  const finish = new Date(Date.UTC(year, month - 1, day));
  const relative = humanizeRelative(finish);

  return (
    <div className="rounded-2xl border border-chrono-primary/30 bg-chrono-primary/[0.08] p-5">
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-chrono-primary/80">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {pace.label} pace
        </span>
        <span>{pace.minutesPerDay} min/day</span>
      </div>
      <div className="mt-3">
        <span className="text-4xl font-bold tracking-tight text-chrono-text sm:text-5xl">
          {pace.duration}
        </span>
      </div>
      <div className="mt-2 text-sm text-chrono-text-muted font-medium">
        to finish the franchise
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 text-sm text-chrono-text-dim">
        <span>
          Done by <strong className="font-semibold text-chrono-accent">{pace.finishDate}</strong>
        </span>
        {relative && <span className="text-chrono-text-dim/60">({relative})</span>}
      </div>
    </div>
  );
}

function ReferencePace({ pace }: { pace: PaceEstimate }) {
  return (
    <div className="rounded-lg border border-chrono-border/50 bg-chrono-surface p-3">
      <div className="text-[10px] uppercase tracking-wider text-chrono-text-dim">
        {pace.label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-chrono-text">
        {pace.durationShort}
      </div>
      <div className="text-[10px] text-chrono-text-dim">
        {pace.minutesPerDay}m/day
      </div>
    </div>
  );
}

function humanizeRelative(date: Date): string {
  const now = new Date();
  const days = Math.round((date.getTime() - now.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 30) return `in ${days} days`;
  const months = Math.round(days / 30);
  if (months < 12) return `in ~${months} months`;
  return `in ~${Math.round(months / 12)}y ${months % 12}mo`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
