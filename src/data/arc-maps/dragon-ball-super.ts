import type { FranchiseArcMap } from "@/types/arc-map";

export const dragonBallSuperArcMap: FranchiseArcMap = {
  rootAnilistId: 21175, // VERIFIED via curl (direct + search match)
  franchiseName: "Dragon Ball Super",
  primaryMediaIds: [21175],
  version: 1,
  updatedAt: "2026-09-10",
  arcs: [
    // Tiling check: 14+13+14+5+30+55 = 131 ✓
    {
      id: "battle-of-gods",
      name: "Battle of Gods Arc",
      shortName: "BoG",
      order: 1,
      importance: "core",
      ranges: [{ mediaId: 21175, startEpisode: 1, endEpisode: 14 }], // VERIFY: some guides end at 12
    },
    {
      id: "resurrection-f",
      name: "Resurrection 'F' Arc",
      shortName: "Resurrection F",
      order: 2,
      importance: "core",
      ranges: [{ mediaId: 21175, startEpisode: 15, endEpisode: 27 }],
    },
    {
      id: "universe-6",
      name: "Universe 6 Arc (Champa Tournament)",
      shortName: "Universe 6",
      order: 3,
      importance: "core",
      ranges: [{ mediaId: 21175, startEpisode: 28, endEpisode: 41 }],
    },
    {
      id: "copy-vegeta-filler",
      name: "Copy Vegeta Arc (Filler)",
      shortName: "Copy Vegeta",
      order: 4,
      importance: "skippable",
      ranges: [{ mediaId: 21175, startEpisode: 42, endEpisode: 46 }],
    },
    {
      id: "future-trunks",
      name: "Future Trunks Arc (Goku Black)",
      shortName: "Future Trunks",
      order: 5,
      importance: "core",
      ranges: [{ mediaId: 21175, startEpisode: 47, endEpisode: 76 }],
    },
    {
      id: "universe-survival",
      name: "Universe Survival Arc (Tournament of Power)",
      shortName: "Tournament of Power",
      order: 6,
      importance: "core",
      ranges: [{ mediaId: 21175, startEpisode: 77, endEpisode: 131 }],
    },
  ],
};
