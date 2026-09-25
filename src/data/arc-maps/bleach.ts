import type { FranchiseArcMap } from "@/types/arc-map";

export const bleachArcMap: FranchiseArcMap = {
  rootAnilistId: 269, // AniList Media ID for Bleach (2004)
  franchiseName: "Bleach",
  primaryMediaIds: [269],
  version: 2,
  updatedAt: "2026-09-17",
  arcs: [
    // Tiling check: 20+43+46+58+22+15+8+17+36+51+26+24 = 366 ✓
    // TYBW (separate, smaller entries) is intentionally NOT mapped — renders as normal entries.
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
      name: "Bount Arc — Earth & Soul Society Assault (Filler)",
      shortName: "Bount",
      order: 3,
      importance: "skippable",
      // FULL filler span: Kariya on Earth (64-91) PLUS the Bount assault on
      // Soul Society (92-109). Canon resumes at 110 (Shinji's first appearance).
      ranges: [{ mediaId: 269, startEpisode: 64, endEpisode: 109 }],
    },
    {
      id: "arrancar",
      name: "Arrancar Arc — The Espada & Hueco Mundo",
      shortName: "Arrancar",
      order: 4,
      importance: "core",
      // 110 (Visored reveal) through 167 (Grimmjow's defeat); partial recaps
      // absorbed — no full filler block inside this span.
      ranges: [{ mediaId: 269, startEpisode: 110, endEpisode: 167 }],
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
      name: "Hueco Mundo Climax — Nnoitra & the War's Eve",
      shortName: "Nnoitra",
      order: 6,
      importance: "core",
      // Canon resumes post-filler: Nnoitra's assault, Nelliel's past, and
      // the move toward Fake Karakura as the winter war opens.
      ranges: [{ mediaId: 269, startEpisode: 190, endEpisode: 204 }],
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
      name: "Fake Karakura War I — Espada Battles & The Dome",
      shortName: "The Dome",
      order: 8,
      importance: "core",
      // War part 1: the Espada battles at Fake Karakura plus Ichigo vs
      // Ulquiorra on the dome of Las Noches (hollowfication finale).
      ranges: [{ mediaId: 269, startEpisode: 213, endEpisode: 229 }],
    },
    {
      id: "zanpakuto-filler",
      name: "Zanpakutō Rebellion (Filler)",
      shortName: "Zanpakutō Filler",
      order: 9,
      importance: "skippable",
      // Confirmed: 230-265; the war resumes at 266.
      ranges: [{ mediaId: 269, startEpisode: 230, endEpisode: 265 }],
    },
    {
      id: "aizens-fall",
      name: "Fake Karakura War II — Aizen's Fall & Final Getsuga",
      shortName: "Aizen's Fall",
      order: 10,
      importance: "core",
      ranges: [{ mediaId: 269, startEpisode: 266, endEpisode: 316 }], // Final Getsuga ~308-310
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
