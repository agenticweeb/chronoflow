/**
 * ChronoFlow Intelligent Type System V2
 * Step 1 of rebuild - Nested, hallucination-proof architecture
 * 
 * This file is additive. It does NOT modify src/types/index.ts yet.
 * After validation, we will migrate the app to use these types.
 */

// ── Classification - The 5 Shapes Anime Actually Comes In ────
export type AnimeShape =
  | "mega_franchise"        // Fate, Monogatari, Gundam, JoJo - 20+ entries, multiple timelines
  | "long_runner"           // One Piece, Naruto, Bleach - 200+ eps, heavy filler
  | "canon_movie_sandwich"  // Demon Slayer, Jujutsu Kaisen - movies are canon arcs
  | "route_branching"       // Fate/stay night, Clannad, Steins;Gate - same start, different routes
  | "remake_divergence"     // FMA vs FMAB, HxH 1999 vs 2011, Evangelion TV vs Rebuilds
  | "single_core";          // 12-26 ep standalone, simple linear order

export interface ShapeDetectionResult {
  shape: AnimeShape;
  confidence: number; // 0-100
  reasoning: string;
  signals: {
    totalNodes: number;
    episodeCount: number;
    fillerRatio?: number;
    relationTypes: string[]; // prequel, sequel, alternative, spinOff etc
    hasMoviesAsCanon: boolean;
    hasMultipleRoutes: boolean;
    hasRemakes: boolean;
  };
}

// ── Core Enums (Improved) ────────────────────────────────────
export type EntryFormat = "TV" | "MOVIE" | "OVA" | "ONA" | "SPECIAL" | "MUSIC";
export type EntryTier = "essential" | "recommended" | "optional" | "skip";
export type TimelineType = "main_timeline" | "alternate_timeline" | "spin_off" | "prequel" | "sequel" | "side_story" | "movie_collection" | "season_block";

export type FillerType =
  | "none"
  | "canon"
  | "mixed_canon_filler"
  | "pure_filler"
  | "recap"
  | "side_story"
  | "character_intro"
  | "world_building"
  | "fanservice"
  | "transition";

export type ContentTag =
  | "Action" | "Adventure" | "Comedy" | "Drama" | "Fantasy" | "Horror"
  | "Mystery" | "Psychological" | "Romance" | "Sci-Fi" | "Slice of Life"
  | "Sports" | "Supernatural" | "Thriller" | "Mecha" | "Isekai"
  | "Shounen" | "Seinen" | "Shoujo" | "Josei";

// ── Inner Order - For Long Runners Like Naruto / One Piece ──
/**
 * For long runners, a single TV entry is NOT one item.
 * It contains an inner episode map.
 * Example: Naruto Shippuden entry with innerOrder showing which eps to watch/skip
 */
export interface InnerEpisodeRange {
  start: number;
  end: number;
  type: FillerType;
  title?: string; // e.g. "Sasuke Retrieval Arc"
  reason?: string;
}

export interface InnerOrder {
  totalEpisodes: number;
  canonEpisodes: number;
  fillerEpisodes: number;
  ranges: InnerEpisodeRange[];
  skipEpisodes: number[]; // explicit list for quick lookup
  watchEpisodes: number[]; // explicit list
  fillerGuideUrl?: string;
}

// ── Entry V2 - The Atomic Unit ───────────────────────────────
export interface WatchOrderEntryV2 {
  // Identity - grounded in real DB
  id: string; 
  malId?: number;
  anilistId?: number;
  title: string; 
  titleJapanese?: string;
  titleEnglish?: string;
  titleRomaji?: string;

  // Classification
  format: EntryFormat;
  type: EntryFormat; 
  tier: EntryTier;
  tierReason: string; 

  // Timing
  episodeCount?: number;
  releasedEpisodeCount?: number; // ADDED: Currently aired/released episodes count
  durationMinutes?: number; 
  timeEstimate: string; 
  year?: number;
  aired?: string;

  // Position in franchise
  position: number; // global position
  groupPosition: number; // position inside its group
  prerequisites: string[]; // ids of entries that must be watched first
  unlocks: string[]; // ids this entry unlocks
  watchAfter?: string; // for canon movies: "Watch after Episode 32"

  // Content analysis
  contentTags: ContentTag[];
  arcName?: string; // for long runners: "Soul Society Arc (Eps 21-42)"
  episodeRange?: string; // "21-63" for Type B arc guide
  isFiller: boolean;
  fillerType?: FillerType;
  fillerReason?: string;

  // User guidance
  whyWatch: string; // rich 1-3 sentences, not generic
  skipWarning?: string; // what you miss if skipped
  watchIf: string[]; // ["You like dark tone", "You care about Sakura"]

