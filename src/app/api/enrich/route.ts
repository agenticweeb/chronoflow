/**
 * API Route: Enrich Watch Order with Live Data
 * Fetches real-time scores, images, metadata from Jikan + AniList
 */

import { NextRequest, NextResponse } from "next/server";
import { getAnimeDetails } from "@/lib/jikan-client";
import { getMediaDetails } from "@/lib/anilist-client";


export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { malId, anilistId } = body;

    if (!malId && !anilistId) {
      return NextResponse.json(
        { success: false, error: "malId or anilistId required" },
        { status: 400 }
      );
    }

    const [jikanData, anilistData] = await Promise.allSettled([
      malId ? getAnimeDetails(malId) : Promise.resolve(null),
      anilistId ? getMediaDetails(anilistId) : Promise.resolve(null),
    ]);

    const jikan = jikanData.status === "fulfilled" ? jikanData.value : null;
    const anilist = anilistData.status === "fulfilled" ? anilistData.value : null;

    const enriched = {
      malId: jikan?.malId || anilist?.Media?.idMal,
      anilistId: anilist?.Media?.id,
      title: jikan?.synopsis ? jikan.synopsis.split(".")[0] : anilist?.Media?.title?.english,
      imageUrl: anilist?.Media?.coverImage?.large || jikan?.imageUrl,
      bannerUrl: anilist?.Media?.bannerImage,
      score: jikan?.score || (anilist?.Media?.averageScore ? anilist.Media.averageScore / 10 : 0),
      popularity: jikan?.popularity || anilist?.Media?.popularity,
      members: jikan?.members,
      synopsis: jikan?.synopsis || anilist?.Media?.description?.replace(/<[^>]*>/g, ""),
      genres: jikan?.genres || anilist?.Media?.genres,
      studios: jikan?.studios || anilist?.Media?.studios?.nodes?.map((s: any) => s.name),
      aired: jikan?.aired || (anilist?.Media?.startDate?.year ? `${anilist.Media.startDate.year}` : ""),
      duration: jikan?.duration || `${anilist?.Media?.duration} min per ep`,
      rating: jikan?.rating,
      trailerUrl: jikan?.trailerUrl || (anilist?.Media?.trailer?.site === "youtube"
        ? `https://youtube.com/watch?v=${anilist.Media.trailer.id}`
        : undefined),
      relations: jikan?.relations || [],
      recommendations: anilist?.Media?.recommendations?.nodes?.map((r: any) => ({
        malId: r.mediaRecommendation?.idMal,
        anilistId: r.mediaRecommendation?.id,
        title: r.mediaRecommendation?.title?.english || r.mediaRecommendation?.title?.romaji,
        imageUrl: r.mediaRecommendation?.coverImage?.large,
      })),
    };

    return NextResponse.json({
      success: true,
      data: enriched,
      sources: {
        jikan: jikan ? "success" : "failed",
        anilist: anilist ? "success" : "failed",
      },
      latency: Date.now() - startTime,
    });

  } catch (error) {
    console.error("Enrichment failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Enrichment failed",
      },
      { status: 500 }
    );
  }
}
