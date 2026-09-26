import { queryAniList } from "@/lib/anilist-client";
import { getCurrentSeason } from "@/lib/discover/shelf-recipes";
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

// For the CURRENT season page: show what's airing NOW, regardless of AniList's
// season tag (which reflects premiere season, not current airing status)
const AIRING_NOW_QUERY = `
  query AiringNow {
    Page(perPage: 24) {
      media(
        type: ANIME
        status: RELEASING
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
  
  // Determine if this is the CURRENT season (in which case we want what's
  // RELEASING now, not what's tagged with this season — AniList's season tags
  // reflect premiere season, so currently-airing shows carry the previous
  // season's tag)
  const { season: currentSeason, seasonYear: currentYear } = getCurrentSeason();
  const isCurrentSeason = seasonEnum === currentSeason && year === currentYear;
  
  const query = isCurrentSeason ? AIRING_NOW_QUERY : SEASON_QUERY;
  const variables = isCurrentSeason ? {} : { season: seasonEnum, seasonYear: year };
  const data = await queryAniList(query, variables);
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