  // Live enrichment - always from Jikan/AniList, never AI
  imageUrl?: string;
  bannerUrl?: string;
  coverImage?: { large: string; medium: string; color?: string };
  malScore?: number;
  anilistScore?: number;
  popularity?: number;
  memberCount?: number;
  synopsis?: string;
  genres?: string[];
  studios?: string[];
  status?: string;
  trailerUrl?: string | null;

  // Progress (client side)
  watched?: boolean;
  progress?: number; // 0-100
  userRating?: number;
  notes?: string;

  // Nested inner order for long runners
  innerOrder?: InnerOrder;

  // Relation metadata from graph
  relationType?: string; // prequel, sequel, alternative, sideStory etc
  relationFrom?: number; // which node this relation came from
}

// ── Group - The Key to "Inside Each A Way To Watch" ─────────
export interface WatchOrderGroup {
  id: string; // e.g. "group_main_timeline"
  name: string; // e.g. "Main Timeline - Holy Grail War"
  description: string; // what this group covers
  timelineType: TimelineType;
  orderNote?: string; // e.g. "Watch in this order for chronological story"

  // Entries in this group, already ordered
  entries: WatchOrderEntryV2[];

  // Aggregates
  totalEntries: number;
  totalEpisodes: number;
  totalTime: string; // "12h 30m"

  // For UI
  isCollapsedByDefault?: boolean;
  isSpoiler?: boolean;
  bestFor?: string[];
}

// ── Path - Complete Way To Watch ─────────────────────────────
export interface WatchOrderPathV2 {
  id: string; // "path_main_story", "path_chronological", "path_release"
  name: string;
  description: string; // 1-2 sentences
  longDescription?: string;

  // The actual nested structure
  groups: WatchOrderGroup[];

  // Aggregates
  totalEntries: number;
  totalEpisodes: number;
  totalTime: string;
  totalTimeMinutes: number;

  // Metadata
  bestFor: string[]; // ["First time viewers", "Lore focused"]
  difficulty: "beginner" | "intermediate" | "expert";
  isSpoilerFree: boolean;
  isRecommended: boolean; // which path we highlight

  // For sharing
  warnings?: string[];
}

// ── Result V2 - Top Level ────────────────────────────────────
export interface WatchOrderResultV2 {
  // Franchise identity
  franchise: string;
  franchiseId: string;
  franchiseImage?: string;
  classification: AnimeShape;
  classificationReason: string;

  // Explanations
  summary: string; // 2-3 sentences overview
  whyConfusing: string; // why people struggle with this franchise
  recommendedPathId: string;

  // Nested structure - THE NEW WAY
  paths: WatchOrderPathV2[];

  // Aggregates across all paths
  totalGroups: number;
  totalEntries: number;
  totalEpisodes: number;
  totalDuration: string;
  totalDurationMinutes: number;

  // Backward compat flat list for old UI if needed
  allEntriesFlat: WatchOrderEntryV2[];

  // Graph stats for debugging
  graphStats: {
    totalNodesDiscovered: number;
    totalNodesUsed: number;
    sources: ("jikan" | "anilist")[];
    maxDepthTraversed: number;
  };

  // Generation metadata
  generatedAt: string;
  aiProvider: string;
  confidence: number; // 0-100
  warnings?: string[];
  debug?: {
    classification: ShapeDetectionResult;
    allowedTitlesCount: number;
    validationAttempts: number;
  };
}

// ── Knowledge Engine Types - Grounding Layer ─────────────────
export interface RawRelationNode {
  malId?: number;
  anilistId: number;
  title: string;
  titleEnglish?: string;
  titleRomaji?: string;
  titleNative?: string;
  format?: string;
  type?: string;
  episodes?: number;
  duration?: number;
  status?: string;
  averageScore?: number;
  popularity?: number;
  coverImage?: { large: string; medium: string; color?: string };
  genres?: string[];
  description?: string;
  trailer?: { id: string; site: string } | null;
  relationType?: string;
  sourceId?: number; // which node this was discovered from
  depth: number; // 0 = root, 1 = direct relation, 2 = relation of relation
  nextAiringEpisode?: { episode: number } | null; // DECLARED: For progress grounding
}

export interface RelationGraph {
  root: RawRelationNode;
  nodes: Map<number, RawRelationNode>; // anilistId -> node
  edges: Array<{ from: number; to: number; type: string }>;
  totalDiscovered: number;
  maxDepth: number;
}

