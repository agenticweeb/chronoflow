"use client";

import { useState } from "react";
import {
  Clock,
  Zap,
  Heart,
  Eye,
  Film,
  Tv,
  Star,
  Calendar,
} from "lucide-react";
import {
  UserPreferences,
  TimeBudget,
  Mood,
  SkipPreference,
  PathType,
} from "@/types";
import { cn } from "@/lib/utils";

interface PreferencePanelProps {
  preferences: UserPreferences;
  onChange: (prefs: UserPreferences) => void;
}

const TIME_OPTIONS: { value: TimeBudget; label: string; icon: React.ReactNode }[] =
  [
    { value: "1hour", label: "1 Hour", icon: <Clock className="w-4 h-4" /> },
    { value: "3hours", label: "3 Hours", icon: <Clock className="w-4 h-4" /> },
    { value: "1day", label: "1 Day", icon: <Calendar className="w-4 h-4" /> },
    { value: "1week", label: "1 Week", icon: <Calendar className="w-4 h-4" /> },
    { value: "binge", label: "Binge", icon: <Zap className="w-4 h-4" /> },
  ];

const MOOD_OPTIONS: { value: Mood; label: string }[] = [
  { value: "all", label: "All" },
  { value: "action", label: "Action" },
  { value: "feels", label: "Feels" },
  { value: "mindfuck", label: "Mindfuck" },
  { value: "comedy", label: "Comedy" },
  { value: "horror", label: "Horror" },
  { value: "mystery", label: "Mystery" },
  { value: "romance", label: "Romance" },
  { value: "adventure", label: "Adventure" },
];

const SKIP_OPTIONS: { value: SkipPreference; label: string; description: string }[] =
  [
    {
      value: "smart-skip",
      label: "Smart Skip",
      description: "AI decides — keeps character intros, skips recaps",
    },
    {
      value: "skip-all-filler",
      label: "Skip All Filler",
      description: "Aggressive — skips anything non-canon",
    },
    {
      value: "canon-only",
      label: "Canon Only",
      description: "Plot-critical episodes only",
    },
    {
      value: "watch-everything",
      label: "Everything",
      description: "Completionist — no skips",
    },
  ];

const PATH_OPTIONS: { value: PathType; label: string; description: string }[] =
  [
    {
      value: "optimal",
      label: "Optimal",
      description: "AI-optimized for best first-time experience",
    },
    {
      value: "release",
      label: "Release Order",
      description: "As it aired — recommended for first-timers",
    },
    {
      value: "chronological",
      label: "Chronological",
      description: "In-universe timeline order",
    },
    {
      value: "manga",
      label: "Manga Order",
      description: "Follows manga structure",
    },
  ];

export function PreferencePanel({
  preferences,
  onChange,
}: PreferencePanelProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleMood = (mood: Mood) => {
    if (mood === "all") {
      onChange({ ...preferences, mood: ["all"] });
      return;
    }
    const current = preferences.mood || ["all"];
    const withoutAll = current.filter((m) => m !== "all");

    if (withoutAll.includes(mood)) {
      const filtered = withoutAll.filter((m) => m !== mood);
      onChange({
        ...preferences,
        mood: filtered.length === 0 ? ["all"] : filtered,
      });
    } else {
      onChange({ ...preferences, mood: [...withoutAll, mood] });
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-chrono-text">
          Your Preferences
        </h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-chrono-primary hover:text-chrono-primary-hover transition-colors"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Time Budget */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-chrono-text-muted mb-3">
          <Clock className="w-4 h-4" />
          Time Budget
        </label>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                onChange({ ...preferences, timeBudget: opt.value })
              }
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                preferences.timeBudget === opt.value
                  ? "bg-chrono-primary text-white shadow-lg shadow-chrono-primary/25"
                  : "bg-chrono-surface text-chrono-text-muted hover:bg-chrono-surface-hover hover:text-chrono-text"
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-chrono-text-muted mb-3">
          <Heart className="w-4 h-4" />
          Mood
        </label>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleMood(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                preferences.mood?.includes(opt.value)
                  ? "bg-chrono-accent/20 text-chrono-accent border border-chrono-accent/30"
                  : "bg-chrono-surface text-chrono-text-muted border border-chrono-border hover:border-chrono-text-dim"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skip Preference */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-chrono-text-muted mb-3">
          <Eye className="w-4 h-4" />
          Skip Strategy
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SKIP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                onChange({ ...preferences, skipPreference: opt.value })
              }
              className={cn(
                "p-3 rounded-xl text-left transition-all border",
                preferences.skipPreference === opt.value
                  ? "bg-chrono-primary/10 border-chrono-primary/50 text-chrono-text"
                  : "bg-chrono-surface border-chrono-border text-chrono-text-muted hover:border-chrono-text-dim"
              )}
            >
              <div className="font-medium text-sm">{opt.label}</div>
              <div className="text-xs mt-1 opacity-70">
                {opt.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Path Type */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-chrono-text-muted mb-3">
          <Star className="w-4 h-4" />
          Viewing Path
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PATH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                onChange({ ...preferences, preferredPath: opt.value })
              }
              className={cn(
                "p-3 rounded-xl text-left transition-all border",
                preferences.preferredPath === opt.value
                  ? "bg-chrono-primary/10 border-chrono-primary/50 text-chrono-text"
                  : "bg-chrono-surface border-chrono-border text-chrono-text-muted hover:border-chrono-text-dim"
              )}
            >
              <div className="font-medium text-sm">{opt.label}</div>
              <div className="text-xs mt-1 opacity-70">
                {opt.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Type Toggles (expanded) */}
      {expanded && (
        <div className="animate-slide-up">
          <label className="flex items-center gap-2 text-sm font-medium text-chrono-text-muted mb-3">
            <Film className="w-4 h-4" />
            Include Content Types
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              {
                key: "includeMovies" as const,
                label: "Movies",
                icon: Film,
              },
              { key: "includeOVAs" as const, label: "OVAs", icon: Tv },
              {
                key: "includeSpecials" as const,
                label: "Specials",
                icon: Star,
              },
              {
                key: "includeRecaps" as const,
                label: "Recaps",
                icon: Calendar,
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={preferences[item.key]}
                  onChange={(e) =>
                    onChange({ ...preferences, [item.key]: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-chrono-border bg-chrono-surface text-chrono-primary focus:ring-chrono-primary/20"
                />
                <span className="text-sm text-chrono-text-muted">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
