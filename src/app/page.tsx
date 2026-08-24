import Link from "next/link";
import { Clock } from "lucide-react";
import { CinematicHero } from "@/components/CinematicHero";
import { InteractiveSearch } from "@/components/InteractiveSearch";
import { fetchCurrentlyAiring } from "@/app/actions";
import { TopBanner } from "@/components/TopBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChronoCompanion } from "@/components/ChronoCompanion";
import { searchAnimeAction } from "@/app/actions";
import { SEO_TIERS } from "@/lib/seo/tiers";
export const dynamic = "force-dynamic";

// 1. Define the base suggestions on the server
const BASE_SUGGESTIONS = [
  { title: "Fate Series", malId: 10087, anilistId: 10087, imageUrl: "/suggestions/fate.jpg", score: 8.3, tag: "Multiverse", desc: "Routes are parallel realities, not sequels.", slug: "fate-series" },
  { title: "Monogatari Series", malId: 5081, anilistId: 5081, imageUrl: "/suggestions/monogatari.jpeg", score: 8.4, tag: "Non-Linear", desc: "Release vs chronological is a real debate.", slug: "monogatari-series" },
  { title: "Steins;Gate", malId: 9253, anilistId: 9253, imageUrl: "/suggestions/Steins;Gate.jpeg", score: 9.1, tag: "Time Travel", desc: "Routes are not linear sequels.", slug: "steins-gate" },
  { title: "JoJo's Bizarre Adventure", malId: 14719, anilistId: 14719, imageUrl: "/suggestions/JoJo's Bizarre Adventure.jpeg", score: 8.2, tag: "Generational", desc: "Each Part shifts art, genre, and protagonist.", slug: "jojo-bizarre-adventure" },
  { title: "Neon Genesis Evangelion", malId: 30, anilistId: 30, imageUrl: "/suggestions/Neon Genesis Evangelion.jpeg", score: 8.3, tag: "Alt Reality", desc: "TV, End of Eva, and Rebuilds — three endings.", slug: "neon-genesis-evangelion" },
  { title: "Gundam (Universal Century)", malId: 80, anilistId: 80, imageUrl: "/suggestions/Gundam (Universal Century).jpeg", score: 7.8, tag: "Decades", desc: "40+ years of UC media. Jump carefully.", slug: "gundam-uc" },
  { title: "One Piece", malId: 21, anilistId: 21, imageUrl: "", score: 9.0, tag: "Long Runner", desc: "1100+ episodes. Skip filler, keep G-8.", slug: "one-piece" },
  { title: "Naruto", malId: 20, anilistId: 20, imageUrl: "", score: 8.5, tag: "Filler Heavy", desc: "Skip massive multi-season blocks of filler.", slug: "naruto" },
  { title: "Bleach", malId: 269, anilistId: 269, imageUrl: "", score: 8.2, tag: "Filler Heavy", desc: "Cut away from canonical battles to skip filler.", slug: "bleach" },
  { title: "Dragon Ball", malId: 223, anilistId: 223, imageUrl: "", score: 8.0, tag: "Decades", desc: "Mix of main stories, non-canon films, and Kai.", slug: "dragon-ball" },
  { title: "Code Geass", malId: 1575, anilistId: 1575, imageUrl: "", score: 8.7, tag: "Split Timeline", desc: "Film trilogy rewrites key deaths for modern sequels.", slug: "code-geass" },
  { title: "Haruhi Suzumiya", malId: 849, anilistId: 849, imageUrl: "", score: 8.0, tag: "Non-Linear", desc: "Broadcast order intentionally jumps through time.", slug: "haruhi-suzumiya" },
  { title: "Durarara!!", malId: 6746, anilistId: 6746, imageUrl: "", score: 8.0, tag: "Multi-POV", desc: "Non-linear narrative chunks with confusing suffixes.", slug: "durarara" },
  { title: "Toaru (Index & Railgun)", malId: 4654, anilistId: 4654, imageUrl: "", score: 7.5, tag: "Overlap", desc: "Spin-offs take place simultaneously from different POVs.", slug: "toaru-series" },
  { title: "Horimiya", malId: 124041, anilistId: 124041, imageUrl: "", score: 8.1, tag: "Intercut", desc: "Second season adapts chapters skipped in the first.", slug: "horimiya" },
  { title: "My Hero Academia", malId: 21459, anilistId: 21459, imageUrl: "", score: 8.0, tag: "Canon Movies", desc: "Know exactly which episode to pause to watch movies.", slug: "my-hero-academia" },
  { title: "Baccano!", malId: 3603, anilistId: 3603, imageUrl: "", score: 8.5, tag: "Anachronistic", desc: "Skips across multiple different decades simultaneously.", slug: "baccano" },
  { title: "Danganronpa", malId: 16592, anilistId: 16592, imageUrl: "", score: 7.5, tag: "Swap Order", desc: "Swap back and forth between two airing seasons.", slug: "danganronpa" },
  { title: "Clannad", malId: 2167, anilistId: 2167, imageUrl: "", score: 8.5, tag: "Alt Routes", desc: "OVA episodes completely change the final outcome.", slug: "clannad" },
  { title: "Haikyu!!", malId: 20883, anilistId: 20883, imageUrl: "", score: 8.7, tag: "Canon Movies", desc: "Critical story progression hidden between seasons.", slug: "haikyu" },
];