export interface AllowedTitle {
  id: string; // "ani_12345" or "mal_123"
  anilistId: number;
  malId?: number;
  title: string;
  normalizedTitle: string; // lowercased for matching
  aliases: string[]; // english, romaji, native, synonyms
  format: EntryFormat;
  episodes?: number;
  duration?: number;
  year?: number;
  popularity: number;
  relationType?: string;
  isMainEntry: boolean;
  status?: string; // DECLARED: For airing coherence
  nextAiringEpisode?: { episode: number } | null; // DECLARED: For progress grounding
}

// ── AI Generation Types - Strict Schema ──────────────────────
export interface AIGroupInstruction {
  groupId: string;
  groupName: string;
  timelineType: TimelineType;
  allowedEntryIds: string[]; // AI can ONLY pick from these
  instruction: string; // what this group should contain
}

export interface AIGenerationPayloadV2 {
  franchiseName: string;
  classification: AnimeShape;
  whyConfusing: string;
  allowedTitles: AllowedTitle[];
  groupsTemplate: AIGroupInstruction[];
  userPreferences: {
    skipPreference: string;
    includeMovies: boolean;
    includeOVAs: boolean;
    includeSpecials: boolean;
    mood?: string[];
  };
  verifiedGraphStats: {
    totalNodes: number;
    sources: string[];
  };
}

export interface AIGeneratedEntryV2 {
  id: string; // MUST match allowedTitles id
  tier: EntryTier;
  tierReason: string;
  position: number;
  groupPosition: number;
  whyWatch: string;
  skipWarning?: string;
  watchIf: string[];
  contentTags: ContentTag[];
  isFiller: boolean;
  fillerType?: FillerType;
  fillerReason?: string;
  arcName?: string;
  episodeRange?: string;
  watchAfter?: string;
  prerequisites?: string[];
  innerOrder?: {
    ranges: Array<{ start: number; end: number; type: string; title?: string }>;
    skipEpisodes?: number[];
  };
}

export interface AIGeneratedGroupV2 {
  id: string;
  name: string;
  description: string;
  timelineType: TimelineType;
  orderNote?: string;
  entries: AIGeneratedEntryV2[];
}

export interface AIGeneratedPathV2 {
  id: string;
  name: string;
  description: string;
  bestFor: string[];
  difficulty: "beginner" | "intermediate" | "expert";
  isSpoilerFree: boolean;
  isRecommended: boolean;
  groups: AIGeneratedGroupV2[];
  warnings?: string[];
}

export interface AIGeneratedOrderV2 {
  franchise: string;
  classification: AnimeShape;
  classificationReason: string;
  summary: string;
  whyConfusing: string;
  recommendedPathId: string;
  confidence: number;
  paths: AIGeneratedPathV2[];
  warnings?: string[];
}

// ── Validation Types ─────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixedEntries: number;
  droppedEntries: string[]; // ids of hallucinated entries that were dropped
}

export interface EnrichedEntryV2 extends WatchOrderEntryV2 {
  _validation: {
    matched: boolean;
    matchType: "exact_id" | "alias" | "fuzzy";
    originalAiTitle?: string;
  };
}

// ── Custom Schedule Types ────────────────────────────────────
export interface DailySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface CustomSchedule {
  enabled: boolean;
  monday: DailySchedule;
  tuesday: DailySchedule;
  wednesday: DailySchedule;
  thursday: DailySchedule;
  friday: DailySchedule;
  saturday: DailySchedule;
  sunday: DailySchedule;
}

// ── API Types V2 ─────────────────────────────────────────────
export interface GenerateRequestV2 {
  animeName: string;
  malId?: number;
  anilistId?: number;
  preferences: {
    timeBudget: string;
    mood: string[];
    skipPreference: "smart-skip" | "watch-everything" | "canon-only" | "skip-all-filler";
    includeMovies: boolean;
    includeOVAs: boolean;
    includeSpecials: boolean;
    includeRecaps: boolean;
    preferredPath: "release" | "chronological" | "optimal" | "manga";
    language: "english" | "japanese" | "both";
    customSchedule?: CustomSchedule;
    // NEW COHERENCE FIELDS:
    paceType?: "duration" | "episodes";
    episodesPerDay?: number;
  };
  scope?: "season" | "franchise";
  id?: number;
}

export interface GenerateResponseV2 {
  success: boolean;
  data?: WatchOrderResultV2;
  error?: string;
  provider?: string;
  cached?: boolean;
  latency?: number;
  debug?: {
    graphSize: number;
    classification: AnimeShape;
    validation: ValidationResult;
  };
}

// ── Legacy Compat - Keep old types working during migration ──
export type { WatchOrderEntry, WatchOrderResult, WatchPath, UserPreferences } from "./index";
