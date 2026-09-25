"use client";

import { motion } from "framer-motion";
import { History, ChevronRight } from "lucide-react";
import type { GeneratedFranchise } from "@/lib/discover/taste-graph";

export function GenerationHistorySection({ history }: { history: GeneratedFranchise[] }) {
  if (history.length === 0) {
    return (
      <section className="glass-card rounded-2xl border border-chrono-border/30 p-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-chrono-primary" /> Generation History
        </h2>
        <p className="text-sm text-chrono-text-muted">
          Your last 5 generated watch orders will appear here once you generate one while logged in.
        </p>
      </section>
    );
  }

  return (
    <section className="glass-card rounded-2xl border border-chrono-border/30 p-6">
      <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-chrono-primary" /> Generation History
      </h2>
      <ul className="space-y-2">
        {history.map((entry, idx) => (
          <motion.li
            key={`${entry.anilistId}-${idx}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <a
              href={`/?q=${encodeURIComponent(entry.title)}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-chrono-border/20 bg-white/[0.02] px-4 py-3 hover:border-chrono-primary/40 hover:bg-white/[0.04] transition-all group"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate group-hover:text-chrono-primary transition-colors">
                  {entry.title}
                </p>
                <p className="text-[11px] text-chrono-text-dim mt-0.5">
                  {new Date(entry.generatedAt).toLocaleDateString(undefined, {
                    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                  })}
                  {entry.genres?.length > 0 && ` · ${entry.genres.slice(0, 3).join(" · ")}`}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-chrono-text-dim shrink-0 group-hover:text-chrono-primary transition-colors" />
            </a>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
