/**
 * DISCOVERY SHELF SERVICE (server-only)
 *
 * Fetches one page of a shelf: Redis cache check → AniList (via the
 * hardened queryAniList client with 429 backoff) → map → cache set.
 *
 * Pagination contract: nextPage is derived ONLY from pageInfo.hasNextPage
 * (AniList's total/lastPage are unreliable by design).
 */

import { queryAniList } from "@/lib/anilist-client";
import { redis } from "@/lib/redis";
import {
  SHELVES,
  getCurrentSeason,
  type DiscoverCardData,
  type ShelfPageData,
  type ShelfRecipe,
} from "./shelf-recipes";

// ── GraphQL ──────────────────────────────────────────────────
// One browse query, many variable bags. Every shelf (and every future
// engine) is a different set of variables against this same query.
const SHELF_CARD_FIELDS = `
  id
  idMal
  title { english romaji native }
  format
  episodes
  status
  averageScore
  popularity
  genres
  season
  seasonYear
  startDate { year }
  coverImage { large color }
  nextAiringEpisode { airingAt episode }
  relations { edges { relationType } }
`;

const BROWSE_QUERY = `
  query Browse(
    $page: Int,
    $perPage: Int,
    $season: MediaSeason,
    $seasonYear: Int,
    $format: [MediaFormat],
    $status: MediaStatus,
    $scoreGreater: Int,
    $popularityGreater: Int,
    $popularityLesser: Int,
    $yearGreater: FuzzyDateInt,
    $yearLesser: FuzzyDateInt,
    $episodesLesser: Int,
    $sort: [MediaSort],
    $excludeIds: [Int],
    $ids: [Int]
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { currentPage hasNextPage }
      media(
        type: ANIME
        isAdult: false
        season: $season
        seasonYear: $seasonYear
        format_in: $format
        status: $status
        averageScore_greater: $scoreGreater
        popularity_greater: $popularityGreater
        popularity_lesser: $popularityLesser
        startDate_greater: $yearGreater
        startDate_lesser: $yearLesser
        episodes_lesser: $episodesLesser
        sort: $sort
        id_not_in: $excludeIds
        id_in: $ids
      ) {
        ${SHELF_CARD_FIELDS}
      }
    }
  }
`;

// Used for editorial overrides (Gateway shelf), independent of pagination.
const MEDIA_BY_IDS_QUERY = `
  query MediaByIds($ids: [Int], $perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(id_in: $ids, type: ANIME) {
        ${SHELF_CARD_FIELDS}
      }
    }
  }
`;

// ── Mapping ──────────────────────────────────────────────────
// Mirrors the existing AnimeSearchResult mapper in actions.ts,
// extended with shelf extras. IDs are AniList-grounded — never invented.
function mapToCard(item: any, isEditorsPick = false): DiscoverCardData {
  const relationCount = item.relations?.edges?.length || 0;
  return {
    malId: item.idMal || item.id,
    anilistId: item.id,
    title:
      item.title?.english || item.title?.romaji || item.title?.native || "Untitled",
    titleJapanese: item.title?.native ?? undefined,
    imageUrl: item.coverImage?.large || "",
    type: item.format ?? undefined,
    episodes: item.episodes ?? null,
    score: item.averageScore ? item.averageScore / 10 : 0,
    genres: item.genres || [],
    aired: item.startDate?.year ? `${item.startDate.year}` : "",
    status: item.status ?? undefined,
    isFranchise: relationCount > 0,
    franchiseEntries: relationCount,
    popularity: item.popularity || 0,
    coverColor: item.coverImage?.color ?? undefined,
    seasonYear: item.seasonYear ?? null,
    nextAiringEpisode: item.nextAiringEpisode
      ? {
          airingAt: item.nextAiringEpisode.airingAt,
          episode: item.nextAiringEpisode.episode,
        }
      : null,
    isEditorsPick,
  };
}

