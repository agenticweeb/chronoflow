export interface TierAnime {
  title: string;
  slug?: string;
  tag: string;
}

export interface SeoTier {
  id: string;
  name: string;
  description: string;
  anime: TierAnime[];
}

export const SEO_TIERS: SeoTier[] = [
  {
    id: "beginner",
    name: "Beginner Gateways",
    description: "Just starting your anime journey? Start here with these mainstream entry points.",
    anime: [
      { title: "Attack on Titan", slug: "attack-on-titan", tag: "Action" },
      { title: "Demon Slayer", slug: "demon-slayer", tag: "Action" },
      { title: "My Hero Academia", slug: "my-hero-academia", tag: "Shonen" },
      { title: "Death Note", slug: "death-note", tag: "Psychological" },
      { title: "Jujutsu Kaisen", slug: "jujutsu-kaisen", tag: "Action" },
      { title: "Fullmetal Alchemist: Brotherhood", slug: "fullmetal-alchemist", tag: "Adventure" },
      { title: "Sword Art Online", slug: "sword-art-online", tag: "Fantasy" },
      { title: "Hunter x Hunter", slug: "hunter-x-hunter", tag: "Adventure" }
    ]
  },
  {
    id: "veteran",
    name: "Veteran Timeline Mazes",
    description: "Ready for a challenge? These franchises feature complex, multi-route timelines that require a guide.",
    anime: [
      { title: "Fate Series", slug: "fate-series", tag: "Multiverse" },
      { title: "Monogatari Series", slug: "monogatari-series", tag: "Non-Linear" },
      { title: "Neon Genesis Evangelion", slug: "neon-genesis-evangelion", tag: "Alt Reality" },
      { title: "Steins;Gate", slug: "steins-gate", tag: "Time Travel" },
      { title: "JoJo's Bizarre Adventure", slug: "jojo-bizarre-adventure", tag: "Generational" },
      { title: "Code Geass", slug: "code-geass", tag: "Mecha" },
      { title: "Toaru Series", slug: "toaru-series", tag: "Overlap" },
      { title: "Cyberpunk: Edgerunners", slug: "cyberpunk-edgerunners", tag: "Sci-Fi" },
      { title: "Chainsaw Man", slug: "chainsaw-man", tag: "Action" },
      { title: "Vinland Saga", slug: "vinland-saga", tag: "Drama" },
      { title: "One Punch Man", slug: "one-punch-man", tag: "Action" }
    ]
  },
  {
    id: "addict",
    name: "Addict Completionist Paths",
    description: "Deep-cut cult classics and massive space operas for the dedicated completionist.",
    anime: [
      { title: "One Piece", slug: "one-piece", tag: "Long Runner" },
      { title: "Gundam (Universal Century)", slug: "gundam-uc", tag: "Decades" },
      { title: "Naruto", slug: "naruto", tag: "Filler Heavy" },
      { title: "Bleach", slug: "bleach", tag: "Filler Heavy" },
      { title: "Dragon Ball", slug: "dragon-ball", tag: "Decades" },
      { title: "Legend of the Galactic Heroes", slug: "legend-of-the-galactic-heroes", tag: "Space Opera" },
      { title: "Mushoku Tensei: Jobless Reincarnation", slug: "mushoku-tensei", tag: "Isekai" },
      { title: "That Time I Got Reincarnated as a Slime", slug: "that-time-i-got-reincarnated-as-a-slime", tag: "Fantasy" },
      { title: "Detective Conan", slug: "detective-conan", tag: "Mystery" },
      { title: "The Melancholy of Haruhi Suzumiya", slug: "haruhi-suzumiya", tag: "Mystery" },
      { title: "Gintama", slug: "gintama", tag: "Comedy" },
      { title: "Ghost in the Shell", slug: "ghost-in-the-shell", tag: "Sci-Fi" }
    ]
  }
];
