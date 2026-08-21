"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Telescope } from "lucide-react";

// Map our internal classifications to franchises with similar structures
const STRUCTURAL_TWINS: Record<string, { slug: string; name: string }[]> = {
  mega_franchise: [
    { slug: "fate-series", name: "Fate Series" },
    { slug: "monogatari-series", name: "Monogatari Series" },
    { slug: "gundam-uc", name: "Gundam (Universal Century)" }
  ],
  canon_movie_sandwich: [
    { slug: "jojo-bizarre-adventure", name: "JoJo's Bizarre Adventure" },
    { slug: "neon-genesis-evangelion", name: "Neon Genesis Evangelion" },
    { slug: "haikyu", name: "Haikyu!!" }
  ],
  route_branching: [
    { slug: "steins-gate", name: "Steins;Gate" },
    { slug: "clannad", name: "Clannad" },
    { slug: "fate-series", name: "Fate Series" }
  ],
  long_runner: [
    { slug: "one-piece", name: "One Piece" },
    { slug: "naruto", name: "Naruto" },
    { slug: "bleach", name: "Bleach" }
  ],
  // DELETE THIS DEFAULT BLOCK:
  // default: [
  //   { slug: "fate-series", name: "Fate Series" },
  //   { slug: "steins-gate", name: "Steins;Gate" },
  //   { slug: "neon-genesis-evangelion", name: "Neon Genesis Evangelion" }
  // ]
};

interface BeyondHorizonProps {
  classification: string;
  currentSlug?: string;
}

export function BeyondHorizon({ classification, currentSlug }: BeyondHorizonProps) {
  // Get the list of twins based on the current anime's classification
  // If the classification isn't in the map (e.g., single_core), return an empty array
  const twins = (STRUCTURAL_TWINS[classification] || [])
    .filter(t => t.slug !== currentSlug) // Don't recommend the anime they just watched
    .slice(0, 3);

  if (twins.length === 0) return null;

  return (
    <section className="mt-20 border-t border-chrono-border/20 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-chrono-primary/10 mb-4">
          <Telescope className="w-6 h-6 text-chrono-primary" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Beyond the Timeline Horizon</h2>
        <p className="text-chrono-text-muted max-w-xl mx-auto">
          You mastered this timeline structure. Ready for the next architectural challenge? 
          <br />
          <span className="text-xs text-chrono-text-dim">
            (Recommendations are based on similar narrative complexity and timeline shape, not genre.)
          </span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {twins.map((twin, i) => (
          <motion.div
            key={twin.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <Link 
              href={`/watch-order/${twin.slug}`}
              className="group block p-6 rounded-xl border border-chrono-border/30 bg-chrono-surface/30 hover:bg-chrono-surface-hover/30 transition-colors duration-200"
            >
              <h3 className="font-semibold text-white group-hover:text-chrono-primary transition-colors mb-1">
                {twin.name}
              </h3>
              <span className="text-[10px] text-chrono-text-dim uppercase tracking-wider">
                Similar Structure
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
