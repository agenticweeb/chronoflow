/**
 * Time-Budget & Episode-Pace Calculator — Content-Type Aware V3.0
 * 
 * Detects the dominant content type of a watch order and adapts:
 * - Movie/Single-Sitting → "Watch time" + "Finish today/tomorrow"
 * - TV Series → "Episodes per day" + "Finish date"
 * - Mixed Franchise → "Overall pace" + "Per-type breakdown"
 */

import { CustomSchedule } from "@/types";

export type SkipTier = "essential" | "recommended" | "optional" | "skip";

export interface FranchiseEntry {
  title: string;
  episodes: number;
  durationMin: number;
  tier: SkipTier;
  isFiller?: boolean;
  format?: "TV" | "MOVIE" | "OVA" | "SPECIAL" | "ONA" | "UNKNOWN";
}

export type ContentDominance = 
  | "single_sitting"    // 1 movie or 1-3 short episodes, < 3 hours total
  | "short_series"      // 4-12 episodes, can be finished in 1-3 days
  | "tv_series"         // 13+ episodes, multi-week commitment
  | "mixed_franchise";  // Multiple types, needs breakdown

export interface PaceEstimate {
  label: string;
  minutesPerDay: number;
  duration: string;
  durationShort: string;
  finishDate: string;
  daysCeil: number;
  relativeLabel: string;
}

export interface TimeBudgetResult {
  franchise: string;
  contentType: ContentDominance;
  totalEpisodes: number;
  totalMinutes: number;
  skippedEpisodes: number;
  skippedMinutes: number;
  watchableMinutes: number;
  watchableEpisodes: number;
  avgMinutesPerEp: number;
  paces: PaceEstimate[];
  mathNote: string;
  // NEW: Per-type breakdown for mixed franchises
  typeBreakdown?: Array<{
    type: string;
    count: number;
    totalMinutes: number;
    watchableMinutes: number;
  }>;
  // NEW: Single-sitting specific
  singleSittingTime?: string;
  canFinishToday: boolean;
}

export const PACES = [
  { label: "Casual", minutesPerDay: 30 },
  { label: "Regular", minutesPerDay: 60 },
  { label: "Dedicated", minutesPerDay: 120 },
  { label: "Binge", minutesPerDay: 240 },
] as const;

export type PaceLabel = (typeof PACES)[number]["label"] | "Custom" | "Episodes";

export function paceFromTimeBudget(budget?: string | null): PaceLabel {
  const map: Record<string, PaceLabel> = {
    casual: "Casual", regular: "Regular", dedicated: "Dedicated", binge: "Binge",
    "1hour": "Casual", "3hours": "Regular", "1day": "Dedicated", "1week": "Dedicated",
  };
  return map[budget || "regular"] || "Regular";
}

// ─── Helpers ───

function formatHM(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
}

function localNoon(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}

