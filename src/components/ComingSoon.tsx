"use client";

import React from "react";
import { Telescope, Sparkles, Layers, Users, GitBranch } from "lucide-react";

// Static roadmap strip — pure content, no fetching, no state.
// Only lists features actually planned (the deferred Discovery engines).
const ROADMAP = [
  {
    icon: Telescope,
    title: "Off Your Usual Path",
    desc: "A shelf built from the gaps in your watch history — quality-floored picks in genres you've never touched.",
  },
  {
    icon: Sparkles,
    title: "Vibe Search",
    desc: 'Type a mood, get a filter: "something like Made in Abyss but shorter."',
  },
  {
    icon: Layers,
    title: "Skip Ledger",
    desc: "Community consensus on what's actually skippable, aggregated from every generated watch order.",
  },
  {
    icon: Users,
    title: "Community Bridges",
    desc: '"Loved Attack on Titan? The community says try…" — human-voted one-hop recommendations.',
  },
  {
    icon: GitBranch,
    title: "Franchise Complexity Score",
    desc: "See how tangled a franchise is — entry count, branch points, total hours — before you commit.",
  },
] as const;

export function ComingSoon() {
  return (
    <section className="mt-2">
      <div className="glass-card rounded-2xl border border-chrono-border/20 p-6">
        <span className="text-[10px] font-bold uppercase tracking-widest text-chrono-accent">
          In development
        </span>
        <h2 className="text-base font-extrabold text-white mt-1">Coming soon to Discover</h2>
        <p className="text-[11px] text-chrono-text-dim mt-1">
          The shelves and filters above are the foundation — these engines are being built on top of it.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROADMAP.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-chrono-border/10 bg-black/20 p-4 opacity-80"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chrono-primary/10 text-chrono-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-chrono-text">{title}</h3>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-chrono-text-dim">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
