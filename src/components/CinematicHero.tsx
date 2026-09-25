"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export function CinematicHero() {
  return (
    <section
      className="relative text-center max-w-4xl mx-auto space-y-6 pt-2 sm:pt-4 select-none"
      aria-labelledby="chrono-hero-heading"
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-chrono-primary/15 rounded-full blur-[90px] -z-10 animate-glow-pulse"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
        className="inline-flex items-center gap-2 rounded-full border border-chrono-primary/30 bg-chrono-primary/10 px-3.5 py-1.5 text-xs text-chrono-primary font-semibold shadow-lg shadow-chrono-primary/10"
      >
        <Sparkles className="w-3.5 h-3.5 text-chrono-accent animate-pulse" aria-hidden="true" />
        <span>Grounded Intelligence Engine · V2.4</span>
      </motion.div>

      <motion.h1
        id="chrono-hero-heading"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease }}
        className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-white"
      >
        Grounded Anime <br className="hidden sm:block" />
        <span className="text-gradient">Watch Orders</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16, ease }}
        className="text-chrono-text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-semibold"
      >
        Explore confusing anime franchises without spoilers. Find optimal watch orders, skip fillers, and generate custom schedules based on your real viewing pace.
      </motion.p>

      <motion.ul
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.24, ease }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto pt-2 text-left"
      >
        {[
          {
            title: "ID-First Grounding",
            desc: "The compiler matches entries strictly against verified databases, eliminating information errors.",
          },
          {
            title: "Shape-Aware Paths",
            desc: "Handles convoluted multiverses, arc-based fillers, and movie continuations flawlessly.",
          },
          {
            title: "Schedule Synthesizer",
            desc: "Translates runtime minutes into standard episode weights to build accurate calendars.",
          },
        ].map((item) => (
          <li
            key={item.title}
            className="glass-card p-4 border border-chrono-border/40 hover:border-chrono-primary/25 transition-colors"
          >
            <h2 className="text-sm font-semibold text-chrono-text">{item.title}</h2>
            <p className="text-xs text-chrono-text-dim mt-1.5 leading-relaxed font-medium">
              {item.desc}
            </p>
          </li>
        ))}
      </motion.ul>
    </section>
  );
}
