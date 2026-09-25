"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Telescope } from "lucide-react";
import { FRANCHISE_DNA_PROFILES } from "@/lib/seo/dna-profiles";
import type { FranchiseDNA } from "@/lib/dna";

interface BeyondHorizonProps {
  currentDNA: FranchiseDNA;
  currentSlug?: string;
  currentName?: string;
}

// Cosine Similarity Algorithm
function calculateSimilarity(a: FranchiseDNA, b: FranchiseDNA): number {
  const dotProduct = (a.nonLinearity * b.nonLinearity) + (a.entryClarity * b.entryClarity) + (a.density * b.density) + (a.sequelDepth * b.sequelDepth) + (a.branchFactor * b.branchFactor);
  const magA = Math.sqrt((a.nonLinearity ** 2) + (a.entryClarity ** 2) + (a.density ** 2) + (a.sequelDepth ** 2) + (a.branchFactor ** 2));
  const magB = Math.sqrt((b.nonLinearity ** 2) + (b.entryClarity ** 2) + (b.density ** 2) + (b.sequelDepth ** 2) + (b.branchFactor ** 2));
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}

export function BeyondHorizon({ currentDNA, currentSlug, currentName }: BeyondHorizonProps) {
  const twins = Object.values(FRANCHISE_DNA_PROFILES)
    .filter(p => p.slug !== currentSlug && p.name !== currentName) // Exclude current anime
    .map(p => ({
      ...p,
      similarity: calculateSimilarity(currentDNA, p.dna)
    }))
    .sort((a, b) => b.similarity - a.similarity)
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
            (Recommendations are calculated via Cosine Similarity on franchise topology, not genre.)
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
              <h3 className="font-semibold text-white group-hover:text-chrono-primary transition-colors mb-2">
                {twin.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-chrono-text-dim uppercase tracking-wider">
                  Topology Match
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {Math.round(twin.similarity * 100)}% Similar
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
