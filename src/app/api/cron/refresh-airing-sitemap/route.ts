import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { queryAniList } from "@/lib/anilist-client";
// remove: import { getCurrentSeason } from "@/lib/discover/shelf-recipes";

export const runtime = "nodejs";

const AIRING_SITEMAP_KEY = "sitemap:airing-titles";

const AIRING_QUERY = `
  query Trending {
    airing: Page(perPage: 15) {
      media(
        type: ANIME
        status: RELEASING
        sort: POPULARITY_DESC
        isAdult: false
        format_in: [TV, TV_SHORT, ONA]
      ) {
        id
        title { english romaji }
      }
    }
    trending: Page(perPage: 15) {
      media(
        type: ANIME
        sort: TRENDING_DESC
        isAdult: false
      ) {
        id
        title { english romaji }
      }
    }
  }
`;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await queryAniList(AIRING_QUERY, {});

    // Aliased Page fields REPLACE the Page wrapper in the response:
    // the data lives at data.airing.media, NOT data.airing.Page.media
    const titles = new Set<string>();
    for (const m of data?.airing?.media || []) {
      titles.add(m.title?.english || m.title?.romaji || "");
    }
    for (const m of data?.trending?.media || []) {
      titles.add(m.title?.english || m.title?.romaji || "");
    }
    titles.delete("");

    const list = [...titles].slice(0, 60);
    await redis.set(AIRING_SITEMAP_KEY, JSON.stringify(list));

    return NextResponse.json({ success: true, count: list.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Airing sitemap refresh failed" }, { status: 500 });
  }
}
