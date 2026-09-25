/**
 * DISCOVERY SHELF RECIPES (Phase 0 — Discovery Tab Overhaul)
 *
 * Pure data + pure functions. CLIENT-SAFE: this file must NEVER import
 * server-only modules (redis, anilist fetchers) — it is imported by both
 * the server service (shelf-service.ts) and the client UI (Phase 1).
 *
 * Adding a future shelf = adding one entry to SHELVES. Every deferred
 * engine (Off Your Usual Path, Community Bridges, Wildcard) will return
 * shelf-shaped data and ride this exact system.
 */

// ── Card Type ────────────────────────────────────────────────
// Structurally mirrors the AnimeSearchResult mapper output in
// actions.ts (discoverAnimeAction), plus shelf-specific extras.
export interface DiscoverCardData {
  // Identity — grounded in real AniList IDs (never AI-generated)
  malId?: number; // AniList's idMal can be absent
  anilistId: number; // AniList Media.id is always present; the mapper always sets it
  title: string;
  titleJapanese?: string;
  imageUrl: string;
  type?: string; // AniList format: TV, MOVIE, ONA, OVA...
  episodes?: number | null;
  score?: number; // 0–10 scale (AniList averageScore / 10)
  genres: string[];
  aired?: string; // start year
  status?: string;
  isFranchise?: boolean;
  franchiseEntries?: number;
  popularity?: number;

  // Shelf-specific extras (optional — legacy handlers ignore them)
  coverColor?: string; // AniList dominant-color hex — instant card paint
  seasonYear?: number | null;
  nextAiringEpisode?: { airingAt: number; episode: number } | null;
  isEditorsPick?: boolean;
}

export interface ShelfPageData {
  cards: DiscoverCardData[];
  pageInfo: {
    currentPage: number;
    hasNextPage: boolean; // the ONLY trusted pagination signal (AniList's total/lastPage are unreliable)
  };
}

// ── Recipe System ────────────────────────────────────────────
export type ShelfId =
  | "trending"
  | "airing-now"
  | "underrated-gems"
  | "gateway"
  | "movie-night"
  | "hidden-classics";

export interface ShelfRecipe {
  id: ShelfId;
  title: string;
  subtitle: string;
  /** Tailwind gradient stops for the shelf header accent (literals here are scanner-visible). */
  accent: string;
  perPage: number;
  /** Redis TTL (seconds) — how fresh this shelf must stay. */
  cacheTtlSeconds: number;
  /** Inject the current AniList season + seasonYear into query variables. */
  useCurrentSeason?: boolean;
  /** Raw AniList filter variables (undefined values are stripped before sending). */
  variables: Record<string, unknown>;
  /** Editorial picks, fetched by id and pinned to the front (page 1 only, deduped from heuristic via id_not_in). */
  overrideIds?: { id: number; name: string }[];
  /** Tags that define this shelf's content DNA — used for personalization scoring */
  centroidTags: string[];
}

// ── Season Helper ────────────────────────────────────────────
// AniList convention: WINTER = Dec–Feb, and December releases belong
// to WINTER of the FOLLOWING year.
export function getCurrentSeason(): {
  season: "WINTER" | "SPRING" | "SUMMER" | "FALL";
  seasonYear: number;
} {
  const now = new Date();
  const month = now.getMonth(); // 0–11
  const seasons = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;
  const season = seasons[Math.floor(((month + 1) % 12) / 3)];
  return {
    season,
    seasonYear: month === 11 ? now.getFullYear() + 1 : now.getFullYear(),
  };
}

// ── The Shelves ──────────────────────────────────────────────
export const SHELVES: ShelfRecipe[] = [
  {
    id: "trending",
    title: "Trending This Season",
    subtitle: "What everyone is watching right now",
    accent: "from-fuchsia-500 to-violet-600",
    perPage: 15,
    cacheTtlSeconds: 900, // 15 min — time-sensitive
    useCurrentSeason: true,
    variables: {
      format: ["TV", "ONA"],
      sort: ["TRENDING_DESC"],
    },
    centroidTags: [], // Universal — no specific taste match
  },
  {
    id: "airing-now",
    title: "Airing Now",
    subtitle: "New episodes this week — with countdowns",
    accent: "from-sky-400 to-cyan-600",
    perPage: 15,
    cacheTtlSeconds: 600, // 10 min — countdown freshness
    variables: {
      status: "RELEASING",
      format: ["TV"],
      sort: ["POPULARITY_DESC"],
    },
    centroidTags: [], // Universal — no specific taste match
  },
  {
    id: "underrated-gems",
    title: "Underrated Gems",
    subtitle: "Critically adored, criminally unwatched",
    accent: "from-amber-400 to-orange-600",
    perPage: 15,
    cacheTtlSeconds: 86400, // 24 h — barely time-sensitive
    variables: {
      status: "FINISHED",
      scoreGreater: 78,
      popularityGreater: 3000,
      popularityLesser: 40000,
      format: ["TV", "MOVIE"],
      sort: ["SCORE_DESC"],
    },
    centroidTags: ["Slice of Life", "Psychological", "Mystery", "Seinen"],
  },
  {
    id: "gateway",
    title: "Gateway Anime",
    subtitle: "Perfect first watches — short, iconic, addictive",
    accent: "from-emerald-400 to-teal-600",
    perPage: 12, // heuristic only; ~6 editorial picks get prepended
    cacheTtlSeconds: 604800, // 7 days — evergreen
    variables: {
      popularityGreater: 150000,
      scoreGreater: 75,
      yearGreater: 20000101, // FuzzyDateInt — avoid dated production
      episodesLesser: 30, // no 100-episode commitments in the heuristic
      format: ["TV"],
      sort: ["POPULARITY_DESC"],
    },
    overrideIds: [
      { id: 1, name: "Cowboy Bebop" },
      { id: 1535, name: "Death Note" },
      { id: 5114, name: "Fullmetal Alchemist: Brotherhood" },
      { id: 9253, name: "Steins;Gate" },
      { id: 16498, name: "Attack on Titan" },
      { id: 21459, name: "My Hero Academia" },
    ],
    centroidTags: ["Action", "Adventure", "Shounen", "Fantasy"],
  },
  {
    id: "movie-night",
    title: "One-Sitting Masterpieces",
    subtitle: "A complete story tonight — no homework required",
    accent: "from-rose-500 to-red-700",
    perPage: 15,
    cacheTtlSeconds: 604800, // 7 days
    variables: {
      format: ["MOVIE"],
      scoreGreater: 80,
      sort: ["SCORE_DESC"],
    },
    centroidTags: ["Drama", "Romance", "Psychological"],
  },
  {
    id: "hidden-classics",
    title: "Hidden Classics",
    subtitle: "Pre-2010 essentials most new fans miss",
    accent: "from-indigo-400 to-blue-600",
    perPage: 15,
    cacheTtlSeconds: 604800, // 7 days
    variables: {
      yearLesser: 20100101, // FuzzyDateInt — started before 2010
      scoreGreater: 78,
      status: "FINISHED",
      format: ["TV", "MOVIE"],
      sort: ["POPULARITY_DESC"],
    },
    centroidTags: ["Sci-Fi", "Mecha", "Psychological", "Drama"],
  },
];
