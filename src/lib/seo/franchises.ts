export interface SeoFranchise {
  slug: string;
  name: string;
  anilistId?: number;
  description: string;
  h1: string;
}

export const SEO_FRANCHISES: SeoFranchise[] = [
  {
    slug: "fate-series",
    name: "Fate Series",
    anilistId: 10087,
    description: "The ultimate Fate series watch order guide. Learn how to watch Fate/stay night, Fate/Zero, Unlimited Blade Works, and Heaven's Feel in the correct, spoiler-safe order.",
    h1: "Fate Series Watch Order Guide"
  },
  {
    slug: "monogatari-series",
    name: "Monogatari Series",
    anilistId: 5081,
    description: "The complete Monogatari watch order guide. Understand the difference between release order and chronological order for Bakemonogatari, Nisemonogatari, and Owari.",
    h1: "Monogatari Series Watch Order Guide"
  },
  {
    slug: "steins-gate",
    name: "Steins;Gate",
    anilistId: 9253,
    description: "The definitive Steins;Gate watch order. Find out exactly when to watch Steins;Gate 0, the OVA, and the Movie to preserve the timeline reveals.",
    h1: "Steins;Gate Watch Order Guide"
  },
  {
    slug: "toaru-series",
    name: "A Certain Magical Index / Railgun",
    anilistId: 4654,
    description: "The Toaru series watch order guide. Synchronize the timelines of A Certain Magical Index and A Certain Scientific Railgun perfectly.",
    h1: "Toaru (Index & Railgun) Watch Order Guide"
  },
  {
    slug: "neon-genesis-evangelion",
    name: "Neon Genesis Evangelion",
    anilistId: 30,
    description: "The ultimate Evangelion watch order. Navigate the original TV series, End of Evangelion, and the Rebuild tetralogy without confusion.",
    h1: "Evangelion Watch Order Guide"
  },
  {
    slug: "haruhi-suzumiya",
    name: "The Melancholy of Haruhi Suzumiya",
    anilistId: 849,
    description: "The Haruhi Suzumiya watch order guide. Understand the difference between broadcast order and chronological order.",
    h1: "Haruhi Suzumiya Watch Order Guide"
  },
  {
    slug: "horimiya",
    name: "Horimiya",
    anilistId: 124041,
    description: "The Horimiya watch order guide. Find out how to integrate the missing chapters from the second season perfectly.",
    h1: "Horimiya Watch Order Guide"
  },
  {
    slug: "dragon-ball",
    name: "Dragon Ball",
    anilistId: 223,
    description: "The massive Dragon Ball watch order guide. Navigate Dragon Ball, Z, GT, Super, and the movies without filler fatigue.",
    h1: "Dragon Ball Watch Order Guide"
  },
  {
    slug: "code-geass",
    name: "Code Geass",
    anilistId: 1575,
    description: "The Code Geass watch order guide. Understand the split timeline between the original series and the Akito the Exiled OVA.",
    h1: "Code Geass Watch Order Guide"
  },
  {
    slug: "naruto",
    name: "Naruto",
    anilistId: 20,
    description: "The ultimate Naruto watch order guide. Skip the massive multi-season blocks of non-canon filler with our exact episode ranges.",
    h1: "Naruto Watch Order Guide"
  },
  {
    slug: "gundam-uc",
    name: "Gundam Universal Century",
    anilistId: 80,
    description: "The Gundam Universal Century watch order guide. Navigate the decades of classic OVAs and series in the correct chronological order.",
    h1: "Gundam Universal Century Watch Order Guide"
  },
  {
    slug: "durarara",
    name: "Durarara!!",
    anilistId: 6746,
    description: "The Durarara!! watch order guide. Navigate the multi-character viewpoints and non-linear narrative chunks across x2 Shou, Ten, and Ketsu.",
    h1: "Durarara!! Watch Order Guide"
  },
  {
    slug: "jojo-bizarre-adventure",
    name: "JoJo's Bizarre Adventure",
    anilistId: 14719,
    description: "The JoJo's Bizarre Adventure watch order guide. Follow the generational saga from Phantom Blood to Stone Ocean in the correct order.",
    h1: "JoJo's Bizarre Adventure Watch Order Guide"
  },
  {
    slug: "my-hero-academia",
    name: "My Hero Academia",
    anilistId: 21459,
    description: "The My Hero Academia watch order guide. Find out exactly which episode to pause during the mainline seasons to watch the canonical tie-in movies.",
    h1: "My Hero Academia Watch Order Guide"
  },
  {
    slug: "one-piece",
    name: "One Piece",
    anilistId: 21,
    description: "The One Piece watch order guide. Exceeding a thousand episodes, find exactly where filler arcs and theatrical movies fit smoothly.",
    h1: "One Piece Watch Order Guide"
  },
  {
    slug: "bleach",
    name: "Bleach",
    anilistId: 269,
    description: "The Bleach watch order guide. Skip the year-long filler storylines and jump straight back into the canonical battles.",
    h1: "Bleach Watch Order Guide"
  },
  {
    slug: "baccano",
    name: "Baccano!",
    anilistId: 3603,
    description: "The Baccano! watch order guide. Understand the multi-decade skips and how to follow the overlapping storylines.",
    h1: "Baccano! Watch Order Guide"
  },
  {
    slug: "danganronpa",
    name: "Danganronpa",
    anilistId: 16592,
    description: "The Danganronpa watch order guide. Swap back and forth between two entirely different airing seasons episode-by-episode correctly.",
    h1: "Danganronpa Watch Order Guide"
  },
  {
    slug: "clannad",
    name: "Clannad",
    anilistId: 2167,
    description: "The Clannad watch order guide. Navigate the visual novel side stories and alternative universe OVA episodes.",
    h1: "Clannad Watch Order Guide"
  },
  {
    slug: "haikyu",
    name: "Haikyu!!",
    anilistId: 20883,
    description: "The Haikyu!! watch order guide. Find out where to watch the critical short films and cinematic movies between the numbered seasons.",
    h1: "Haikyu!! Watch Order Guide"
  }
];

export function getFranchiseBySlug(slug: string): SeoFranchise | undefined {
  return SEO_FRANCHISES.find(f => f.slug === slug);
}
