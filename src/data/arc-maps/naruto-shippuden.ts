import type { FranchiseArcMap } from "@/types/arc-map";

export const shippudenArcMap: FranchiseArcMap = {
  // TODO (verify on first render): AniList ID 1735 for Naruto: Shippuden —
  // confirm with `Media(id: 1735) { title { romaji } episodes }` once AniList is back.
  rootAnilistId: 1735,
  franchiseName: "Naruto: Shippuden",
  primaryMediaIds: [1735],
  version: 1,
  updatedAt: "2026-09-09",
  arcs: [
    // Tiling check: 32+21+18+17+24+31+8+24+3+43+36+222+21 = 500 ✓
    {
      id: "kazekage-rescue",
      name: "Kazekage Rescue Mission",
      shortName: "Kazekage Rescue",
      order: 1,
      importance: "core",
      ranges: [{ mediaId: 1735, startEpisode: 1, endEpisode: 32 }],
    },
    {
      id: "tenchi-bridge",
      name: "Tenchi Bridge Reconnaissance",
      shortName: "Tenchi Bridge",
      order: 2,
      importance: "core",
      ranges: [{ mediaId: 1735, startEpisode: 33, endEpisode: 53 }],
    },
    {
      id: "twelve-guardian-filler",
      name: "Twelve Guardian Ninja (Filler)",
      shortName: "Sora Filler",
      order: 3,
      importance: "skippable",
      ranges: [{ mediaId: 1735, startEpisode: 54, endEpisode: 71 }],
    },
    {
      id: "akatsuki-suppression",
      name: "Akatsuki Suppression — Hidan & Kakuzu",
      shortName: "Hidan & Kakuzu",
      order: 4,
      importance: "core",
      ranges: [{ mediaId: 1735, startEpisode: 72, endEpisode: 88 }],
    },
    {
      id: "three-tails",
      name: "Three-Tails Appearance (Mixed)",
      shortName: "Three-Tails",
      order: 5,
      importance: "recommended", // canon/filler interleaved (Guren storyline)
      ranges: [{ mediaId: 1735, startEpisode: 89, endEpisode: 112 }],
    },
    {
      id: "itachi-pursuit",
      name: "Itachi Pursuit — Jiraiya, Sasuke & the Truth",
      shortName: "Itachi Pursuit",
      order: 6,
      importance: "core",
      ranges: [{ mediaId: 1735, startEpisode: 113, endEpisode: 143 }], // incl. Kakashi Gaiden ~119–120
    },
    {
      id: "six-tails-filler",
      name: "Six-Tails Unleashed (Filler)",
      shortName: "Utakata Filler",
      order: 7,
      importance: "skippable",
      ranges: [{ mediaId: 1735, startEpisode: 144, endEpisode: 151 }],
    },
    {
      id: "pains-assault",
      name: "Pain's Assault",
      shortName: "Pain's Assault",
      order: 8,
      importance: "core",
      ranges: [{ mediaId: 1735, startEpisode: 152, endEpisode: 175 }],
    },
    {
      id: "fourths-legacy-filler",
      name: "Quest for the Fourth's Legacy (Filler)",
      shortName: "Legacy Filler",
      order: 9,
      importance: "skippable",
      ranges: [{ mediaId: 1735, startEpisode: 176, endEpisode: 178 }],
    },
    {
      id: "five-kage-summit",
      name: "Five Kage Summit & War Prologue",
      shortName: "Five Kage Summit",
      order: 10,
      importance: "core",
      ranges: [{ mediaId: 1735, startEpisode: 179, endEpisode: 221 }], // VERIFY: 196/221 split
    },
    {
      id: "war-countdown",
      name: "War Countdown (Mixed)",
      shortName: "War Countdown",
      order: 11,
      importance: "recommended", // interleaves 'Paradise Life on a Boat' filler
      ranges: [{ mediaId: 1735, startEpisode: 222, endEpisode: 257 }], // VERIFY boundaries
    },
    {
      id: "fourth-shinobi-war",
      name: "Fourth Shinobi World War",
      shortName: "The War",
      order: 12,
      importance: "core",
      // one saga-level block; scattered filler interludes absorbed (271, 279–281,
      // 290–295 'Power', 376–377, 416, 422–423, 456–457) — VERIFY against filler guide
      ranges: [{ mediaId: 1735, startEpisode: 258, endEpisode: 479 }],
    },
    {
      id: "new-era-filler",
      name: "New Era — Novel Adaptations (Filler)",
      shortName: "New Era",
      order: 13,
      importance: "skippable",
      ranges: [{ mediaId: 1735, startEpisode: 480, endEpisode: 500 }],
    },
  ],
};