// 2. Make the page an async Server Component
export default async function Page() {
  // Fetch missing cover images on the server before rendering
  const airingAnime = await fetchCurrentlyAiring(); // <--- ADDED THIS
  
  // Combine BASE_SUGGESTIONS with all anime from SEO_TIERS to ensure we fetch images for all of them
  const tierAnime = SEO_TIERS.flatMap(t => t.anime).map(a => ({
    title: a.title,
    malId: 0,
    anilistId: 0,
    imageUrl: "",
    score: 0,
    tag: a.tag,
    desc: "",
    slug: a.slug || ""
  }));

  const uniqueTitles = new Set();
  const allSuggestions = [...BASE_SUGGESTIONS, ...tierAnime].filter(s => {
    if (uniqueTitles.has(s.title)) return false;
    uniqueTitles.add(s.title);
    return true;
  });

  const suggestionsWithImages = await Promise.all(
    allSuggestions.map(async (suggestion) => {
      if (suggestion.imageUrl) return suggestion;
      
      try {
        const res = await searchAnimeAction(suggestion.title);
        if (res.success && res.data.length > 0) {
          return { ...suggestion, imageUrl: res.data[0].imageUrl };
        }
      } catch (e) {
        console.error(`Failed to fetch image for ${suggestion.title}`);
      }
      return suggestion; // Fallback to empty string (monogram)
    })
  );

  return (
    <main className="min-h-dvh relative flex flex-col">
      {/* Dismissible Brand Marquee Banner */}
      <TopBanner />

      <header className="sticky top-0 z-50 border-b border-chrono-border/20 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-chrono-primary to-fuchsia-600 flex items-center justify-center shadow-lg shadow-chrono-primary/25"
              aria-hidden="true"
            >
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block leading-none">
                MyAniWatchOrder
              </span>
              <span className="text-[10px] text-[#a8a3b8] uppercase tracking-widest font-semibold">
                Grounded Watch Orders
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ChronoCompanion />
            <Link
              href="/about"
              className="flex items-center gap-2 text-xs font-semibold text-[#a8a3b8] hover:text-white transition-colors"
            >
              About
            </Link>
            <a
              href="https://github.com/agenticweeb/chronoflow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-[#a8a3b8] hover:text-white transition-colors"
              aria-label="Star MyAniWatchOrder on GitHub"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                />
              </svg>
              <span className="hidden sm:inline">Star on GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Primary Experience Container */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        <ErrorBoundary>
          <CinematicHero />
          {/* 3. Pass the fetched suggestions AND airingAnime as props */}
          <InteractiveSearch initialSuggestions={suggestionsWithImages} airingAnime={airingAnime} />
        </ErrorBoundary>
      </section>

      {/* Fully Informative Footer System */}
      <footer className="border-t border-chrono-border/20 bg-chrono-surface/20 py-10 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <span className="font-extrabold text-sm tracking-tight text-white block">
              Database-Grounded Navigation
            </span>
            <p className="text-xs text-[#a8a3b8] leading-relaxed max-w-xs">
              This system does not rely on static artificial intelligence memory. MyAniWatchOrder constructs interactive timelines directly from live GraphQL relation graphs, eliminating information errors on new and ongoing releases.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#a8a3b8] uppercase tracking-wider mb-3">
              Developer Info
            </h2>
            <ul className="space-y-2 text-xs text-[#a8a3b8]">
              <li>
                <a
                  href="https://x.com/agenticweeb"
                  className="hover:text-chrono-primary transition-colors font-bold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Follow @agenticweeb on X
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/agenticweeb/chronoflow"
                  className="hover:text-chrono-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#a8a3b8] uppercase tracking-wider mb-3">
              Technical Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js 16 App Router",
                "React 19 Server Actions",
                "Tailwind CSS v4",
                "Dynamic Graph Compilation",
              ].map((label) => (
                <span
                  key={label}
                  className="text-[10px] px-2.5 py-1 bg-white/5 rounded-full text-[#a8a3b8] border border-chrono-border/60"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-chrono-border/10 text-center text-[10px] text-chrono-text-dim select-none">
          © {new Date().getFullYear()} MyAniWatchOrder • Optimized by @agenticweeb
        </div>
      </footer>
    </main>
  );
}
