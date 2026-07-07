"use client";

import { useState, useCallback } from "react";
import { Sparkles, Loader2, Wand2, Github, ExternalLink } from "lucide-react";
import { AnimeSearchResult, UserPreferences, WatchOrderResult } from "@/types";
import { useWatchOrder } from "@/hooks/useWatchOrder";
import { AnimeSearch } from "@/components/AnimeSearch";
import { PreferencePanel } from "@/components/PreferencePanel";
import { Flowchart } from "@/components/Flowchart";

const DEFAULT_PREFERENCES: UserPreferences = {
  timeBudget: "binge",
  mood: ["all"],
  skipPreference: "smart-skip",
  includeMovies: true,
  includeOVAs: true,
  includeSpecials: true,
  includeRecaps: false,
  preferredPath: "optimal",
  language: "english",
};

export default function Home() {
  const [selectedAnime, setSelectedAnime] = useState<AnimeSearchResult | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const { result, loading, error, provider, latency, generate, reset } = useWatchOrder();

  const handleGenerate = useCallback(async () => {
    if (!selectedAnime) return;
    await generate(selectedAnime.title, preferences);
  }, [selectedAnime, preferences, generate]);

  const handleReset = useCallback(() => {
    setSelectedAnime(null);
    setPreferences(DEFAULT_PREFERENCES);
    reset();
  }, [reset]);

  return (
    <main className="min-h-screen bg-chrono-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-chrono-primary/10 via-transparent to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chrono-primary to-chrono-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-chrono-text">ChronoFlow</h1>
                <p className="text-xs text-chrono-text-dim">Your Anime Journey, Optimized</p>
              </div>
            </div>
            <a
              href="https://github.com/yourusername/chronoflow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-chrono-text-muted hover:text-chrono-text transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Star on GitHub</span>
            </a>
          </header>

          {/* Title */}
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-chrono-text mb-4">
              Never Watch Anime <span className="text-gradient">Wrong</span> Again
            </h2>
            <p className="text-lg text-chrono-text-muted max-w-2xl mx-auto">
              AI-powered watch order for any anime. Smart skip. Time-aware paths.
              From JoJo to Grand Blue Dreaming — we've got you covered.
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-8">
            <AnimeSearch onSelect={setSelectedAnime} selectedAnime={selectedAnime} />
          </div>

          {/* Preferences */}
          {selectedAnime && !result && (
            <div className="max-w-2xl mx-auto mb-8 animate-slide-up">
              <PreferencePanel preferences={preferences} onChange={setPreferences} />
            </div>
          )}

          {/* Generate Button */}
          {selectedAnime && !result && (
            <div className="max-w-2xl mx-auto text-center animate-slide-up">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your path...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Watch Order
                  </>
                )}
              </button>
              {provider && latency && (
                <p className="text-xs text-chrono-text-dim mt-3">
                  Powered by {provider} • {latency}ms
                </p>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="max-w-2xl mx-auto mt-6 glass-card p-6 border-l-4 border-tier-skip animate-fade-in">
              <h3 className="font-semibold text-tier-skip mb-2">Generation Failed</h3>
              <p className="text-chrono-text-muted text-sm">{error}</p>
              <div className="flex gap-3 mt-4">
                <button onClick={handleGenerate} className="btn-primary text-sm">
                  Retry
                </button>
                <button onClick={handleReset} className="btn-secondary text-sm">
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                reset();
                setSelectedAnime(null);
              }}
              className="btn-secondary text-sm"
            >
              ← New Search
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-chrono-text-muted hover:text-chrono-text transition-colors"
            >
              Reset All
            </button>
          </div>
          <Flowchart result={result} />
        </div>
      )}

      {/* Empty State / Features */}
      {!selectedAnime && !result && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            {[
              {
                icon: <Wand2 className="w-6 h-6" />,
                title: "Any Anime",
                desc: "From mainstream hits to obscure gems — AI knows them all",
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "Smart Skip",
                desc: "4-tier filler intelligence — not just skip/don't skip",
              },
              {
                icon: <ExternalLink className="w-6 h-6" />,
                title: "Share Paths",
                desc: "Generate links for friends — watch together, stay in sync",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-6 text-center hover:bg-chrono-surface-hover transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-chrono-primary/10 text-chrono-primary flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-chrono-text mb-2">{feature.title}</h3>
                <p className="text-sm text-chrono-text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-chrono-border/30 py-8 text-center">
        <p className="text-sm text-chrono-text-dim">
          ChronoFlow — Built with Next.js, Tailwind, and AI • Free forever
        </p>
      </footer>
    </main>
  );
}