// ── Fetch ────────────────────────────────────────────────────
export async function fetchShelfPage(
  shelfId: string,
  page: number
): Promise<ShelfPageData> {
  const recipe: ShelfRecipe | undefined = SHELVES.find((s) => s.id === shelfId);
  if (!recipe) throw new Error(`Unknown shelf id: ${shelfId}`);

  const cacheKey = `shelf_v1:${shelfId}:${page}`;

  // 1. Redis first — one cached copy serves unlimited users.
  try {
    const cached = await redis.get<ShelfPageData>(cacheKey);
    if (cached) {
      console.log(`✅ Cache HIT for shelf: ${shelfId} page ${page}`);
      return cached;
    }
  } catch {
    /* cache read failure is non-fatal — fall through to AniList */
  }

  // SINGLE-FLIGHT LOCK: prevent stampede on cache miss.
  // Only ONE request fetches from AniList; concurrent requests wait
  // and read the cached result when it's ready.
  const lockKey = `lock:${cacheKey}`;
  let gotLock = false;
  try {
    gotLock = (await redis.set(lockKey, "1", { nx: true, px: 10000 })) !== null;
  } catch {
    /* Redis failure — proceed without lock */
  }

  if (!gotLock) {
    // Another request is already fetching — wait and retry cache
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 300));
      try {
        const retryCached = await redis.get<ShelfPageData>(cacheKey);
        if (retryCached) {
          console.log(`✅ Cache HIT (after single-flight wait): ${shelfId} page ${page}`);
          return retryCached;
        }
      } catch {
        /* ignore */
      }
    }
    // Still no cache after 1.5s — fall through and fetch anyway
    console.log(`⚠️ Single-flight lock expired, fetching anyway: ${shelfId} page ${page}`);
  }

  // 2. Assemble variables (house style: strip undefined before sending).
  const overrideIds = recipe.overrideIds ?? [];
  const vars: Record<string, unknown> = {
    ...recipe.variables,
    page,
    perPage: recipe.perPage,
  };
  if (recipe.useCurrentSeason) {
    const { season, seasonYear } = getCurrentSeason();
    vars.season = season;
    vars.seasonYear = seasonYear;
  }
  // Keep editorial picks out of the algorithmic result set so
  // page 2+ never repeats a pinned card.
  // FIX: overrideIds became {id, name} objects in the Phase-0 pass — sending
  // them raw failed GraphQL coercion on $excludeIds: [Int], killing the
  // Gateway shelf on every cache miss (the only shelf with overrides).
  if (overrideIds.length > 0) vars.excludeIds = overrideIds.map((o) => o.id);

  const cleanVars = Object.fromEntries(
    Object.entries(vars).filter(([, v]) => v !== undefined)
  );

  // 3. Fetch heuristic page + (page 1 only) editorial overrides in parallel.
  const overrideIdNums = overrideIds.map((o) => o.id);
  const overridesPromise =
    overrideIdNums.length > 0 && page === 1
      ? queryAniList(MEDIA_BY_IDS_QUERY, {
          ids: overrideIdNums,
          perPage: overrideIdNums.length,
        })
      : null;

  let browseData: any;
  let overridesData: any;
  try {
    const [b, o] = await Promise.all([
      queryAniList(BROWSE_QUERY, cleanVars),
      overridesPromise,
    ]);
    browseData = b;
    overridesData = o;
  } catch (fetchError) {
    // A failed fetch must release the single-flight lock IMMEDIATELY —
    // previously the release at the bottom was skipped on throw, holding
    // the lock for its full 10s TTL and pushing every concurrent waiter
    // through the 1.5s poll loop into a stampede fetch.
    if (gotLock) {
      try { await redis.del(lockKey); } catch { /* ignore */ }
    }
    throw fetchError;
  }

  const rawPageInfo = browseData?.Page?.pageInfo ?? {};
  const heuristicCards: DiscoverCardData[] = (browseData?.Page?.media || []).map(
    (m: any) => mapToCard(m)
  );

  // 4. Merge: editorial picks pinned first (in editor order), deduped.
  let cards = heuristicCards;
  if (overridesData) {
    const byId = new Map<number, any>();
    for (const m of overridesData?.Page?.media || []) byId.set(m.id, m);
    
    const editorCards = overrideIds
      .map((pick) => {
        const m = byId.get(pick.id);
        if (!m) return null;
        
        // RUNTIME TITLE-MATCH ASSERTION
        const fetchedTitle = m.title?.english || m.title?.romaji || "";
        if (!fetchedTitle.toLowerCase().includes(pick.name.toLowerCase())) {
          console.warn(
            `[SHELF VERIFICATION FAILED] AniList ID ${pick.id} returned "${fetchedTitle}" but expected "${pick.name}". ` +
            `This ID may have been renumbered or merged by AniList.`
          );
        }
        
        return mapToCard(m, true);
      })
      .filter((c): c is DiscoverCardData => c !== null);
      
    const pinnedIds = new Set(editorCards.map((c) => c.anilistId));
    cards = [
      ...editorCards,
      ...heuristicCards.filter((c) => !pinnedIds.has(c.anilistId)),
    ];
  }

  const result: ShelfPageData = {
    cards,
    pageInfo: {
      currentPage: rawPageInfo.currentPage ?? page,
      hasNextPage: Boolean(rawPageInfo.hasNextPage),
    },
  };

  // 5. Cache (house rule: never cache empty arrays — they'd poison the
  //    shelf for a full TTL).
  try {
    if (result.cards.length > 0) {
      await redis.set(cacheKey, result, { ex: recipe.cacheTtlSeconds });
      console.log(
        `📦 Cache SET for shelf: ${shelfId} page ${page} (${result.cards.length} cards, TTL ${recipe.cacheTtlSeconds}s)`
      );
    } else {
      await redis.del(cacheKey);
    }
  } catch {
    /* cache write failure is non-fatal */
  }

  // Release single-flight lock so the next cold miss can acquire it
  if (gotLock) {
    try {
      await redis.del(lockKey);
    } catch {
      /* ignore */
    }
  }

  return result;
}
