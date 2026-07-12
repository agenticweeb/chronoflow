/**
 * Time-Budget Calculator
 * Order never changes here — only finish dates from daily pace.
 * Finish dates use local noon + ceil(days) to avoid off-by-one.
 */

export type SkipTier = "essential" | "recommended" | "optional" | "skip";

export interface FranchiseEntry {
  title: string;
  episodes: number;
  durationMin: number;
  tier: SkipTier;
  isFiller?: boolean;
}

export interface PaceEstimate {
  label: string;
  minutesPerDay: number;
  duration: string;
  durationShort: string;
  finishDate: string; // YYYY-MM-DD local
  daysCeil: number;
  relativeLabel: string; // "in 1w 2d"
}

export interface TimeBudgetResult {
  franchise: string;
  totalEpisodes: number;
  totalMinutes: number;
  skippedEpisodes: number;
  skippedMinutes: number;
  watchableMinutes: number;
  watchableEpisodes: number;
  avgMinutesPerEp: number;
  paces: PaceEstimate[];
  mathNote: string;
}

export const PACES = [
  { label: "Casual", minutesPerDay: 30 },
  { label: "Regular", minutesPerDay: 60 },
  { label: "Dedicated", minutesPerDay: 120 },
  { label: "Binge", minutesPerDay: 240 },
] as const;

export type PaceLabel = (typeof PACES)[number]["label"];

/** Map UserPreferences.timeBudget → pace label */
export function paceFromTimeBudget(
  budget?: string | null
): PaceLabel {
  const map: Record<string, PaceLabel> = {
    casual: "Casual",
    regular: "Regular",
    dedicated: "Dedicated",
    binge: "Binge",
    // legacy
    "1hour": "Casual",
    "3hours": "Regular",
    "1day": "Dedicated",
    "1week": "Dedicated",
  };
  return map[budget || "regular"] || "Regular";
}

function formatHM(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
}

function formatDurationFromDays(fractionalDays: number): { full: string; short: string } {
  if (!Number.isFinite(fractionalDays) || fractionalDays < 0) {
    return { full: "—", short: "—" };
  }
  if (fractionalDays === 0) {
    return { full: "0 minutes", short: "0m" };
  }
  // Under 1 day → show hours
  if (fractionalDays < 1) {
    const hours = Math.max(1, Math.ceil(fractionalDays * 24));
    return {
      full: `${hours} hour${hours === 1 ? "" : "s"}`,
      short: `${hours}h`,
    };
  }
  const d = Math.ceil(fractionalDays);
  if (d < 7) {
    return { full: `${d} day${d === 1 ? "" : "s"}`, short: `${d}d` };
  }
  if (d < 30) {
    const weeks = Math.floor(d / 7);
    const remaining = d % 7;
    if (remaining === 0) {
      return {
        full: `${weeks} week${weeks === 1 ? "" : "s"}`,
        short: `${weeks}w`,
      };
    }
    return {
      full: `${weeks} week${weeks === 1 ? "" : "s"} ${remaining} day${remaining === 1 ? "" : "s"}`,
      short: `${weeks}w ${remaining}d`,
    };
  }
  if (d < 365) {
    const months = Math.floor(d / 30);
    const remaining = d % 30;
    const weeks = Math.floor(remaining / 7);
    if (weeks === 0) {
      return {
        full: `${months} month${months === 1 ? "" : "s"}`,
        short: `${months}mo`,
      };
    }
    return {
      full: `${months} month${months === 1 ? "" : "s"} ${weeks} week${weeks === 1 ? "" : "s"}`,
      short: `${months}mo ${weeks}w`,
    };
  }
  const years = Math.floor(d / 365);
  const remaining = d % 365;
  const months = Math.floor(remaining / 30);
  if (months === 0) {
    return {
      full: `${years} year${years === 1 ? "" : "s"}`,
      short: `${years}y`,
    };
  }
  return {
    full: `${years} year${years === 1 ? "" : "s"} ${months} month${months === 1 ? "" : "s"}`,
    short: `${years}y ${months}mo`,
  };
}

function localNoon(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}

function formatLocalYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function relativeFromCeilDays(ceilDays: number): string {
  if (ceilDays <= 0) return "today";
  if (ceilDays === 1) return "in 1 day";
  if (ceilDays < 7) return `in ${ceilDays} days`;
  const w = Math.floor(ceilDays / 7);
  const r = ceilDays % 7;
  if (r === 0) return `in ${w}w`;
  return `in ${w}w ${r}d`;
}

/**
 * Count an entry as "skipped savings" only when it's pure skip/filler,
 * not recommended/essential. Optional counts as savings only when strategy
 * treats optional as non-watchable (canon-only already filtered them out).
 */
function isSavingsTier(tier: SkipTier): boolean {
  return tier === "skip";
}

export function calculateTimeBudget(
  franchise: string,
  entries: FranchiseEntry[],
  startDate: Date = new Date(),
  options?: {
    /** Extra minutes/episodes already filtered out by skip strategy */
    preSkippedMinutes?: number;
    preSkippedEpisodes?: number;
  }
): TimeBudgetResult {
  let totalMinutes = 0;
  let totalEpisodes = 0;
  let skippedMinutes = options?.preSkippedMinutes || 0;
  let skippedEpisodes = options?.preSkippedEpisodes || 0;

  for (const e of entries) {
    if (!Number.isFinite(e.episodes) || e.episodes <= 0) continue;
    if (!Number.isFinite(e.durationMin) || e.durationMin <= 0) continue;
    const m = e.episodes * e.durationMin;
    totalMinutes += m;
    totalEpisodes += e.episodes;
    if (isSavingsTier(e.tier) || e.isFiller) {
      skippedMinutes += m;
      skippedEpisodes += e.episodes;
    }
  }

  const watchableMinutes = Math.max(0, totalMinutes - skippedMinutes);
  const watchableEpisodes = Math.max(0, totalEpisodes - skippedEpisodes);
    const avg =
      totalEpisodes > 0
        ? Math.round((totalMinutes / totalEpisodes) * 10) / 10
        : 24;

  const noonStart = localNoon(startDate);

  const paces: PaceEstimate[] = PACES.map((p) => {
    const fractional = watchableMinutes / p.minutesPerDay;
    const daysCeil =
      watchableMinutes <= 0 ? 0 : Math.max(1, Math.ceil(fractional));
    const finish = new Date(noonStart);
    finish.setDate(finish.getDate() + daysCeil);
    const { full, short } = formatDurationFromDays(fractional);
    return {
      label: p.label,
      minutesPerDay: p.minutesPerDay,
      duration: full,
      durationShort: short,
      finishDate: formatLocalYMD(finish),
      daysCeil,
      relativeLabel: relativeFromCeilDays(daysCeil),
    };
  });

  const totalHM = formatHM(totalMinutes);
    const mathNote = `Total ${totalHM} = ${totalEpisodes} eps × ${avg.toFixed(1)}m avg`;

  return {
    franchise,
    totalEpisodes,
    totalMinutes,
    skippedEpisodes,
    skippedMinutes,
    watchableMinutes,
    watchableEpisodes,
    avgMinutesPerEp: avg,
    paces,
    mathNote,
  };
}

export function formatMinutesExact(minutes: number): string {
  return formatHM(minutes);
}
