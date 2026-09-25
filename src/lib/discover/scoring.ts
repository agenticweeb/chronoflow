// The single source of truth for "Underrated Gem" score calculation.
export function computeGemScore(item: { score: number; popularity: number }): number {
  const popularityPenalty = (item.popularity || 0) / 15000;
  return item.score - popularityPenalty;
}
