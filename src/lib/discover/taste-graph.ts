/**
 * CLIENT-SAFE localStorage utility for tracking user taste signals.
 * No accounts needed — this is the anonymous personalization layer.
 */

export interface GeneratedFranchise {
  anilistId: number;
  title: string;
  genres: string[];
  generatedAt: number;
}

const STORAGE_KEY = "myaniwatchorder-generated-history";

export function recordGeneration(franchise: GeneratedFranchise) {
  if (typeof window === "undefined") return;
  try {
    const history = getGenerationHistory();
    // Remove duplicates, prepend new, keep last 5
    const filtered = history.filter(f => f.anilistId !== franchise.anilistId);
    filtered.unshift(franchise);
    const trimmed = filtered.slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* localStorage might be full or disabled */
  }
}

export function getGenerationHistory(): GeneratedFranchise[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getLastGenerated(): GeneratedFranchise | null {
  const history = getGenerationHistory();
  return history.length > 0 ? history[0] : null;
}
/**
 * Build a taste vector (genre -> weight) from generation history.
 * More recent generations have higher weight (recency decay).
 */
export function buildTasteVector(): Record<string, number> {
  const history = getGenerationHistory();
  const vector: Record<string, number> = {};

  for (const entry of history) {
    // Weight decreases with age: most recent = 1.0, oldest = 0.5
    const ageMs = Date.now() - entry.generatedAt;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const recencyWeight = Math.max(0.3, 1 - ageDays * 0.1);

    for (const genre of entry.genres) {
      vector[genre] = (vector[genre] ?? 0) + recencyWeight;
    }
  }

  return vector;
}

/**
 * Score a shelf against a taste vector using tag overlap.
 * Higher score = more relevant to the user's taste.
 */
export function scoreShelf(
  userVector: Record<string, number>,
  centroidTags: string[]
): number {
  return centroidTags.reduce((sum, tag) => sum + (userVector[tag] ?? 0), 0);
}
const ALL_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life",
  "Sports", "Supernatural", "Thriller", "Mecha"
];

/**
 * Find genres the user has NEVER explored (weight = 0 in taste vector).
 * Returns up to 3 genres for the "Off Your Usual Path" shelf.
 */
export function getUnexploredGenres(): string[] {
  const vector = buildTasteVector();
  const explored = new Set(Object.keys(vector).filter(k => vector[k] > 0));
  const unexplored = ALL_GENRES.filter(g => !explored.has(g));
  
  // Return top 3 unexplored genres
  return unexplored.slice(0, 3);
}

/**
 * Get the user's top explored genres (for display context).
 */
export function getExploredGenres(): string[] {
  const vector = buildTasteVector();
  return Object.entries(vector)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre);
}
