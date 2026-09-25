import type { FranchiseArcMap } from "@/types/arc-map";

export const dragonBallGTArcMap: FranchiseArcMap = {
  rootAnilistId: 225, // VERIFIED via curl (AniList Media 225, idMal 225)
  franchiseName: "Dragon Ball GT",
  primaryMediaIds: [225],
  version: 1,
  updatedAt: "2026-09-10",
  arcs: [
    // NOTE: GT is wholly anime-original (no Toriyama manga), so there is no
    // canon/filler taxonomy INSIDE this entry — every arc is core here.
    // Whether GT itself is franchise-essential is the pipeline's decision
    // (relation graph + tiering), never the arc map's.
    // Tiling check: 15+25+7+17 = 64 ✓
    {
      id: "black-star-dragon-balls",
      name: "Black Star Dragon Ball Saga",
      shortName: "Black Star",
      order: 1,
      importance: "core",
      ranges: [{ mediaId: 225, startEpisode: 1, endEpisode: 15 }],
    },
    {
      id: "baby",
      name: "Baby Saga",
      shortName: "Baby",
      order: 2,
      importance: "core",
      ranges: [{ mediaId: 225, startEpisode: 16, endEpisode: 40 }], // VERIFY: some guides start at 17
    },
    {
      id: "super-17",
      name: "Super 17 Saga",
      shortName: "Super 17",
      order: 3,
      importance: "core",
      ranges: [{ mediaId: 225, startEpisode: 41, endEpisode: 47 }],
    },
    {
      id: "shadow-dragons",
      name: "Shadow Dragons Saga",
      shortName: "Shadow Dragons",
      order: 4,
      importance: "core",
      ranges: [{ mediaId: 225, startEpisode: 48, endEpisode: 64 }],
    },
  ],
};
