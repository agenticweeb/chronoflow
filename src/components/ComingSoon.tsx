"use client";

import React from "react";
import { Sparkles, Layers, GitBranch, Bot } from "lucide-react";

// Static roadmap strip — only features NOT yet shipped.
// Removed (now live): Off Your Usual Path, Because You Generated,
// personalized shelf ordering. Dropped as duplicate: Community Bridges
// (Because You Generated already rides AniList's recommendations).
const ROADMAP = [
  {
    icon: Bot,
    title: "Watch Orders in Chat",
    desc: "Ask for any franchise's order right inside Discord and Telegram — embed with time-saved stats and a link back to the full timeline.",
  },
  {
    icon: Sparkles,
    title: "Vibe Search",
    desc: 'Type a mood, get a filter: "something like Made in Abyss but shorter."',
  },
  {
    icon: Layers,
    title: "Skip Ledger",
    desc: "Community consensus on what's actually skippable, aggregated from every generated watch order — the community's verdict on every skip.",
  },
  {
    icon: GitBranch,
    title: "Franchise Complexity Score",
    desc: "See how tangled a franchise is — entry count, branch points, total hours — before you commit a month of your life.",
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
          The shelves and filters above are the foundation — these are being built on top of it.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
