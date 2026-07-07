/**
 * Jikan API Client (MyAnimeList Unofficial API)
 * Free, no API key, ~25M requests/week limit
 * Docs: https://docs.api.jikan.moe/
 */

import { AnimeSearchResult, EnrichmentData, Relation } from "@/types";

const BASE_URL = "https://api.jikan.moe/v4";

// Rate limit: 3 requests/second. Queue requests.
let lastRequestTime = 0;
const MIN_INTERVAL = 350; // ms between requests

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const wait = Math.max(0, MIN_INTERVAL - (now - lastRequestTime));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestTime = Date.now();
  return fetch(url);
}

// ── Search Anime ───────────────────────────────────────────
export async function searchAnime(
  query: string,
  limit: number = 10
): Promise<AnimeSearchResult[]> {
  const url = `${BASE_URL}/anime?q=${encodeURIComponent(
    query
  )}&limit=${limit}&order_by=popularity&sort=asc`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) throw new Error(`Jikan search failed: ${res.status}`);

  const data = await res.json();
  return data.data.map((item: any) => ({
    malId: item.mal_id,
    title: item.title,
    titleJapanese: item.title_japanese,
    imageUrl:
      item.images?.jpg?.image_url ||
      item.images?.webp?.image_url ||
      "",
    type: item.type,
    episodes: item.episodes,
    score: item.score || 0,
    synopsis: item.synopsis || "",
    genres: item.genres?.map((g: any) => g.name) || [],
    aired: item.aired?.string,
    status: item.status,
    isFranchise: false,
  }));
}

// ── Get Anime Details ──────────────────────────────────────
export async function getAnimeDetails(
  malId: number
): Promise<EnrichmentData> {
  const [animeRes, relationsRes] = await Promise.all([
    rateLimitedFetch(`${BASE_URL}/anime/${malId}/full`),
    rateLimitedFetch(`${BASE_URL}/anime/${malId}/relations`),
  ]);

  if (!animeRes.ok)
    throw new Error(`Jikan details failed: ${animeRes.status}`);

  const anime = (await animeRes.json()).data;
  const relations = relationsRes.ok
    ? (await relationsRes.json()).data
    : [];

  return {
    malId: anime.mal_id,
    score: anime.score || 0,
    popularity: anime.popularity || 0,
    members: anime.members || 0,
    synopsis: anime.synopsis || "",
    genres: anime.genres?.map((g: any) => g.name) || [],
    studios: anime.studios?.map((s: any) => s.name) || [],
    aired: anime.aired?.string || "",
    duration: anime.duration || "",
    rating: anime.rating || "",
    imageUrl:
      anime.images?.jpg?.large_image_url ||
      anime.images?.jpg?.image_url ||
      "",
    trailerUrl:
      anime.trailer?.url || anime.trailer?.embed_url,
    relations: relations.map((r: any) => ({
      relation: r.relation,
      entry: {
        malId: r.entry?.[0]?.mal_id,
        type: r.entry?.[0]?.type,
        title: r.entry?.[0]?.name,
      },
    })),
  };
}

// ── Get Franchise Entries ──────────────────────────────────
export async function getFranchiseEntries(
  malId: number
): Promise<EnrichmentData[]> {
  const details = await getAnimeDetails(malId);
  const franchiseIds = new Set<number>();

  details.relations.forEach((r: Relation) => {
    if (r.entry?.malId) franchiseIds.add(r.entry.malId);
  });

  const entries: EnrichmentData[] = [];
  for (const id of Array.from(franchiseIds)) {
    try {
      const entry = await getAnimeDetails(id);
      entries.push(entry);
    } catch (e) {
      console.warn(`Failed to fetch franchise entry ${id}:`, e);
    }
  }

  return entries;
}
