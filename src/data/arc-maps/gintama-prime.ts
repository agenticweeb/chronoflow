import type { FranchiseArcMap } from "@/types/arc-map";

export const gintamaPrimeArcMap: FranchiseArcMap = {
  rootAnilistId: 9969, // VERIFIED via curl (Gintama', 51 eps)
  franchiseName: "Gintama'",
  primaryMediaIds: [9969],
  version: 1,
  updatedAt: "2026-09-17",
  arcs: [
    // Continuous numbering 202-252. Enchousen (253-265) is a separate entry, left native.
    // Tiling check: 8+5+31+4+3 = 51 ✓
    {
      id: "everyday-prime-open",
      name: "Everyday Cases (Eps 202-209)",
      shortName: "Comedy",
      order: 1,
      importance: "core",
      ranges: [{ mediaId: 9969, startEpisode: 1, endEpisode: 8 }], // 202-209 continuous
    },
    {
      id: "four-devas",
      name: "Four Devas Arc (Kabukicho Gang War)",
      shortName: "Four Devas",
      order: 2,
      importance: "core",
      ranges: [{ mediaId: 9969, startEpisode: 9, endEpisode: 13 }], // continuous 210-214 — VERIFY
    },
    {
      id: "everyday-prime-mid",
      name: "Everyday Cases (Eps 215-245)",
      shortName: "Comedy",
      order: 3,
      importance: "core",
      ranges: [{ mediaId: 9969, startEpisode: 14, endEpisode: 44 }], // continuous 215-245
    },
    {
      id: "baragaki",
      name: "Baragaki Arc (Mimawarigumi)",
      shortName: "Baragaki",
      order: 4,
      importance: "core",
      ranges: [{ mediaId: 9969, startEpisode: 45, endEpisode: 48 }], // continuous 246-249 — VERIFY
    },
    {
      id: "everyday-prime-close",
      name: "Everyday Cases (Eps 250-252)",
      shortName: "Comedy",
      order: 5,
      importance: "core",
      ranges: [{ mediaId: 9969, startEpisode: 49, endEpisode: 51 }], // continuous 250-252
    },
  ],
};
