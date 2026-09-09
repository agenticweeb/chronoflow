import type { FranchiseArcMap } from "@/types/arc-map";

export const onePieceArcMap: FranchiseArcMap = {
  rootAnilistId: 21, // AniList Media ID for One Piece
  franchiseName: "One Piece",
  primaryMediaIds: [21], 
  version: 2,
  // ... (keep the rest of the arcs exactly as you verified them)
  updatedAt: "2026-09-09",
  arcs: [
    {
      id: "east-blue",
      name: "East Blue Saga",
      shortName: "East Blue",
      order: 1,
      importance: "core",
      ranges: [{ mediaId: 21, startEpisode: 1, endEpisode: 61 }],
    },
    {
      id: "alabasta",
      name: "Alabasta Saga",
      shortName: "Alabasta",
      order: 2,
      importance: "core",
      ranges: [{ mediaId: 21, startEpisode: 62, endEpisode: 135 }],
    },
    {
      id: "skypiea",
      name: "Sky Island Saga",
      shortName: "Skypiea",
      order: 3,
      importance: "core",
      ranges: [{ mediaId: 21, startEpisode: 136, endEpisode: 206 }],
    },
    {
      id: "water-seven",
      name: "Water Seven Saga",
      shortName: "Water Seven",
      order: 4,
      importance: "core",
      ranges: [{ mediaId: 21, startEpisode: 207, endEpisode: 325 }],
    },
    {
      id: "thriller-bark",
      name: "Thriller Bark Saga",
      shortName: "Thriller Bark",
      order: 5,
      importance: "core",
      ranges: [{ mediaId: 21, startEpisode: 326, endEpisode: 384 }],
    },
    {
      id: "summit-war",
      name: "Summit War Saga",
      shortName: "Summit War",
      order: 6,
      importance: "core",
      ranges: [{ mediaId: 21, startEpisode: 385, endEpisode: 516 }],
    },
    {
      id: "fishman-island",
      name: "Fishman Island Saga",
      shortName: "Fishman Island",
      order: 7,
      importance: "core",
      ranges: [{ mediaId: 21, startEpisode: 517, endEpisode: 574 }],
    },
    {
      id: "punk-hazard",
      name: "Punk Hazard Saga",
      shortName: "Punk Hazard",
      order: 8,
      importance: "core",
      ranges: [{ mediaId: 21, startEpisode: 575, endEpisode: 628 }], // fixed: was 629
    },
    {
      id: "dressrosa",
      name: "Dressrosa Saga",
      shortName: "Dressrosa",
      order: 9,
      importance: "core",
      ranges: [{ mediaId: 21, startEpisode: 629, endEpisode: 746 }], // fixed: was 630
    },
    {
      id: "whole-cake-island",
      name: "Whole Cake Island Saga",
      shortName: "Whole Cake Island",
      order: 10,
      importance: "core",
      ranges: [{ mediaId: 21, startEpisode: 747, endEpisode: 889 }], // fixed: was 882
    },
    {
      id: "wano",
      name: "Wano Country Saga",
      shortName: "Wano",
      order: 11,
      importance: "core",
      ranges: [{ mediaId: 21, startEpisode: 890, endEpisode: 1085 }], // fixed: was 883
    },
    {
      id: "egghead",
      name: "Egghead Saga",
      shortName: "Egghead",
      order: 12,
      importance: "core",
      ranges: [{ mediaId: 21, startEpisode: 1086, endEpisode: 1155 }], // fixed: was Infinity
    },
    {
      id: "elbaph",
      name: "Elbaph Saga",
      shortName: "Elbaph",
      order: 13,
      importance: "core",
      ranges: [{ mediaId: 21, startEpisode: 1156, endEpisode: Infinity }], // new: currently airing
    },
  ],
};
