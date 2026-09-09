import { AnimeSearchResult } from "@/types";
const ENDPOINT = "https://graphql.anilist.co";

async function sleep(ms:number){ return new Promise(r=>setTimeout(r,ms)); }

export async function queryAniList(query: string, variables: Record<string, any> = {}, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://anilist.co/"
        },
        body: JSON.stringify({ query, variables }),
      });
      if (res.ok) {
        const json = await res.json();
        // Outage guard: HTTP 200 + errors + no data must throw truthfully —
        // returning null here crashes callers reading .Page off null.
        if (json?.errors?.length && !json?.data) {
          throw new Error(`AniList is unavailable: ${json.errors[0]?.message || "GraphQL error"}`);
        }
        return json.data;
      }
      if (res.status === 429) {
        const wait = Math.min(1000 * Math.pow(2, attempt) + Math.random()*500, 8000);
        console.warn(`AniList 429, retry ${attempt+1}/${retries} after ${Math.round(wait)}ms`);
        await sleep(wait);
        continue;
      }
      if (res.status >= 500 && attempt < retries) {
        await sleep(500 * (attempt+1));
        continue;
      }
      let detail = `HTTP ${res.status}`;
      try {
        const errBody = await res.json();
        const msg = errBody?.errors?.[0]?.message;
        if (msg) detail = msg;
      } catch { /* non-JSON body */ }
      throw new Error(`AniList is unavailable: ${detail}`);
    } catch (e:any) {
      if (attempt === retries) throw e;
      if (e?.name === 'AbortError') throw e;
      // Hard API failures (outage) skip retry cycles — fail fast, truthfully
      if (typeof e?.message === 'string' && e.message.startsWith('AniList is unavailable')) throw e;
      await sleep(400 * (attempt+1));
    }
  }
  throw new Error("AniList query failed after retries");
}

export async function searchAniList(query: string, limit: number = 10): Promise<AnimeSearchResult[]> {
  const q = `
    query($search: String, $perPage: Int) {
      Page(perPage: $perPage) {
        media(search: $search, type: ANIME, sort: [SEARCH_MATCH, POPULARITY_DESC]) {
          id idMal title { english romaji native } coverImage { large medium } format episodes averageScore description genres startDate { year } status
          relations { edges { relationType node { id idMal title { english romaji } format } } }
        }
      }
    }`;
  const data = await queryAniList(q, { search: query, perPage: limit });
  return data.Page.media.map((item: any) => ({
    malId: item.idMal, anilistId: item.id,
    title: item.title.english || item.title.romaji || item.title.native,
    titleJapanese: item.title.native, imageUrl: item.coverImage?.large || item.coverImage?.medium || "",
    type: item.format, episodes: item.episodes, score: (item.averageScore || 0) / 10,
    synopsis: item.description?.replace(/<[^>]*>/g, "") || "", genres: item.genres || [],
    aired: item.startDate?.year ? `${item.startDate.year}` : "", status: item.status,
    isFranchise: item.relations?.edges?.length > 0, franchiseEntries: item.relations?.edges?.length || 0,
  }));
}

export async function getMediaDetails(anilistId: number) {
  const q = `
    query($id: Int) {
      Media(id: $id, type: ANIME) {
        id idMal title { english romaji native } coverImage { large } bannerImage format episodes duration averageScore popularity description genres tags { name rank } startDate { year month day } endDate { year month day } status season seasonYear studios { nodes { name } } trailer { id site }
        relations { edges { relationType node { id idMal title { english romaji native } format episodes duration averageScore description genres coverImage { large } startDate { year month day } status trailer { id site } } } }
        recommendations { nodes { mediaRecommendation { id idMal title { english romaji } coverImage { large } } } }
      }
    }`;
  return queryAniList(q, { id: anilistId });
}
import { redis } from "@/lib/redis";

export async function getBatchMediaImages(ids: number[]): Promise<Record<number, string>> {
  if (!ids || ids.length === 0) return {};
  
  const cacheKey = `batch_images:${ids.sort().join(',')}`;
  
  // 1. Check Redis first
  try {
    const cached = await redis.get<Record<number, string>>(cacheKey);
    if (cached) {
      console.log("✅ Cache HIT for batch images");
      return cached;
    }
  } catch (e) { /* Ignore redis errors */ }

  const q = `
    query($ids: [Int]) {
      Page(page: 1, perPage: 50) {
        media(id_in: $ids, type: ANIME) {
          id
          coverImage { large }
        }
      }
    }`;
    
  try {
    const data = await queryAniList(q, { ids });
    const map: Record<number, string> = {};
    for (const item of data.Page.media) {
      map[item.id] = item.coverImage?.large || "";
    }
    
    // 2. Save to Redis for 24 hours so we never have to fetch this again
    if (Object.keys(map).length > 0) {
      try {
        await redis.set(cacheKey, map, { ex: 86400 });
      } catch (e) { /* Ignore redis errors */ }
    }
    
    return map;
  } catch (e) {
    console.error("Failed to batch fetch images:", e);
    return {};
  }
}
