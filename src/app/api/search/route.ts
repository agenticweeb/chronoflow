/**
 * Search: Jikan + AniList, stable IDs, franchise hubs only for mega names.
 * Every result is a real anime with cover, year, type, episodes.
 * Downstream uses anilistId/malId — not free text.
 */

import { NextRequest, NextResponse } from "next/server";
import { searchAnime } from "@/lib/jikan-client";
import { searchAniList } from "@/lib/anilist-client";

export const dynamic = "force-dynamic";

interface Hub {
  keywords: string[];
  title: string;
  anilistId: number;
  malId: number;
  imageUrl: string;
  synopsis: string;
  genres: string[];
}

/** Explicit franchise hubs — only injected when query clearly matches */
const HUBS: Hub[] = [
  {
    keywords: ["fate"],
    title: "Fate Series (Complete Franchise)",
    anilistId: 10087,
    malId: 10087,
    imageUrl: "/suggestions/fate.jpg",
    synopsis:
      "Full Fate universe — Stay Night routes, Zero, Grand Order, and alternates.",
    genres: ["Action", "Fantasy"],
  },
  {
    keywords: ["monogatari", "bakemonogatari"],
    title: "Monogatari Series (Complete Franchise)",
    anilistId: 5081,
    malId: 5081,
    imageUrl: "/suggestions/monogatari.jpeg",
    synopsis: "Complete Monogatari release-order watch guide.",
    genres: ["Mystery", "Supernatural"],
  },
  {
    keywords: ["gundam", "mobile suit gundam"],
    title: "Gundam (Universal Century Franchise)",
    anilistId: 80,
    malId: 80,
    imageUrl: "/suggestions/Gundam (Universal Century).jpeg",
    synopsis: "UC timeline navigation across decades of series and OVAs.",
    genres: ["Mecha", "Sci-Fi"],
  },
  {
    keywords: ["toaru", "railgun", "index", "accelerator"],
    title: "Toaru Series (Complete Franchise)",
    anilistId: 4654,
    malId: 4654,
    imageUrl: "/suggestions/Toaru Series.jpeg",
    synopsis: "Index, Railgun, Accelerator — overlapping Academy City timeline.",
    genres: ["Sci-Fi", "Action"],
  },
];

function normalizeResult(item: any, scope: "franchise" | "season" | "movie") {
  const anilistId = item.anilistId ?? undefined;
  const malId = item.malId ?? undefined;
  // Stable identity for client → generate
  const id = anilistId || malId || 0;
  return {
    id,
    malId: malId || 0,
    anilistId,
    title: item.title,
    titleJapanese: item.titleJapanese,
    imageUrl: item.imageUrl || "",
    type: item.type || "TV",
    episodes: item.episodes ?? null,
    score: item.score || 0,
    synopsis: item.synopsis || "",
    genres: item.genres || [],
    aired: item.aired || "",
    status: item.status || "",
    isFranchise: !!item.isFranchise || scope === "franchise",
    franchiseEntries: item.franchiseEntries,
    scope,
    // Context season the user actually clicked
    selectedTitle: item.title,
  };
}

export async function GET(req: NextRequest) {
  const t0 = Date.now();
  try {
    const q = new URL(req.url).searchParams.get("q")?.trim();
    if (!q) {
      return NextResponse.json(
        { success: false, error: "Query 'q' required" },
        { status: 400 }
      );
    }

    const [jikanRes, anilistRes] = await Promise.allSettled([
      searchAnime(q, 10),
      searchAniList(q, 10),
    ]);

    const jikan = jikanRes.status === "fulfilled" ? jikanRes.value : [];
    const anilist = anilistRes.status === "fulfilled" ? anilistRes.value : [];

    // Merge by malId; prefer AniList cover + anilistId
    const merged: any[] = [...jikan];
    for (const a of anilist) {
      const ex = merged.find(
        (j) => j.malId && a.malId && j.malId === a.malId
      );
      if (ex) {
        if (a.anilistId) ex.anilistId = a.anilistId;
        if (a.imageUrl) ex.imageUrl = a.imageUrl;
        if (a.score && !ex.score) ex.score = a.score;
        if (a.episodes && !ex.episodes) ex.episodes = a.episodes;
        if (a.isFranchise) ex.isFranchise = true;
      } else {
        merged.push(a);
      }
    }

    if (merged.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        latency: Date.now() - t0,
      });
    }

    const low = q.toLowerCase();
    const words = low.split(/\s+/).filter((w) => w.length >= 2);

    // Soft relevance: keep real titles; don't drop if user typed exact-ish
    const filtered = merged.filter((c) => {
      const title = (c.title || "").toLowerCase();
      if (words.length === 0) return true;
      const hits = words.filter((w) => title.includes(w)).length;
      return hits / words.length >= 0.25 || c.score >= 7 || c.isFranchise;
    });

    const list = (filtered.length > 0 ? filtered : merged).slice(0, 12);

    // Franchise hubs only when query matches keywords (top of list)
    const matchedHubs = HUBS.filter((h) =>
      h.keywords.some((k) => low.includes(k) || k.includes(low))
    );

    const injected = matchedHubs.map((h) =>
      normalizeResult(
        {
          malId: h.malId,
          anilistId: h.anilistId,
          title: h.title,
          titleJapanese: h.title,
          imageUrl: h.imageUrl,
          type: "Franchise",
          episodes: null,
          score: 8.8,
          synopsis: h.synopsis,
          genres: h.genres,
          aired: "Multiple",
          status: "FINISHED",
          isFranchise: true,
          franchiseEntries: 12,
        },
        "franchise"
      )
    );

    const out = [
      ...injected,
      ...list.map((i: any) => {
        const type = (i.type || "").toUpperCase();
        const scope =
          type === "MOVIE" || type === "Movie"
            ? ("movie" as const)
            : i.isFranchise && (i.franchiseEntries || 0) > 3
              ? ("franchise" as const)
              : ("season" as const);
        // Generate always franchise by default unless user focuses season later
        // Search dropdown: season context is the clicked title; generate uses franchise
        return normalizeResult(i, scope === "movie" ? "movie" : "season");
      }),
    ];

    // Dedupe by anilistId or malId after hub inject
    const seen = new Set<string>();
    const deduped = out.filter((item) => {
      const key = item.anilistId
        ? `a${item.anilistId}`
        : item.malId
          ? `m${item.malId}`
          : item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({
      success: true,
      data: deduped,
      latency: Date.now() - t0,
    });
  } catch (e) {
    console.error("Search failed", e);
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Search failed",
      },
      { status: 500 }
    );
  }
}
