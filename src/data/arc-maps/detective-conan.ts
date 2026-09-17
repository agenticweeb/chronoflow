import type { FranchiseArcMap } from "@/types/arc-map";

export const detectiveConanArcMap: FranchiseArcMap = {
  rootAnilistId: 235, // VERIFIED via curl (Meitantei Conan, episodes: null, RELEASING)
  franchiseName: "Detective Conan",
  primaryMediaIds: [235],
  version: 1,
  updatedAt: "2026-09-17",
  arcs: [
    // DESIGN: era/storyline blocks. The show is episodic by nature — anime-original
    // cases are core content, NOT filler, so no skip tiers. The map marks the
    // Black Organization storyline landmarks viewers hunt for.
    // CONFIRMED anchors: 1 (start), 48 (Heiji debut), 129 (Haibara debut).
    // Finite arcs tile to 862; Rum era is open-ended (currently airing).
    // Tiling check: 47+81+101+79+116+40+32+8+58+300 = 862 ✓
    {
      id: "early-cases",
      name: "Early Cases — The Shrunken Detective (Eps 1-47)",
      shortName: "Early Cases",
      order: 1,
      importance: "core",
      ranges: [{ mediaId: 235, startEpisode: 1, endEpisode: 47 }], // confirmed: Heiji debuts at 48
    },
    {
      id: "heiji-era",
      name: "Heiji Era — The Detective of the West (Eps 48-128)",
      shortName: "Heiji Era",
      order: 2,
      importance: "core",
      ranges: [{ mediaId: 235, startEpisode: 48, endEpisode: 128 }], // confirmed both ends
    },
    {
      id: "haibara-era",
      name: "Haibara Debut — First Black Organization Shadows (Eps 129-229)",
      shortName: "Haibara Era",
      order: 3,
      importance: "core",
      ranges: [{ mediaId: 235, startEpisode: 129, endEpisode: 229 }], // 129 confirmed; end VERIFY
    },
    {
      id: "vermouth-arc",
      name: "Vermouth Arc",
      shortName: "Vermouth",
      order: 4,
      importance: "core",
      ranges: [{ mediaId: 235, startEpisode: 230, endEpisode: 308 }], // VERIFY both — the disguise web; identity stakes
    },
    {
      id: "post-vermouth",
      name: "Interim Cases (Eps 309-424)",
      shortName: "Interim Cases",
      order: 5,
      importance: "core",
      ranges: [{ mediaId: 235, startEpisode: 309, endEpisode: 424 }], // VERIFY end (Kir start)
    },
    {
      id: "kir-arc",
      name: "Kir Arc — The CIA Infiltration (Eps 425-464)",
      shortName: "Kir",
      order: 6,
      importance: "core",
      ranges: [{ mediaId: 235, startEpisode: 425, endEpisode: 464 }], // VERIFY both — Rena Mizunashi/Kir
    },
    {
      id: "pre-clash",
      name: "Interim Cases (Eps 465-496)",
      shortName: "Interim Cases",
      order: 7,
      importance: "core",
      ranges: [{ mediaId: 235, startEpisode: 465, endEpisode: 496 }], // VERIFY end
    },
    {
      id: "clash-red-black",
      name: "Clash of Red and Black",
      shortName: "Red vs Black",
      order: 8,
      importance: "core",
      ranges: [{ mediaId: 235, startEpisode: 497, endEpisode: 504 }], // VERIFY span — the famous BO-police war
    },
    {
      id: "post-clash",
      name: "Interim Cases (Eps 505-562)",
      shortName: "Interim Cases",
      order: 9,
      importance: "core",
      ranges: [{ mediaId: 235, startEpisode: 505, endEpisode: 562 }], // VERIFY end (Bourbon start)
    },
    {
      id: "bourbon-era",
      name: "Bourbon Era — Amuro & the Alliance (Eps 563-862)",
      shortName: "Bourbon Era",
      order: 10,
      importance: "core",
      // Amuro's debut ~563; the Scarlet series sits inside this span.
      ranges: [{ mediaId: 235, startEpisode: 563, endEpisode: 862 }], // VERIFY both
    },
    {
      id: "rum-era",
      name: "Rum Era — Present (Eps 863-)",
      shortName: "Rum Era",
      order: 11,
      importance: "core",
      ranges: [{ mediaId: 235, startEpisode: 863, endEpisode: Infinity }], // VERIFY start; open-ended — airing
    },
  ],
};
