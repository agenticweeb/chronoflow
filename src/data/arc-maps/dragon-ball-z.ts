import type { FranchiseArcMap } from "@/types/arc-map";

export const dragonBallZArcMap: FranchiseArcMap = {
  rootAnilistId: 813, // VERIFIED via curl (direct + search match)
  franchiseName: "Dragon Ball Z",
  primaryMediaIds: [813],
  version: 1,
  updatedAt: "2026-09-10",
  arcs: [
    // Tiling check: 35+72+10+77+5+88+4 = 291 ✓
    {
      id: "saiyan-saga",
      name: "Saiyan Saga",
      shortName: "Saiyan",
      order: 1,
      importance: "core",
      ranges: [{ mediaId: 813, startEpisode: 1, endEpisode: 35 }],
    },
    {
      id: "frieza-saga",
      name: "Frieza Saga (Namek & Ginyu)",
      shortName: "Frieza",
      order: 2,
      importance: "core",
      ranges: [{ mediaId: 813, startEpisode: 36, endEpisode: 107 }], // VERIFY: some guides split Namek/Ginyu at 67/68
    },
    {
      id: "garlic-jr-filler",
      name: "Garlic Jr. Saga (Filler)",
      shortName: "Garlic Jr.",
      order: 3,
      importance: "skippable",
      ranges: [{ mediaId: 813, startEpisode: 108, endEpisode: 117 }],
    },
    {
      id: "androids-cell-saga",
      name: "Androids & Cell Saga",
      shortName: "Androids/Cell",
      order: 4,
      importance: "core",
      // Saga-level block: Trunks' arrival through the Cell Games.
      // Internal sub-splits (Androids ~118–139, Imperfect/Perfect Cell ~140–165,
      // Cell Games ~166–194) can be refined later without changing tiling.
      ranges: [{ mediaId: 813, startEpisode: 118, endEpisode: 194 }], // VERIFY: Trunks arrival boundary 118 vs 119
    },
    {
      id: "other-world-filler",
      name: "Other World Tournament (Filler)",
      shortName: "Other World",
      order: 5,
      importance: "skippable",
      ranges: [{ mediaId: 813, startEpisode: 195, endEpisode: 199 }],
    },
    {
      id: "majin-buu-saga",
      name: "Majin Buu Saga (Great Saiyaman → Kid Buu)",
      shortName: "Buu",
      order: 6,
      importance: "core",
      ranges: [{ mediaId: 813, startEpisode: 200, endEpisode: 287 }], // includes Saiyaman, 25th Tournament, Babidi, fusion
    },
    {
      id: "peaceful-world-finale",
      name: "Peaceful World Finale (Uub)",
      shortName: "Finale",
      order: 7,
      importance: "core",
      // The 10-year timeskip and Goku leaving with Uub — the saga's ending.
      // Canon finale; must NEVER be marked filler.
      ranges: [{ mediaId: 813, startEpisode: 288, endEpisode: 291 }],
    },
  ],
};
