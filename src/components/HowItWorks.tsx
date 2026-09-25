/**
 * HowItWorks — homepage onboarding section (Runway #2).
 * Pure Server Component: static content, CSS-only hover effects,
 * zero client JavaScript added to the bundle.
 */

import { Search, Route, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Search any anime",
    desc: "Type any title — from this season's hits to 40-year-old franchises. The full relation graph is pulled live from AniList: sequels, movies, OVAs, spin-offs, alternate timelines.",
  },
  {
    icon: Route,
    step: "02",
    title: "Get a spoiler-safe path",
    desc: "Every entry is sequenced into an optimal order and tiered — Must Watch, Recommended, Optional, Skip — so reveals land right and filler never wastes your time.",
  },
  {
    icon: CheckCircle2,
    step: "03",
    title: "Track progress, finish strong",
    desc: "Check off episodes as you go — progress is saved right in your browser. Finish-date estimates update live with every pace, from Casual to Binge.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-chrono-primary">
          How it works
        </span>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          From &ldquo;where do I even start?&rdquo; to your first episode
        </h2>
        <p className="mt-3 text-sm text-chrono-text-dim">
          Three steps. No account required. Every path is grounded in verified AniList data — never invented.
        </p>
      </div>

      <div className="relative mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        {/* Connector line (desktop) */}
        <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-chrono-primary/10 via-chrono-primary/40 to-chrono-primary/10 md:block" />

        {STEPS.map(({ icon: Icon, step, title, desc }) => (
          <article
            key={step}
            className="glass-card relative rounded-2xl border border-chrono-border/20 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-chrono-primary/40"
          >
            <div className="relative inline-flex rounded-xl bg-gradient-to-br from-chrono-primary to-fuchsia-600 p-3 shadow-lg shadow-chrono-primary/25">
              <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-chrono-bg text-[10px] font-black text-white ring-1 ring-chrono-border">
                {step}
              </span>
            </div>
            <h3 className="mt-4 text-sm font-bold text-white">{title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-chrono-text-dim">{desc}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href="#chrono-search"
          className="btn-primary inline-flex cursor-pointer items-center gap-2 px-7 py-3.5 text-sm"
        >
          <Search className="h-4 w-4" />
          <span>Find your first path</span>
        </a>
        <p className="mt-3 text-[11px] text-chrono-text-dim">
          Free · No sign-up · Spoiler-safe by design
        </p>
      </div>
    </section>
  );
}
