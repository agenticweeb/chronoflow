"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2, PlayCircle, Sparkles, Tv } from "lucide-react";
import { cn } from "@/lib/utils";

interface FranchiseData {
  franchiseId: string;
  anilistId: number;
  title: string;
  imageUrl: string;
  coverColor: string;
  totalWatched: number;
  totalEpisodes: number;
  watchedEntries: number;
  totalEntries: number;
  lastUpdated: string;
  startedAt: string;
}

interface Stats {
  totalFranchises: number;
  completedFranchises: number;
  totalEpisodesWatched: number;
  totalHoursInvested: number;
}

interface Props {
  franchises: FranchiseData[];
  userEmail: string;
  stats: Stats;
}

export function FranchisePassport({ franchises, userEmail, stats }: Props) {
  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-chrono-primary to-fuchsia-600 shadow-lg shadow-chrono-primary/25 mb-3">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Your Watch Journey
        </h1>
        <p className="text-sm text-chrono-text-muted">
          {userEmail}
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Tv className="w-4 h-4" />}
          value={stats.totalFranchises}
          label="Franchises Tracked"
          color="from-sky-500/10 to-blue-600/10 border-sky-500/20 text-sky-400"
        />
        <StatCard
          icon={<CheckCircle2 className="w-4 h-4" />}
          value={stats.completedFranchises}
          label="Completed"
          color="from-emerald-500/10 to-green-600/10 border-emerald-500/20 text-emerald-400"
        />
        <StatCard
          icon={<PlayCircle className="w-4 h-4" />}
          value={stats.totalEpisodesWatched}
          label="Episodes Watched"
          color="from-violet-500/10 to-purple-600/10 border-violet-500/20 text-violet-400"
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          value={`${stats.totalHoursInvested}h`}
          label="Time Invested"
          color="from-amber-500/10 to-orange-600/10 border-amber-500/20 text-amber-400"
        />
      </div>

      {/* Empty State */}
      {franchises.length === 0 ? (
        <div className="glass-card p-8 rounded-2xl text-center space-y-3 border border-chrono-border/30">
          <PlayCircle className="w-10 h-10 text-chrono-text-dim mx-auto" />
          <h3 className="text-lg font-bold text-white">No franchises tracked yet</h3>
          <p className="text-sm text-chrono-text-muted max-w-md mx-auto">
            Search for an anime and generate a watch order to start tracking your progress. Your journey will appear here.
          </p>
          <a
            href="/"
            className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-2.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Find Your First Anime
          </a>
        </div>
      ) : (
        /* Franchise Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {franchises.map((f, idx) => {
            const completionRate = f.totalEpisodes > 0
              ? Math.min(100, Math.round((f.totalWatched / f.totalEpisodes) * 100))
              : 0;
            const isComplete = completionRate === 100;

            return (
              <motion.div
                key={f.franchiseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card rounded-2xl overflow-hidden border border-chrono-border/30 hover:border-chrono-primary/40 transition-all group cursor-pointer"
                onClick={() => {
                  window.location.href = `/?q=${encodeURIComponent(f.title)}`;
                }}
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-chrono-surface">
                  {f.imageUrl ? (
                    <img
                      src={f.imageUrl}
                      alt={f.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: f.coverColor }}>
                      <span className="text-2xl font-black text-white/30">
                        {f.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {isComplete ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/80 text-white text-[10px] font-bold backdrop-blur-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        COMPLETED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/80 text-white text-[10px] font-bold backdrop-blur-sm">
                        <PlayCircle className="w-3 h-3" />
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-chrono-primary transition-colors truncate">
                    {f.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-chrono-text-dim">
                    <span>{f.totalEntries} entries</span>
                    <span>•</span>
                    <span>{f.totalWatched}/{f.totalEpisodes || "?"} eps</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-chrono-text-dim">
                      <span>Progress</span>
                      <span>{completionRate}%</span>
                    </div>
                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isComplete
                            ? "bg-gradient-to-r from-emerald-500 to-green-400"
                            : "bg-gradient-to-r from-chrono-primary to-chrono-accent"
                        )}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Last Updated */}
                  <p className="text-[10px] text-chrono-text-dim pt-1">
                    {f.lastUpdated
                      ? `Updated ${new Date(f.lastUpdated).toLocaleDateString()}`
                      : `Started ${new Date(f.startedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color: string }) {
  return (
    <div className={cn("glass-card p-4 rounded-xl border bg-gradient-to-br flex flex-col items-center gap-1", color)}>
      <div className="opacity-80">{icon}</div>
      <span className="text-xl font-extrabold text-white">{value}</span>
      <span className="text-[10px] text-chrono-text-dim uppercase tracking-wider font-semibold">{label}</span>
    </div>
  );
}
