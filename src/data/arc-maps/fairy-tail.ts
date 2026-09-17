import type { FranchiseArcMap } from "@/types/arc-map";

export const fairyTailArcMap: FranchiseArcMap = {
  rootAnilistId: 6702, // VERIFIED via curl (FAIRY TAIL, 175 eps, FINISHED)
  franchiseName: "Fairy Tail",
  primaryMediaIds: [6702],
  version: 1,
  updatedAt: "2026-09-17",
  arcs: [
    // 2014 (20626), Final Season (99749), 100 Years Quest (139095) are separate
    // entries — left native (TYBW precedent).
    // Tiling check: 2+3+5+10+9+11+11+17+7+20+27+3+50 = 175 ✓
    {
      id: "macao",
      name: "Macao Arc",
      shortName: "Macao",
      order: 1,
      importance: "core",
      ranges: [{ mediaId: 6702, startEpisode: 1, endEpisode: 2 }],
    },
    {
      id: "daybreak",
      name: "Daybreak Arc",
      shortName: "Daybreak",
      order: 2,
      importance: "core",
      ranges: [{ mediaId: 6702, startEpisode: 3, endEpisode: 5 }], // VERIFY span
    },
    {
      id: "lullaby",
      name: "Lullaby Arc",
      shortName: "Lullaby",
      order: 3,
      importance: "core",
      ranges: [{ mediaId: 6702, startEpisode: 6, endEpisode: 10 }], // VERIFY span
    },
    {
      id: "galuna",
      name: "Galuna Island Arc",
      shortName: "Galuna",
      order: 4,
      importance: "core",
      ranges: [{ mediaId: 6702, startEpisode: 11, endEpisode: 20 }], // VERIFY span
    },
    {
      id: "phantom-lord",
      name: "Phantom Lord Arc",
      shortName: "Phantom Lord",
      order: 5,
      importance: "core",
      ranges: [{ mediaId: 6702, startEpisode: 21, endEpisode: 29 }], // VERIFY span
    },
    {
      id: "tower-of-heaven",
      name: "Tower of Heaven Arc",
      shortName: "Tower of Heaven",
      order: 6,
      importance: "core",
      ranges: [{ mediaId: 6702, startEpisode: 30, endEpisode: 40 }], // VERIFY span
    },
    {
      id: "battle-of-fairy-tail",
      name: "Battle of Fairy Tail Arc (Laxus)",
      shortName: "Laxus",
      order: 7,
      importance: "core",
      ranges: [{ mediaId: 6702, startEpisode: 41, endEpisode: 51 }], // VERIFY span
    },
    {
      id: "oracion-seis",
      name: "Oración Seis Arc",
      shortName: "Oración Seis",
      order: 8,
      importance: "core",
      ranges: [{ mediaId: 6702, startEpisode: 52, endEpisode: 68 }], // VERIFY span
    },
    {
      id: "daphne-filler",
      name: "Daphne Arc (Anime Original)",
      shortName: "Daphne",
      order: 9,
      importance: "skippable",
      ranges: [{ mediaId: 6702, startEpisode: 69, endEpisode: 75 }], // anime-original filler — VERIFY span
    },
    {
      id: "edolas",
      name: "Edolas Arc",
      shortName: "Edolas",
      order: 10,
      importance: "core",
      ranges: [{ mediaId: 6702, startEpisode: 76, endEpisode: 95 }], // VERIFY span
    },
    {
      id: "tenrou-island",
      name: "Tenrou Island Arc",
      shortName: "Tenrou",
      order: 11,
      importance: "core",
      ranges: [{ mediaId: 6702, startEpisode: 96, endEpisode: 122 }], // VERIFY span
    },
    {
      id: "x791",
      name: "X791 Arc (Seven-Year Return)",
      shortName: "X791",
      order: 12,
      importance: "core",
      ranges: [{ mediaId: 6702, startEpisode: 123, endEpisode: 125 }], // VERIFY span
    },
    {
      id: "grand-magic-games",
      name: "Grand Magic Games Arc",
      shortName: "GMG",
      order: 13,
      importance: "core",
      // Covers through the original run's end at 175 (GMG climax + aftermath).
      // The anime-original Eclipse Celestial Spirits arc is in the 2014 series, not here.
      ranges: [{ mediaId: 6702, startEpisode: 126, endEpisode: 175 }], // VERIFY: GMG end vs aftermath split
    },
  ],
};
