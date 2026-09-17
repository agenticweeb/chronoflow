import type { FranchiseArcMap } from "@/types/arc-map";

export const gintamaDegreesArcMap: FranchiseArcMap = {
  rootAnilistId: 20996, // VERIFIED via curl (Gintama°, 51 eps)
  franchiseName: "Gintama°",
  primaryMediaIds: [20996],
  version: 1,
  updatedAt: "2026-09-17",
  arcs: [
    // Continuous numbering 266-316. Contains the twin peaks fans cite as the
    // series' best serious material — Shogun Assassination then Farewell Shinsengumi.
    // Tiling check: 34+8+9 = 51 ✓
    {
      id: "everyday-degrees-open",
      name: "Everyday Cases (Eps 266-299)",
      shortName: "Comedy",
      order: 1,
      importance: "core",
      ranges: [{ mediaId: 20996, startEpisode: 1, endEpisode: 34 }], // continuous 266-299
    },
    {
      id: "shogun-assassination",
      name: "Shogun Assassination Arc",
      shortName: "Shogun Assassination",
      order: 2,
      importance: "core",
      ranges: [{ mediaId: 20996, startEpisode: 35, endEpisode: 42 }], // continuous 300-307 — VERIFY both boundaries
    },
    {
      id: "farewell-shinsengumi",
      name: "Farewell Shinsengumi Arc",
      shortName: "Farewell Shinsengumi",
      order: 3,
      importance: "core",
      ranges: [{ mediaId: 20996, startEpisode: 43, endEpisode: 51 }], // continuous 308-316 — VERIFY end
    },
  ],
};
