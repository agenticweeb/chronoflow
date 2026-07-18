import { Sparkles } from "lucide-react";
import { CinematicHero } from "@/components/CinematicHero";
import { InteractiveSearch } from "@/components/InteractiveSearch";
import { TopBanner } from "@/components/TopBanner";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="min-h-dvh relative flex flex-col">
      {/* Dimissible Brand Marquee Banner */}
      <TopBanner />

      <header className="sticky top-0 z-50 border-b border-chrono-border/20 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-chrono-primary to-fuchsia-600 flex items-center justify-center shadow-lg shadow-chrono-primary/25"
              aria-hidden="true"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block leading-none">
                ChronoFlow
              </span>
              <span className="text-[10px] text-[#a8a3b8] uppercase tracking-widest font-semibold">
                Grounded Watch Orders
              </span>
            </div>
          </div>

          <a
            href="https://github.com/agenticweeb/chronoflow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-semibold text-[#a8a3b8] hover:text-white transition-colors"
            aria-label="Star ChronoFlow on GitHub"
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
      </header>

      {/* Primary Experience Container */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        <CinematicHero />
        <InteractiveSearch />
      </section>

      {/* Fully Informative Footer System */}
      <footer className="border-t border-chrono-border/20 bg-chrono-surface/20 py-10 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <span className="font-extrabold text-sm tracking-tight text-white block">
              Database-Grounded Navigation
            </span>
            <p className="text-xs text-[#a8a3b8] leading-relaxed max-w-xs">
              This system does not rely on static artificial intelligence memory. ChronoFlow constructs interactive timelines directly from live GraphQL relation graphs, eliminating information errors on new and ongoing releases.
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
          © {new Date().getFullYear()} ChronoFlow • Optimized by @agenticweeb
        </div>
      </footer>
    </main>
  );
}
