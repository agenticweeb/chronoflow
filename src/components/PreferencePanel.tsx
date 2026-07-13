"use client";

import { Clock, Eye, Heart, Star, Zap, CalendarDays } from "lucide-react";
import {
  UserPreferences,
  TimeBudget,
  Mood,
  SkipPreference,
  PathType,
  CustomSchedule,
} from "@/types";
import { cn } from "@/lib/utils";

interface PreferencePanelProps {
  preferences: UserPreferences;
  onChange: (prefs: UserPreferences) => void;
}

const PACE_OPTIONS: {
  value: TimeBudget;
  label: string;
  desc: string;
  mins: number;
}[] = [
  { value: "casual", label: "Casual", desc: "30 min/day", mins: 30 },
  { value: "regular", label: "Regular", desc: "1 hour/day", mins: 60 },
  { value: "dedicated", label: "Dedicated", desc: "2 hours/day", mins: 120 },
  { value: "binge", label: "Binge", desc: "4 hours/day", mins: 240 },
];

const SKIP_OPTIONS: {
  value: SkipPreference;
  label: string;
  description: string;
}[] = [
  {
    value: "smart-skip",
    label: "Smart Skip",
    description: "Keep story, skip pure filler & recaps. Side stories stay optional.",
  },
  {
    value: "watch-everything",
    label: "Watch Everything",
    description: "Include everything — even recaps. Completionist mode.",
  },
  {
    value: "canon-only",
    label: "Canon Only",
    description: "Only story that matters to the main plot.",
  },
];

const PATH_OPTIONS: {
  value: PathType;
  label: string;
  description: string;
}[] = [
  {
    value: "optimal",
    label: "Optimal",
    description: "Release order that preserves reveals (best for first-timers).",
  },
  {
    value: "release",
    label: "Release Order",
    description: "Exactly as it aired — no reordering.",
  },
  {
    value: "chronological",
    label: "Chronological",
    description: "In-universe timeline. May spoil later reveals.",
  },
];

const MOOD_OPTIONS: { value: Mood; label: string }[] = [
  { value: "all", label: "Any" },
  { value: "action", label: "Action" },
  { value: "feels", label: "Feels" },
  { value: "mindfuck", label: "Mindfuck" },
  { value: "comedy", label: "Comedy" },
  { value: "horror", label: "Horror" },
  { value: "mystery", label: "Mystery" },
  { value: "romance", label: "Romance" },
  { value: "adventure", label: "Adventure" },
];

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

const DEFAULT_CUSTOM_SCHEDULE: CustomSchedule = {
  enabled: false,
  monday: { enabled: true, startTime: "20:00", endTime: "22:00" },
  tuesday: { enabled: true, startTime: "20:00", endTime: "22:00" },
  wednesday: { enabled: true, startTime: "20:00", endTime: "22:00" },
  thursday: { enabled: true, startTime: "20:00", endTime: "22:00" },
  friday: { enabled: true, startTime: "20:00", endTime: "22:00" },
  saturday: { enabled: true, startTime: "10:00", endTime: "16:00" },
  sunday: { enabled: true, startTime: "10:00", endTime: "16:00" },
};

