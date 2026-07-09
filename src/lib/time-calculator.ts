/**
 * Time-Budget Calculator
 * Per-entry durations; tier-aware skip math; finish-date aware.
 */

export type SkipTier = 'essential' | 'recommended' | 'optional' | 'skip'

export interface FranchiseEntry {
  title: string
  episodes: number
  durationMin: number
  tier: SkipTier
}

export interface PaceEstimate {
  label: string
  minutesPerDay: number
  duration: string
  durationShort: string
  finishDate: string
}

export interface TimeBudgetResult {
  franchise: string
  totalEpisodes: number
  totalMinutes: number
  skippedEpisodes: number
  skippedMinutes: number
  paces: PaceEstimate[]
}

export const PACES = [
  { label: 'Casual',    minutesPerDay: 30  },
  { label: 'Regular',   minutesPerDay: 60  },
  { label: 'Dedicated', minutesPerDay: 120 },
  { label: 'Binge',     minutesPerDay: 240 },
] as const

function formatDays(days: number): { full: string; short: string } {
  if (!Number.isFinite(days) || days < 0) return { full: '—', short: '—' }

  if (days < 1) {
    const h = Math.max(1, Math.round(days * 24))
    return { full: `${h} hour${h === 1 ? '' : 's'}`, short: `${h}h` }
  }

  const d = Math.ceil(days)
  if (d < 7) {
    return { full: `${d} day${d === 1 ? '' : 's'}`, short: `${d}d` }
  }

  if (d < 30) {
    const weeks = Math.floor(d / 7)
    const remaining = d % 7
    if (remaining === 0) {
      return { full: `${weeks} week${weeks === 1 ? '' : 's'}`, short: `${weeks}w` }
    }
    return {
      full: `${weeks} week${weeks === 1 ? '' : 's'} ${remaining} day${remaining === 1 ? '' : 's'}`,
      short: `${weeks}w ${remaining}d`,
    }
  }

  if (d < 365) {
    const months = Math.floor(d / 30)
    const remaining = d % 30
    const weeks = Math.floor(remaining / 7)
    if (weeks === 0) {
      return { full: `${months} month${months === 1 ? '' : 's'}`, short: `${months}mo` }
    }
    return {
      full: `${months} month${months === 1 ? '' : 's'} ${weeks} week${weeks === 1 ? '' : 's'}`,
      short: `${months}mo ${weeks}w`,
    }
  }

  const years = Math.floor(d / 365)
  const remaining = d % 365
  const months = Math.floor(remaining / 30)
  if (months === 0) {
    return { full: `${years} year${years === 1 ? '' : 's'}`, short: `${years}y` }
  }
  return {
    full: `${years} year${years === 1 ? '' : 's'} ${months} month${months === 1 ? '' : 's'}`,
    short: `${years}y ${months}mo`,
  }
}

function isSavings(tier: SkipTier): boolean {
  return tier === 'skip' || tier === 'optional'
}

export function calculateTimeBudget(
  franchise: string,
  entries: FranchiseEntry[],
  startDate: Date = new Date(),
): TimeBudgetResult {
  let totalMinutes = 0
  let totalEpisodes = 0
  let skippedMinutes = 0
  let skippedEpisodes = 0

  for (const e of entries) {
    if (!Number.isFinite(e.episodes) || e.episodes <= 0) continue
    if (!Number.isFinite(e.durationMin) || e.durationMin <= 0) continue
    const m = e.episodes * e.durationMin
    totalMinutes += m
    totalEpisodes += e.episodes
    if (isSavings(e.tier)) {
      skippedMinutes += m
      skippedEpisodes += e.episodes
    }
  }

  const watchableMinutes = Math.max(0, totalMinutes - skippedMinutes)

  const paces: PaceEstimate[] = PACES.map(p => {
    const days = watchableMinutes / p.minutesPerDay
    const finish = new Date(startDate.getTime() + days * 86_400_000)
    const { full, short } = formatDays(days)
    return {
      label: p.label,
      minutesPerDay: p.minutesPerDay,
      duration: full,
      durationShort: short,
      finishDate: finish.toISOString().slice(0, 10),
    }
  })

  return {
    franchise,
    totalEpisodes,
    totalMinutes,
    skippedEpisodes,
    skippedMinutes,
    paces,
  }
}