function formatLocalYMD(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function relativeFromAdditionalDays(additionalDays: number): string {
  if (additionalDays <= 0) return "today";
  if (additionalDays === 1) return "tomorrow";
  return `in ${additionalDays} days`;
}

function isSavingsTier(tier: SkipTier): boolean {
  return tier === "skip";
}

// ─── Content Type Detection ───

function detectContentDominance(entries: FranchiseEntry[]): ContentDominance {
  const totalEpisodes = entries.reduce((sum, e) => sum + (e.episodes || 0), 0);
  const totalMinutes = entries.reduce((sum, e) => sum + (e.episodes * e.durationMin), 0);
  
  // Count by format
  const movieCount = entries.filter(e => e.format === "MOVIE" || e.durationMin > 45).length;
  const tvCount = entries.filter(e => e.format === "TV" || (e.episodes > 1 && e.durationMin <= 45)).length;
  const ovaCount = entries.filter(e => e.format === "OVA" || e.format === "SPECIAL").length;
  
  // Single sitting: 1 entry, < 3 hours, or all movies
  if (entries.length === 1 && totalMinutes <= 180) return "single_sitting";
  if (entries.length > 0 && entries.every(e => e.format === "MOVIE" || e.durationMin > 45)) {
    // All movies — but how many?
    if (totalMinutes <= 240) return "single_sitting"; // 1-2 movies, watchable in one go
    return "short_series"; // 3+ movies, takes a few days
  }
  
  // Short series: 4-12 episodes or < 6 hours
  if (totalEpisodes <= 12 || totalMinutes <= 360) return "short_series";
  
  // Mixed: has both TV and movies/OVAs
  if (tvCount > 0 && (movieCount > 0 || ovaCount > 0)) return "mixed_franchise";
  
  // Default: TV series
  return "tv_series";
}

// ─── Calendar-Day Finish Calculator (Definitive) ───

function additionalCalendarDays(totalMinutes: number, minutesPerDay: number): number {
  if (totalMinutes <= 0) return 0;
  if (minutesPerDay <= 0) return 0;
  
  // Simulate: Day 0 you watch minutesPerDay, Day 1 you watch minutesPerDay, etc.
  // Return how many ADDITIONAL days beyond Day 0 you need.
  let remaining = totalMinutes;
  let additionalDays = 0;
  
  // Day 0: you watch up to minutesPerDay
  remaining -= minutesPerDay;
  if (remaining <= 0) return 0; // Finished today
  
  // Each subsequent day
  while (remaining > 0) {
    remaining -= minutesPerDay;
    additionalDays++;
  }
  
  return additionalDays;
}

// ─── Duration String (Content-Aware) ───

function formatDurationForType(
  totalMinutes: number, 
  contentType: ContentDominance,
  totalEpisodes: number
): { full: string; short: string } {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return { full: "—", short: "—" };
  if (totalMinutes === 0) return { full: "0 minutes", short: "0m" };
  
  // Single sitting: show as watch time, not "days"
  if (contentType === "single_sitting") {
    return { full: formatHM(totalMinutes), short: formatHM(totalMinutes) };
  }
  
  // Short series: show episodes + time
  if (contentType === "short_series") {
    const hm = formatHM(totalMinutes);
    return { 
      full: `${totalEpisodes} episode${totalEpisodes === 1 ? "" : "s"} · ${hm}`, 
      short: `${totalEpisodes}eps · ${hm}` 
    };
  }
  
  // TV series / Mixed: show in days/weeks/months
  const fractionalDays = totalMinutes / 60; // Assume 1 hour/day baseline for duration display
  const d = Math.ceil(fractionalDays);
  
  if (d < 7) return { full: `${d} day${d === 1 ? "" : "s"}`, short: `${d}d` };
  if (d < 30) {
    const weeks = Math.floor(d / 7);
    const remaining = d % 7;
    if (remaining === 0) return { full: `${weeks}w`, short: `${weeks}w` };
    return { full: `${weeks}w ${remaining}d`, short: `${weeks}w ${remaining}d` };
  }
  if (d < 365) {
    const months = Math.floor(d / 30);
    const remaining = d % 30;
    const weeks = Math.floor(remaining / 7);
    if (weeks === 0) return { full: `${months}mo`, short: `${months}mo` };
    return { full: `${months}mo ${weeks}w`, short: `${months}mo ${weeks}w` };
  }
  const years = Math.floor(d / 365);
  const remaining = d % 365;
  const months = Math.floor(remaining / 30);
  if (months === 0) return { full: `${years}y`, short: `${years}y` };
  return { full: `${years}y ${months}mo`, short: `${years}y ${months}mo` };
}

// ─── Per-Type Breakdown (for Mixed Franchises) ───

function calculateTypeBreakdown(entries: FranchiseEntry[]): TimeBudgetResult["typeBreakdown"] {
  const groups = new Map<string, { count: number; totalMin: number; watchableMin: number }>();
  
  for (const e of entries) {
    const type = e.format || "UNKNOWN";
    const existing = groups.get(type) || { count: 0, totalMin: 0, watchableMin: 0 };
    const totalMins = e.episodes * e.durationMin;
    const isSkipped = isSavingsTier(e.tier) || e.isFiller;
    
    groups.set(type, {
      count: existing.count + e.episodes,
      totalMin: existing.totalMin + totalMins,
      watchableMin: existing.watchableMin + (isSkipped ? 0 : totalMins),
    });
  }
  
  return Array.from(groups.entries()).map(([type, data]) => ({
    type,
    count: data.count,
    totalMinutes: data.totalMin,
    watchableMinutes: data.watchableMin,
  }));
}

// ─── Custom Schedule Calculator ───

function calculateCustomScheduleFinish(
  watchableMinutes: number,
  startDate: Date,
  schedule: CustomSchedule
): { daysCeil: number; finishDate: string; relativeLabel: string; activeMinutesPerWeek: number } {
  let remainingMinutes = watchableMinutes;
  let dayCursor = localNoon(startDate);
  let daysCount = 0;

  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

  let activeMinutesPerWeek = 0;
  daysOfWeek.forEach(day => {
    const daily = schedule[day];
    if (daily && daily.enabled) {
      const [startH, startM] = daily.startTime.split(":").map(Number);
      const [endH, endM] = daily.endTime.split(":").map(Number);
      const totalMins = (endH * 60 + endM) - (startH * 60 + startM);
      if (totalMins > 0) activeMinutesPerWeek += totalMins;
    }
  });

  if (activeMinutesPerWeek <= 0 || watchableMinutes <= 0) {
    return { daysCeil: 0, finishDate: formatLocalYMD(startDate), relativeLabel: "today", activeMinutesPerWeek: 0 };
  }

  while (remainingMinutes > 0) {
    const dayName = daysOfWeek[dayCursor.getDay()];
    const daily = schedule[dayName];
    if (daily && daily.enabled) {
      const [startH, startM] = daily.startTime.split(":").map(Number);
      const [endH, endM] = daily.endTime.split(":").map(Number);
      const minsAvailable = (endH * 60 + endM) - (startH * 60 + startM);
      if (minsAvailable > 0) remainingMinutes -= minsAvailable;
    }

    if (remainingMinutes > 0) {
      dayCursor.setDate(dayCursor.getDate() + 1);
      daysCount++;
    }
  }

  return {
    daysCeil: daysCount,
    finishDate: formatLocalYMD(dayCursor),
    relativeLabel: relativeFromAdditionalDays(daysCount),
    activeMinutesPerWeek
  };
}

// ─── Main Calculator ───

export function calculateTimeBudget(
  franchise: string,
  entries: FranchiseEntry[],
  startDate: Date = new Date(),
  options?: {
    preSkippedMinutes?: number;
    preSkippedEpisodes?: number;
    customSchedule?: CustomSchedule;
    paceType?: "duration" | "episodes";
    episodesPerDay?: number;
  }
): TimeBudgetResult {
  let totalMinutes = 0;
  let totalEpisodes = 0;
  let skippedMinutes = options?.preSkippedMinutes || 0;
  let skippedEpisodes = options?.preSkippedEpisodes || 0;
  let watchableWeightedEpisodes = 0;

  for (const e of entries) {
    if (!Number.isFinite(e.episodes) || e.episodes <= 0) continue;
    if (!Number.isFinite(e.durationMin) || e.durationMin <= 0) continue;
    
    const m = e.episodes * e.durationMin;
    totalMinutes += m;
    totalEpisodes += e.episodes;

    const isSkipped = isSavingsTier(e.tier) || e.isFiller;
    if (isSkipped) {
      skippedMinutes += m;
      skippedEpisodes += e.episodes;
    } else {
      if (e.durationMin > 40) {
        const equivalentEps = Math.max(1, Math.ceil(e.durationMin / 24)) * e.episodes;
        watchableWeightedEpisodes += equivalentEps;
      } else {
        watchableWeightedEpisodes += e.episodes;
      }
    }
  }

  const watchableMinutes = Math.max(0, totalMinutes - skippedMinutes);
  const watchableEpisodes = Math.max(0, totalEpisodes - skippedEpisodes);
  const avg = totalEpisodes > 0 ? Math.round((totalMinutes / totalEpisodes) * 10) / 10 : 24;

  const contentType = detectContentDominance(entries);
  const noonStart = localNoon(startDate);

  // ─── SINGLE SITTING MODE ───
  // No "paces" — just "when can I watch this?"
  if (contentType === "single_sitting") {
    const canFinishToday = watchableMinutes <= 120; // Reasonable: 2 hours or less
    const finish = new Date(noonStart);
    if (!canFinishToday) {
      finish.setDate(finish.getDate() + 1);
    }
    
    const paces: PaceEstimate[] = [{
      label: "Watch",
      minutesPerDay: watchableMinutes,
      duration: formatHM(watchableMinutes),
      durationShort: formatHM(watchableMinutes),
      finishDate: formatLocalYMD(finish),
      daysCeil: canFinishToday ? 0 : 1,
      relativeLabel: canFinishToday ? "today" : "tomorrow",
    }];

    return {
      franchise,
      contentType,
      totalEpisodes,
      totalMinutes,
      skippedEpisodes,
      skippedMinutes,
      watchableMinutes,
      watchableEpisodes,
      avgMinutesPerEp: avg,
      paces,
      mathNote: `Total watch time: ${formatHM(watchableMinutes)}`,
      singleSittingTime: formatHM(watchableMinutes),
      canFinishToday,
    };
  }

  // ─── SHORT SERIES MODE ───
  // Show paces but emphasize "quick finish"
  if (contentType === "short_series") {
    const paces: PaceEstimate[] = PACES.map((p) => {
      const additionalDays = additionalCalendarDays(watchableMinutes, p.minutesPerDay);
      const finish = new Date(noonStart);
      if (additionalDays > 0) finish.setDate(finish.getDate() + additionalDays);
      
      const { full, short } = formatDurationForType(watchableMinutes, contentType, watchableEpisodes);
      
      return {
        label: p.label,
        minutesPerDay: p.minutesPerDay,
        duration: full,
        durationShort: short,
        finishDate: formatLocalYMD(finish),
        daysCeil: additionalDays,
        relativeLabel: relativeFromAdditionalDays(additionalDays),
      };
    });

    return {
      franchise,
      contentType,
      totalEpisodes,
      totalMinutes,
      skippedEpisodes,
      skippedMinutes,
      watchableMinutes,
      watchableEpisodes,
      avgMinutesPerEp: avg,
      paces,
      mathNote: `Total ${formatHM(totalMinutes)} = ${totalEpisodes} eps × ${avg.toFixed(1)}m avg`,
      canFinishToday: watchableMinutes <= 120, // <--- ADD THIS LINE
    };
  }

  // ─── TV SERIES & MIXED FRANCHISE MODE ───
  // Standard multi-pace calculation with per-type breakdown for mixed
  
  const paces: PaceEstimate[] = PACES.map((p) => {
    const additionalDays = additionalCalendarDays(watchableMinutes, p.minutesPerDay);
    const finish = new Date(noonStart);
    if (additionalDays > 0) finish.setDate(finish.getDate() + additionalDays);
    
    const { full, short } = formatDurationForType(watchableMinutes, contentType, watchableEpisodes);
    
    return {
      label: p.label,
      minutesPerDay: p.minutesPerDay,
      duration: full,
      durationShort: short,
      finishDate: formatLocalYMD(finish),
      daysCeil: additionalDays,
      relativeLabel: relativeFromAdditionalDays(additionalDays),
    };
  });

  if (options?.paceType === "episodes" && options.episodesPerDay && options.episodesPerDay > 0) {
    const fractional = watchableWeightedEpisodes / options.episodesPerDay;
    const additionalDays = watchableWeightedEpisodes <= 0 ? 0 : Math.max(0, Math.ceil(fractional) - 1);
    const finish = new Date(noonStart);
    if (additionalDays > 0) finish.setDate(finish.getDate() + additionalDays);
    const { full, short } = formatDurationForType(watchableMinutes, contentType, watchableEpisodes);

    paces.unshift({
      label: "Episodes",
      minutesPerDay: options.episodesPerDay,
      duration: full,
      durationShort: short,
      finishDate: formatLocalYMD(finish),
      daysCeil: additionalDays,
      relativeLabel: relativeFromAdditionalDays(additionalDays),
    });
  }

  if (options?.customSchedule?.enabled) {
    const customEst = calculateCustomScheduleFinish(watchableMinutes, startDate, options.customSchedule);
    if (customEst.activeMinutesPerWeek > 0) {
      const avgMinutesPerDay = Math.round(customEst.activeMinutesPerWeek / 7);
      const additionalDays = additionalCalendarDays(watchableMinutes, avgMinutesPerDay);
      const { full, short } = formatDurationForType(watchableMinutes, contentType, watchableEpisodes);
      
      paces.unshift({
        label: "Custom",
        minutesPerDay: avgMinutesPerDay,
        duration: full,
        durationShort: short,
        finishDate: customEst.finishDate,
        daysCeil: additionalDays,
        relativeLabel: customEst.relativeLabel,
      });
    }
  }

  const typeBreakdown = contentType === "mixed_franchise" 
    ? calculateTypeBreakdown(entries) 
    : undefined;

  return {
    franchise,
    contentType,
    totalEpisodes,
    totalMinutes,
    skippedEpisodes,
    skippedMinutes,
    watchableMinutes,
    watchableEpisodes,
    avgMinutesPerEp: avg,
    paces,
    mathNote: `Total ${formatHM(totalMinutes)} = ${totalEpisodes} eps × ${avg.toFixed(1)}m avg`,
    typeBreakdown,
    canFinishToday: watchableMinutes <= 120,
  };
}

export function formatMinutesExact(minutes: number): string {
  return formatHM(minutes);
}
