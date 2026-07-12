export function normalizeTitle(text: string): string {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreStringMatch(query: string, target: string): number {
  const q = normalizeTitle(query);
  const t = normalizeTitle(target);
  if (!q || !t) return 0;
  if (q === t) return 260;
  if (t === "") return 0;

  let score = 0;
  if (q.includes(t) && q.length === t.length) score += 220;
  if (t.includes(q) && q.length > 3) score += 180;
  if (q.startsWith(t) || t.startsWith(q)) score += 140;
  const qWords = q.split(" ");
  const tWords = t.split(" ");
  const common = qWords.filter((word) => tWords.includes(word)).length;
  score += common * 35;
  if (common >= Math.max(qWords.length, tWords.length) - 1) score += 70;
  if (qWords.length === tWords.length && common === qWords.length) score += 40;
  if (qWords.length === 1 && tWords.includes(qWords[0])) score += 20;
  return score;
}

export function scoreTitleMatch(query: string, candidate: { title?: string; titleRomaji?: string; titleJapanese?: string; aliases?: string[]; popularity?: number; format?: string; } ): number {
  const q = normalizeTitle(query);
  if (!q) return 0;
  let score = 0;
  score = Math.max(score, scoreStringMatch(q, candidate.title || ""));
  if (candidate.titleRomaji) score = Math.max(score, scoreStringMatch(q, candidate.titleRomaji));
  if (candidate.titleJapanese) score = Math.max(score, scoreStringMatch(q, candidate.titleJapanese));
  for (const alias of candidate.aliases || []) {
    score = Math.max(score, scoreStringMatch(q, alias));
  }
  if ((candidate.format || "").toUpperCase() === "TV" && q.split(" ").length > 1) {
    score += 10;
  }
  if (typeof candidate.popularity === "number") {
    score += Math.min(10, candidate.popularity / 2000);
  }
  return score;
}

export function selectBestAnimeMatch(query: string, candidates: Array<any>): any {
  if (!candidates || candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  let best = candidates[0];
  let bestScore = -Infinity;
  for (const candidate of candidates) {
    const score = scoreTitleMatch(query, candidate);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
}
