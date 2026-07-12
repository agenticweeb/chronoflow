
import { AnimeSearchResult } from "@/types";
const ENDPOINT = "https://graphql.anilist.co";

async function sleep(ms:number){ return new Promise(r=>setTimeout(r,ms)); }

async function queryAniList(query: string, variables: Record<string, any> = {}, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });
      if (res.ok) return (await res.json()).data;
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
      throw new Error(`AniList query failed: ${res.status}`);
    } catch (e:any) {
      if (attempt === retries) throw e;
      if (e?.name === 'AbortError') throw e;
      await sleep(400 * (attempt+1));
    }
  }
  throw new Error("AniList query failed after retries");
}

export async function searchAniList(query: string, limit: number = 10): Promise<AnimeSearchResult[]> {
  const q = `
    query($search: String, $perPage: Int) {
      Page(perPage: $perPage) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
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
