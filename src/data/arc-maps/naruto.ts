import type { FranchiseArcMap } from "@/types/arc-map";

export const narutoArcMap: FranchiseArcMap = {
  rootAnilistId: 20, // AniList Media ID for Naruto
  franchiseName: "Naruto",
  primaryMediaIds: [20],
  version: 1,
  updatedAt: "2026-09-09",
  arcs: [
    // Tiling check: 19+48+13+20+6+29+84+1 = 220 ✓
    {
      id: "prologue-land-of-waves",
      name: "Prologue — Land of Waves Saga",
      shortName: "Land of Waves",
      order: 1,
      importance: "core",
      ranges: [{ mediaId: 20, startEpisode: 1, endEpisode: 19 }],
    },
    {
      id: "chunin-exams",
      name: "Chunin Exam Saga",
      shortName: "Chunin Exams",
      order: 2,
      importance: "core",
      ranges: [{ mediaId: 20, startEpisode: 20, endEpisode: 67 }], // absorbs recap special ep 26
    },
    {
      id: "konoha-crush",
      name: "Konoha Crush Saga",
      shortName: "Konoha Crush",
      order: 3,
      importance: "core",
      ranges: [{ mediaId: 20, startEpisode: 68, endEpisode: 80 }],
    },
    {
      id: "tsunade-search",
      name: "Search for Tsunade Saga",
      shortName: "Tsunade Search",
      order: 4,
      importance: "core",
      ranges: [{ mediaId: 20, startEpisode: 81, endEpisode: 100 }], // absorbs filler ep 97
    },
    {
      id: "tea-country-filler",
      name: "Land of Tea Race (Filler)",
      shortName: "Tea Country",
      order: 5,
      importance: "skippable",
      ranges: [{ mediaId: 20, startEpisode: 101, endEpisode: 106 }],
    },
    {
      id: "sasuke-retrieval",
      name: "Sasuke Retrieval Saga",
      shortName: "Sasuke Retrieval",
      order: 6,
      importance: "core",
      ranges: [{ mediaId: 20, startEpisode: 107, endEpisode: 135 }],
    },
    {
      id: "post-sasuke-filler",
      name: "Post-Sasuke Filler Block",
      shortName: "Filler Block",
      order: 7,
      importance: "skippable",
      ranges: [{ mediaId: 20, startEpisode: 136, endEpisode: 219 }],
    },
    {
      id: "departure-finale",
      name: "Departure — Series Finale",
      shortName: "Departure",
      order: 8,
      importance: "core",
      ranges: [{ mediaId: 20, startEpisode: 220, endEpisode: 220 }],
    },
  ],
};
