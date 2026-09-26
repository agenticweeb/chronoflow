import { queryAniList } from "@/lib/anilist-client";
import { getCurrentSeason } from "@/lib/discover/shelf-recipes";

export interface SeasonAnime {
  anilistId: number;
  title: string;
  coverImage: string;
  bannerImage: string;
  score: number | null;
  episodes: number | null;
  format: string;
  genres: string[];
  description: string;
  status: string;
  nextAiringEpisode: { episode: number; timeUntilAiring: number } | null;
}

export function getCurrentSeasonSlug(): string {
  const { season, seasonYear } = getCurrentSeason();
  return `${season.toLowerCase()}-${seasonYear}`;
}

export function getPreviousSeasonSlug(): string {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const seasons = ["winter", "spring", "summer", "fall"] as const;
  const currentIdx = Math.floor(((month + 1) % 12) / 3);
  const prevIdx = (currentIdx - 1 + 4) % 4;
  const prevYear = currentIdx === 0 ? year - 1 : year;
  return `${seasons[prevIdx]}-${prevYear}`;
}

export function parseSeasonSlug(slug: string): { season: string; seasonYear: number } | null {
  const match = slug.match(/^(winter|spring|summer|fall)-(\d{4})$/);
  if (!match) return null;
  return { season: match[1], seasonYear: parseInt(match[2], 10) };
}

const SEASON_QUERY = `
  query SeasonAnime($season: MediaSeason, $seasonYear: Int) {
    Page(perPage: 24) {
      media(
        type: ANIME
        season: $season
        seasonYear: $seasonYear
        sort: POPULARITY_DESC
        isAdult: false
      ) {
        id
        title { english romaji }
        coverImage { large }
        bannerImage
        averageScore
        episodes
        format
        genres
        description(asHtml: false)
        status
        nextAiringEpisode { episode timeUntilAiring }
      }
    }
  }
`;

export async function getSeasonAnime(season: string, year: number): Promise<SeasonAnime[]> {
  const seasonEnum = season.toUpperCase();
  const data = await queryAniList(SEASON_QUERY, { season: seasonEnum, seasonYear: year });
  return (data?.Page?.media || []).map((m: any) => ({
    anilistId: m.id,
    title: m.title?.english || m.title?.romaji || "Unknown",
    coverImage: m.coverImage?.large || "",
    bannerImage: m.bannerImage || "",
    score: m.averageScore ?? null,
    episodes: m.episodes ?? null,
    format: m.format || "TV",
    genres: m.genres || [],
    description: (m.description || "").replace(/<[^>]*>/g, "").slice(0, 200),
    status: m.status || "",
    nextAiringEpisode: m.nextAiringEpisode
      ? { episode: m.nextAiringEpisode.episode, timeUntilAiring: m.nextAiringEpisode.timeUntilAiring }
      : null,
  }));
}
