import type { FranchiseArcMap } from "@/types/arc-map";

export const gintamaArcMap: FranchiseArcMap = {
  rootAnilistId: 918, // VERIFIED via curl (AniList search → Gintama, 201 eps, FINISHED)
  franchiseName: "Gintama",
  primaryMediaIds: [918],
  version: 1,
  updatedAt: "2026-09-17",
  arcs: [
    // DESIGN: Gintama's episodic comedy is core content, NOT filler — no skip tiers.
    // The map's job is navigation: the serious arcs are landmarks viewers hunt for.
    // (Benizakura also exists as a compilation movie retelling 58-61.)
    // Tiling check: 57+4+39+5+33+8+30+5+20 = 201 ✓
    {
      id: "everyday-opening",
      name: "Everyday Cases — Kabukicho Setup (Eps 1-57)",
      shortName: "Early Comedy",
      order: 1,
      importance: "core",
      ranges: [{ mediaId: 918, startEpisode: 1, endEpisode: 57 }], // VERIFY: ep 1-2 are anime-original intros, kept core
    },
    {
      id: "benizakura",
      name: "Benizakura Arc",
      shortName: "Benizakura",
      order: 2,
      importance: "core",
      ranges: [{ mediaId: 918, startEpisode: 58, endEpisode: 61 }], // first serious arc — the "it gets good here" landmark
    },
    {
      id: "everyday-post-benizakura",
      name: "Everyday Cases (Eps 62-100)",
      shortName: "Comedy",
      order: 3,
      importance: "core",
      ranges: [{ mediaId: 918, startEpisode: 62, endEpisode: 100 }],
    },
    {
      id: "shinsengumi-crisis",
      name: "Shinsengumi Crisis Arc",
      shortName: "Shinsengumi Crisis",
      order: 4,
      importance: "core",
      ranges: [{ mediaId: 918, startEpisode: 101, endEpisode: 105 }], // VERIFY exact span
    },
    {
      id: "everyday-post-crisis",
      name: "Everyday Cases (Eps 106-138)",
      shortName: "Comedy",
      order: 5,
      importance: "core",
      ranges: [{ mediaId: 918, startEpisode: 106, endEpisode: 138 }],
    },
    {
      id: "yoshiwara",
      name: "Yoshiwara in Flames Arc",
      shortName: "Yoshiwara",
      order: 6,
      importance: "core",
      ranges: [{ mediaId: 918, startEpisode: 139, endEpisode: 146 }], // VERIFY exact span
    },
    {
      id: "everyday-post-yoshiwara",
      name: "Everyday Cases (Eps 147-176)",
      shortName: "Comedy",
      order: 7,
      importance: "core",
      ranges: [{ mediaId: 918, startEpisode: 147, endEpisode: 176 }],
    },
    {
      id: "red-spider",
      name: "Red Spider Arc (Jiraia)",
      shortName: "Red Spider",
      order: 8,
      importance: "core",
      ranges: [{ mediaId: 918, startEpisode: 177, endEpisode: 181 }], // VERIFY exact span
    },
    {
      id: "everyday-finale",
      name: "Everyday Cases — Season Finale (Eps 182-201)",
      shortName: "Comedy Finale",
      order: 9,
      importance: "core",
      ranges: [{ mediaId: 918, startEpisode: 182, endEpisode: 201 }],
    },
  ],
};
