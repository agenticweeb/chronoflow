import type { FranchiseArcMap } from "@/types/arc-map";

export const dragonBallArcMap: FranchiseArcMap = {
  rootAnilistId: 223, // VERIFIED via curl (AniList Media 223, idMal 223)
  franchiseName: "Dragon Ball",
  primaryMediaIds: [223],
  version: 1,
  updatedAt: "2026-09-10",
  arcs: [
    // Tiling check: 13+15+40+15+18+31+21 = 153 ✓
    {
      id: "emperor-pilaf",
      name: "Emperor Pilaf Saga",
      shortName: "Pilaf",
      order: 1,
      importance: "core",
      ranges: [{ mediaId: 223, startEpisode: 1, endEpisode: 13 }], // VERIFY: some guides end at 12
    },
    {
      id: "twenty-first-tournament",
      name: "21st World Tournament Saga",
      shortName: "21st Tournament",
      order: 2,
      importance: "core",
      ranges: [{ mediaId: 223, startEpisode: 14, endEpisode: 28 }],
    },
    {
      id: "red-ribbon-army",
      name: "Red Ribbon Army Saga",
      shortName: "Red Ribbon",
      order: 3,
      importance: "core",
      ranges: [{ mediaId: 223, startEpisode: 29, endEpisode: 68 }], // VERIFY: includes Muscle Tower → General Blue
    },
    {
      id: "fortuneteller-baba",
      name: "Fortuneteller Baba Saga",
      shortName: "Baba",
      order: 4,
      importance: "core",
      ranges: [{ mediaId: 223, startEpisode: 69, endEpisode: 83 }],
    },
    {
      id: "tien-shinhan",
      name: "Tien Shinhan Saga (22nd Tournament)",
      shortName: "Tien",
      order: 5,
      importance: "core",
      ranges: [{ mediaId: 223, startEpisode: 84, endEpisode: 101 }], // VERIFY: boundary into King Piccolo
    },
    {
      id: "king-piccolo",
      name: "King Piccolo Saga",
      shortName: "King Piccolo",
      order: 6,
      importance: "core",
      ranges: [{ mediaId: 223, startEpisode: 102, endEpisode: 132 }],
    },
    {
      id: "piccolo-junior",
      name: "Piccolo Jr. Saga (23rd Tournament)",
      shortName: "Piccolo Jr.",
      order: 7,
      importance: "core",
      ranges: [{ mediaId: 223, startEpisode: 133, endEpisode: 153 }],
    },
  ],
};
