/**
 * AniList GraphQL Client
 * Free, no API key for read operations
 * 90 requests/minute limit
 * Docs: https://docs.anilist.co/
 */

import { AnimeSearchResult } from "@/types";

const ENDPOINT = "https://graphql.anilist.co";

async function queryAniList(
  query: string,
  variables: Record<string, any> = {}
) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`AniList query failed: ${res.status}`);
  return (await res.json()).data;
}

// ── Search ─────────────────────────────────────────────────
export async function searchAniList(
  query: string,
  limit: number = 10
): Promise<AnimeSearchResult[]> {
  const q = `
    query($search: String, $perPage: Int) {
      Page(perPage: $perPage) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          idMal
          title { english romaji native }
          coverImage { large medium }
          format
          episodes
          averageScore
          description
          genres
          startDate { year month day }
          status
          relations {
            edges {
              relationType
              node { id idMal title { english romaji } format }
            }
          }
        }
      }
    }
  `;

  const data = await queryAniList(q, { search: query, perPage: limit });

  return data.Page.media.map((item: any) => ({
    malId: item.idMal,
    anilistId: item.id,
    title:
      item.title.english ||
      item.title.romaji ||
      item.title.native,
    titleJapanese: item.title.native,
    imageUrl: item.coverImage?.large || item.coverImage?.medium || "",
    type: item.format,
    episodes: item.episodes,
    score: (item.averageScore || 0) / 10,
    synopsis: item.description?.replace(/<[^>]*>/g, "") || "",
    genres: item.genres || [],
    aired: item.startDate?.year ? `${item.startDate.year}` : "",
    status: item.status,
    isFranchise: item.relations?.edges?.length > 0,
    franchiseEntries: item.relations?.edges?.length || 0,
  }));
}

// ── Get Media Details ──────────────────────────────────────
export async function getMediaDetails(anilistId: number) {
  const q = `
    query($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        title { english romaji native }
        coverImage { large }
        bannerImage
        format
        episodes
        duration
        averageScore
        popularity
        description
        genres
        tags { name rank }
        startDate { year month day }
        endDate { year month day }
        status
        season
        seasonYear
        studios { nodes { name } }
        trailer { id site }
        relations {
          edges {
            relationType
            node { id idMal title { english romaji } format episodes }
          }
        }
        recommendations {
          nodes {
            mediaRecommendation { id idMal title { english romaji } coverImage { large } }
          }
        }
      }
    }
  `;
  return queryAniList(q, { id: anilistId });
}
