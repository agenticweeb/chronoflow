import type { FranchiseArcMap } from "@/types/arc-map";

export const bleachArcMap: FranchiseArcMap = {
  rootAnilistId: 269, // AniList Media ID for Bleach (2004)
  franchiseName: "Bleach",
  primaryMediaIds: [269],
  version: 1,
  updatedAt: "2026-09-09",
  arcs: [
    // Tiling check: 20+43+28+76+22+15+8+17+36+51+26+24 = 366 ✓
    // TYBW (separate, smaller entry) is intentionally NOT mapped — it renders as a normal entry.
    {
      id: "agent-of-the-shinigami",
      name: "Agent of the Shinigami",
      shortName: "Agent",
      order: 1,
      importance: "core",
      ranges: [{ mediaId: 269, startEpisode: 1, endEpisode: 20 }],
    },
    {
      id: "soul-society",
      name: "Soul Society Arc",
      shortName: "Soul Society",
      order: 2,
      importance: "core",
      ranges: [{ mediaId: 269, startEpisode: 21, endEpisode: 63 }],
    },
    {
      id: "bount-filler",
      name: "Bount Arc (Filler)",
      shortName: "Bount",
      order: 3,
      importance: "skippable",
      ranges: [{ mediaId: 269, startEpisode: 64, endEpisode: 91 }],
    },
    {
      id: "arrancar",
      name: "Arrancar — Arrival & Hueco Mundo",
      shortName: "Arrancar",
      order: 4,
      importance: "core",
      // includes arrival, Hueco Mundo infiltration & battles; scattered filler
      // interludes absorbed — VERIFY against filler guide
      ranges: [{ mediaId: 269, startEpisode: 92, endEpisode: 167 }],
    },
    {
      id: "amagai-filler",
      name: "New Captain Amagai Arc (Filler)",
      shortName: "Amagai Filler",
      order: 5,
      importance: "skippable",
      ranges: [{ mediaId: 269, startEpisode: 168, endEpisode: 189 }],
    },
    {
      id: "fake-karakura-part-1",
      name: "Fake Karakura — The War Begins",
      shortName: "War Begins",
      order: 6,
      importance: "core",
      ranges: [{ mediaId: 269, startEpisode: 190, endEpisode: 204 }], // VERIFY name placement
    },
    {
      id: "turn-back-the-pendulum",
      name: "Turn Back the Pendulum (Visored Origins)",
      shortName: "TBTP",
      order: 7,
      importance: "core",
      ranges: [{ mediaId: 269, startEpisode: 205, endEpisode: 212 }],
    },
    {
      id: "the-dome",
      name: "The Dome — Ichigo vs Ulquiorra",
      shortName: "The Dome",
      order: 8,
      importance: "core",
      ranges: [{ mediaId: 269, startEpisode: 213, endEpisode: 229 }], // VERIFY name placement
    },
    {
      id: "zanpakuto-filler",
      name: "Zanpakutō Rebellion (Filler)",
      shortName: "Zanpakutō Filler",
      order: 9,
      importance: "skippable",
      ranges: [{ mediaId: 269, startEpisode: 230, endEpisode: 265 }], // VERIFY end boundary
    },
    {
      id: "aizens-fall",
      name: "Aizen's Fall — The Final Getsuga",
      shortName: "Aizen's Fall",
      order: 10,
      importance: "core",
      ranges: [{ mediaId: 269, startEpisode: 266, endEpisode: 316 }], // Final Getsuga ~308–310
    },
    {
      id: "reigai-filler",
      name: "Gotei 13 Invading Army (Filler)",
      shortName: "Reigai Filler",
      order: 11,
      importance: "skippable",
      ranges: [{ mediaId: 269, startEpisode: 317, endEpisode: 342 }],
    },
    {
      id: "fullbring",
      name: "Fullbring Arc — The Lost Agent",
      shortName: "Fullbring",
      order: 12,
      importance: "core",
      ranges: [{ mediaId: 269, startEpisode: 343, endEpisode: 366 }],
    },
  ],
};