export function PreferencePanel({
  preferences,
  onChange,
}: PreferencePanelProps) {
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
    <div className="glass-card p-5 sm:p-6 space-y-6 border border-chrono-border/40 bg-chrono-surface/40">
      <div>
        <h2 className="text-lg font-semibold text-chrono-text tracking-tight">
          How you watch
        </h2>
        <p className="text-xs text-chrono-text-dim mt-1">
          These never change what exists — only order preference, skips, and
          finish dates.
        </p>
      </div>

      {/* Pace = finish dates only */}
      <div className={cn(preferences.customSchedule?.enabled && "opacity-50 pointer-events-none")}>
        <label className="flex items-center gap-2 text-sm font-medium text-chrono-text-muted mb-2">
          <Clock className="w-4 h-4 text-chrono-primary" />
          Daily pace
          <span className="text-[10px] font-normal text-chrono-text-dim ml-1">
            · finish date only, not order (Overridden when Custom Weekly Schedule is enabled)
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PACE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                onChange({ ...preferences, timeBudget: opt.value })
              }
              className={cn(
                "flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl text-left transition-all border",
                preferences.timeBudget === opt.value
                  ? "bg-chrono-primary text-white border-chrono-primary shadow-lg shadow-chrono-primary/20"
                  : "bg-chrono-surface text-chrono-text-muted border-chrono-border hover:border-chrono-primary/40 hover:text-chrono-text"
              )}
            >
              <span className="text-sm font-semibold flex items-center gap-1.5">
                {opt.value === "binge" ? (
                  <Zap className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5 opacity-70" />
                )}
                {opt.label}
              </span>
              <span
                className={cn(
                  "text-[11px]",
                  preferences.timeBudget === opt.value
                    ? "text-white/70"
                    : "text-chrono-text-dim"
                )}
              >
                {opt.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* New: Custom Day-by-Day Schedule Builder */}
      <div className="border-t border-chrono-border/20 pt-5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-chrono-text-muted">
            <CalendarDays className="w-4 h-4 text-chrono-primary" />
            Custom Weekly Schedule
            <span className="text-[10px] font-normal text-chrono-text-dim ml-1">
              · custom watch blocks per day
            </span>
          </label>
          <button
            type="button"
            onClick={() => {
              const currentSched = preferences.customSchedule || DEFAULT_CUSTOM_SCHEDULE;
              onChange({
                ...preferences,
                customSchedule: {
                  ...currentSched,
                  enabled: !currentSched.enabled,
                },
              });
            }}
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-lg border transition-all",
              preferences.customSchedule?.enabled
                ? "bg-chrono-primary/20 border-chrono-primary text-chrono-primary"
                : "bg-chrono-surface border-chrono-border text-chrono-text-muted"
            )}
          >
            {preferences.customSchedule?.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        {preferences.customSchedule?.enabled && (
          <div className="mt-4 p-4 rounded-xl border border-chrono-border/30 bg-chrono-surface/30 space-y-3.5 animate-slide-up">
            <p className="text-[11px] text-chrono-text-dim leading-relaxed">
              Configure exactly which days of the week you can watch anime, and during what specific hours. ChronoFlow will dynamically calculate your completion timeline.
            </p>

            <div className="space-y-2">
              {DAYS_OF_WEEK.map((day) => {
                const sched = preferences.customSchedule || DEFAULT_CUSTOM_SCHEDULE;
                const daySched = sched[day.key] || { enabled: true, startTime: "20:00", endTime: "22:00" };

                return (
                  <div
                    key={day.key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-black/25 border border-chrono-border/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={daySched.enabled}
                        onChange={(e) => {
                          const updated = {
                            ...sched,
                            [day.key]: {
                              ...daySched,
                              enabled: e.target.checked,
                            },
                          };
                          onChange({ ...preferences, customSchedule: updated });
                        }}
                        className="rounded border-chrono-border bg-chrono-surface text-chrono-primary focus:ring-chrono-primary w-4 h-4 cursor-pointer"
                      />
                      <span className={cn("text-xs font-semibold", daySched.enabled ? "text-chrono-text" : "text-chrono-text-dim")}>
                        {day.label}
                      </span>
                    </div>

                    {daySched.enabled && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-chrono-text-dim text-[11px]">Watch from</span>
                        <input
                          type="time"
                          value={daySched.startTime}
                          onChange={(e) => {
                            const updated = {
                              ...sched,
                              [day.key]: {
                                ...daySched,
                                startTime: e.target.value,
                              },
                            };
                            onChange({ ...preferences, customSchedule: updated });
                          }}
                          className="bg-chrono-surface border border-chrono-border/50 text-chrono-text rounded px-2 py-1 focus:ring-1 focus:ring-chrono-primary font-medium"
                        />
                        <span className="text-chrono-text-dim text-[11px]">to</span>
                        <input
                          type="time"
                          value={daySched.endTime}
                          onChange={(e) => {
                            const updated = {
                              ...sched,
                              [day.key]: {
                                ...daySched,
                                endTime: e.target.value,
                              },
                            };
                            onChange({ ...preferences, customSchedule: updated });
                          }}
                          className="bg-chrono-surface border border-chrono-border/50 text-chrono-text rounded px-2 py-1 focus:ring-1 focus:ring-chrono-primary font-medium"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Skip strategy */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-chrono-text-muted mb-2">
          <Eye className="w-4 h-4 text-chrono-primary" />
          Skip strategy
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SKIP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                onChange({ ...preferences, skipPreference: opt.value })
              }
              className={cn(
                "p-3 rounded-xl text-left transition-all border",
                preferences.skipPreference === opt.value
                  ? "bg-chrono-primary/15 border-chrono-primary/50 text-chrono-text ring-1 ring-chrono-primary/30"
                  : "bg-chrono-surface border-chrono-border text-chrono-text-muted hover:border-chrono-text-dim"
              )}
            >
              <div className="font-medium text-sm">{opt.label}</div>
              <div className="text-[11px] mt-1 leading-snug opacity-80">
                {opt.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Path preference */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-chrono-text-muted mb-2">
          <Star className="w-4 h-4 text-chrono-primary" />
          Viewing path
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PATH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                onChange({ ...preferences, preferredPath: opt.value })
              }
              className={cn(
                "p-3 rounded-xl text-left transition-all border",
                preferences.preferredPath === opt.value
                  ? "bg-chrono-primary/15 border-chrono-primary/50 text-chrono-text ring-1 ring-chrono-primary/30"
                  : "bg-chrono-surface border-chrono-border text-chrono-text-muted hover:border-chrono-text-dim"
              )}
            >
              <div className="font-medium text-sm">{opt.label}</div>
              <div className="text-[11px] mt-1 leading-snug opacity-80">
                {opt.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-chrono-text-muted mb-2">
          <Heart className="w-4 h-4 text-chrono-accent" />
          Mood
          <span className="text-[10px] font-normal text-chrono-text-dim">
            · optional · influences path pick, not titles
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleMood(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                preferences.mood?.includes(opt.value)
                  ? "bg-chrono-accent/15 text-chrono-accent border-chrono-accent/40"
                  : "bg-chrono-surface text-chrono-text-muted border-chrono-border hover:border-chrono-text-dim"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
