"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  Loader2,
  Wand2,
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  Star,
  Clock,
  Eye,
  Map,
} from "lucide-react";
import { AnimeSearchResult, UserPreferences } from "@/types";
import { useWatchOrder } from "@/hooks/useWatchOrder";
import { AnimeSearch } from "@/components/AnimeSearch";
import { PreferencePanel } from "@/components/PreferencePanel";
import { Flowchart as FlowchartLegacy } from "@/components/Flowchart";
import FlowchartV2 from "@/components/FlowchartV2";
import { cn } from "@/lib/utils";
import { SuggestionImage } from "@/components/SuggestionImage";

const DEFAULT_PREFERENCES: UserPreferences = {
  timeBudget: "regular",
  mood: ["all"],
  skipPreference: "smart-skip",
  includeMovies: true,
  includeOVAs: true,
  includeSpecials: true,
  includeRecaps: false,
  preferredPath: "optimal",
  language: "english",
};

const SUGGESTIONS = [
  {
    title: "Fate Series",
    malId: 10087,
    anilistId: 10087,
    imageUrl: "/suggestions/fate.jpg",
    score: 8.3,
    tag: "Multiverse",
    desc: "Routes are parallel realities, not sequels. Zero spoils Stay Night if watched first.",
  },
  {
    title: "Monogatari Series",
    malId: 5081,
    anilistId: 5081,
    imageUrl: "/suggestions/monogatari.jpeg",
    score: 8.4,
    tag: "Non-Linear",
    desc: "Adapted out of novel order. Release vs chronological is a real debate.",
  },
  {
    title: "Steins;Gate",
    malId: 9253,
    anilistId: 9253,
    imageUrl: "/suggestions/Steins;Gate.jpeg",
    score: 9.1,
    tag: "Time Travel",
    desc: "Pause at S1 ep 22 → watch 0 → finish S1. Routes are not linear sequels.",
  },
  {
    title: "Neon Genesis Evangelion",
    malId: 30,
    anilistId: 30,
    imageUrl: "/suggestions/Neon Genesis Evangelion.jpeg",
    score: 8.3,
    tag: "Alt Reality",
    desc: "TV ending, End of Evangelion, and Rebuilds — three ways to close the loop.",
  },
  {
    title: "Gundam (Universal Century)",
    malId: 80,
    anilistId: 80,
    imageUrl: "/suggestions/Gundam (Universal Century).jpeg",
    score: 7.8,
    tag: "Decades",
    desc: "40+ years of UC media. Jump carefully or get lost in alternate timelines.",
  },
  {
    title: "JoJo's Bizarre Adventure",
    malId: 14719,
    anilistId: 14719,
    imageUrl: "/suggestions/JoJo's Bizarre Adventure.jpeg",
    score: 8.2,
    tag: "Generational",
    desc: "Linear family saga, but each Part shifts art, genre, and protagonist hard.",
  },
  {
    title: "Higurashi: When They Cry",
    malId: 934,
    anilistId: 934,
    imageUrl: "/suggestions/Higurashi_ When They Cry.jpeg",
    score: 7.9,
    tag: "Loops",
    desc: "Built on loops. Gou/Sotsu are secret sequels, not remakes.",
  },
  {
    title: "Kara no Kyoukai",
    malId: 3784,
    anilistId: 3784,
    imageUrl: "/suggestions/Kara no Kyoukai.jpeg",
    score: 7.9,
    tag: "Anachronistic",
    desc: "Eight movies released out of story order on purpose.",
  },
  {
    title: "Toaru Series",
    malId: 4654,
    anilistId: 4654,
    imageUrl: "/suggestions/Toaru Series.jpeg",
    score: 7.4,
    tag: "Overlap",
    desc: "Index, Railgun, Accelerator share Academy City and cross mid-season.",
  },
  {
    title: "Ghost in the Shell",
    malId: 43,
    anilistId: 43,
    imageUrl: "/suggestions/Ghost in the Shell.jpeg",
    score: 8.3,
    tag: "Parallel",
    desc: "Films, SAC, and Arise are separate continuities — pick a lane.",
  },
  {
    title: "Legend of the Galactic Heroes",
    malId: 820,
    anilistId: 820,
    imageUrl: "/suggestions/Legend of the Galactic Heroes.jpeg",
    score: 9.0,
    tag: "Space Opera",
    desc: "Massive OVA — best after specific prequel movies.",
  },
  {
    title: "Sailor Moon",
    malId: 530,
    anilistId: 530,
    imageUrl: "/suggestions/Sailor Moon.jpeg",
    score: 7.7,
    tag: "Remake",
    desc: "90s classic (filler heavy) vs Crystal (tight canon reset).",
  },
  {
    title: "The Melancholy of Haruhi Suzumiya",
    malId: 849,
    anilistId: 849,
    imageUrl: "/suggestions/The Melancholy of Haruhi Suzumiya.jpeg",
    score: 7.8,
    tag: "Time Loop",
    desc: "Aired out of order. Endless Eight loops eight times for a reason.",
  },
  {
    title: "Durarara!! & Baccano!",
    malId: 6746,
    anilistId: 6746,
    imageUrl: "/suggestions/Durarara!! & Baccano!.jpeg",
    score: 8.1,
    tag: "Ensemble",
    desc: "Overlapping timelines and character webs — not a simple A→B path.",
  },
];

export default function Home() {
  const [selectedAnime, setSelectedAnime] =
    useState<AnimeSearchResult | null>(null);
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const { result, resultV2, loading, error, provider, latency, generate, reset } =
    useWatchOrder();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"bug" | "suggestion">(
    "suggestion"
  );
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackContact, setFeedbackContact] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSelectAnime = useCallback(
    (anime: AnimeSearchResult | null) => {
      setSelectedAnime(anime);
      reset();
    },
    [reset]
  );

  const handleGenerate = useCallback(async () => {
    if (!selectedAnime) return;
    // Always franchise generate; IDs from the selected search result
    await generate(selectedAnime.title, preferences, selectedAnime);
  }, [selectedAnime, preferences, generate]);

  const handleReset = useCallback(() => {
    setSelectedAnime(null);
    setPreferences(DEFAULT_PREFERENCES);
    reset();
  }, [reset]);

  const handleSelectSuggestion = useCallback(
    (s: (typeof SUGGESTIONS)[0]) => {
      setSelectedAnime({
        malId: s.malId,
        anilistId: s.anilistId,
        title: s.title,
        type: "TV",
        imageUrl: s.imageUrl,
        score: s.score,
        synopsis: s.desc,
        genres: [],
        status: "Finished Airing",
        isFranchise: true,
      } as any);
      reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [reset]
  );

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    setFeedbackSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackType,
          message: feedbackMsg,
          contact: feedbackContact,
          context: selectedAnime?.title || "General",
        }),
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
        setFeedbackMsg("");
        setFeedbackContact("");
        setTimeout(() => {
          setFeedbackSubmitted(false);
          setFeedbackOpen(false);
        }, 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const displayedSuggestions = showAllSuggestions
    ? SUGGESTIONS
    : SUGGESTIONS.slice(0, 6);

  const hasV2 = !!(resultV2 || (result as any)?.paths?.[0]?.groups);
  const v2Data = resultV2 || (hasV2 ? result : null);
  const legacyData = !hasV2 ? result : null;
  const showResults = !!(result || resultV2);
  const showPrefs = !!selectedAnime && !showResults && !loading;

  return (
    <main className="min-h-screen bg-chrono-bg relative overflow-x-hidden">
      {/* Atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-chrono-primary/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-chrono-accent/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chrono-primary to-fuchsia-600 flex items-center justify-center shadow-lg shadow-chrono-primary/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-chrono-text tracking-tight">
                ChronoFlow
              </h1>
              <p className="text-[11px] text-chrono-text-dim">
                Watch order without spoilers or wasted time
              </p>
            </div>
          </div>
          <a
            href="https://github.com/agenticweeb/chronoflow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-chrono-text-muted hover:text-chrono-text transition-colors"
          >
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
            <span className="hidden sm:inline">Star on GitHub</span>
          </a>
        </header>

        {!showResults && (
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-chrono-text mb-3 tracking-tight">
              Never watch{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300">
                wrong
              </span>{" "}
              again
            </h2>
            <p className="text-base sm:text-lg text-chrono-text-muted max-w-2xl mx-auto leading-relaxed">
              Search any anime. Get a spoiler-safe path, smart skips, and a
              finish date for your real daily pace — from Fate multiverse to
              filler long-runners.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
              {[
                {
                  title: "Anime-native canon logic",
                  desc: "Order movies, OVAs, remakes, and routes with franchise-level awareness.",
                },
                {
                  title: "Long-runner safe",
                  desc: "One Piece, Naruto, Hunter x Hunter and other huge sagas get pacing, skip guidance, and core path clarity.",
                },
                {
                  title: "Immersive watch paths",
                  desc: "Hero banners, story notes, and path recommendations for every anime shape.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="glass-card p-4 border border-chrono-border/30 bg-chrono-surface/80"
                >
                  <h3 className="text-sm font-semibold text-chrono-text">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-chrono-text-dim mt-2 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-6 relative z-50">
          <AnimeSearch
            onSelect={handleSelectAnime}
            selectedAnime={selectedAnime}
          />
          {selectedAnime && !showResults && (
            <p className="mt-2 text-[11px] text-chrono-text-dim text-center">
              Selected{" "}
              <span className="text-chrono-text-muted font-medium">
                {selectedAnime.title}
              </span>
              {(selectedAnime as any).anilistId || selectedAnime.malId ? (
                <span>
                  {" "}
                  · ID{" "}
                  {(selectedAnime as any).anilistId || selectedAnime.malId}
                </span>
              ) : null}
              {" "}
              · Generate builds the full franchise path
            </p>
          )}
        </div>

        {/* Preferences */}
        {showPrefs && (
          <div className="max-w-2xl mx-auto mb-6 animate-slide-up relative z-40">
            <PreferencePanel
              preferences={preferences}
              onChange={setPreferences}
            />
          </div>
        )}

        {/* Generate */}
        {selectedAnime && !showResults && (
          <div className="max-w-2xl mx-auto text-center animate-slide-up relative z-30 mb-8">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary text-base sm:text-lg px-8 py-4 inline-flex items-center gap-3 shadow-xl shadow-chrono-primary/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mapping your path…
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate watch order
                </>
              )}
            </button>
            {loading && (
              <p className="text-xs text-chrono-text-dim mt-3">
                Grounding relation graph → classifying shape → ordering titles
              </p>
            )}
            {provider && latency && !loading && (
              <p className="text-xs text-chrono-text-dim mt-3">
                via {provider} · {latency}ms
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-4 glass-card p-5 border-l-4 border-rose-500 animate-fade-in relative z-30">
            <h3 className="font-semibold text-rose-400 mb-1">
              Generation failed
            </h3>
            <p className="text-chrono-text-muted text-sm">{error}</p>
            <div className="flex gap-3 mt-4">
              <button onClick={handleGenerate} className="btn-primary text-sm">
                Retry
              </button>
              <button onClick={handleReset} className="btn-secondary text-sm">
                Start over
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {showResults && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-20">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => {
                reset();
                setSelectedAnime(null);
              }}
              className="btn-secondary text-sm"
            >
              ← New search
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-chrono-text-muted hover:text-chrono-text transition-colors"
            >
              Reset all
            </button>
          </div>

          {hasV2 && v2Data ? (
            <FlowchartV2
              data={v2Data}
              timeBudget={preferences.timeBudget}
            />
          ) : legacyData ? (
            <FlowchartLegacy result={legacyData} />
          ) : null}
        </div>
      )}

      {/* Empty landing */}
      {!selectedAnime && !showResults && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">
            {[
              {
                icon: <Map className="w-4 h-4" />,
                title: "Spoiler-safe paths",
                desc: "Optimal order preserves reveals. Chronological when you want lore.",
              },
              {
                icon: <Eye className="w-4 h-4" />,
                title: "Smart skip",
                desc: "Keep story, skip pure filler & recaps. Canon-only when you want ruthless.",
              },
              {
                icon: <Clock className="w-4 h-4" />,
                title: "Real finish dates",
                desc: "Casual → Binge paces. Exact minutes, not rounded fluff.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="glass-card p-4 border border-chrono-border/30 flex gap-3 items-start"
              >
                <div className="w-9 h-9 rounded-lg bg-chrono-primary/15 text-chrono-primary flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-chrono-text">
                    {f.title}
                  </h4>
                  <p className="text-[11px] text-chrono-text-dim mt-0.5 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-14">
            <div className="text-center sm:text-left mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-chrono-text flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-5 h-5 text-chrono-accent" />
                Notoriously confusing — solved
              </h3>
              <p className="text-sm text-chrono-text-muted mt-1">
                Pick a franchise. Set how you watch. Generate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedSuggestions.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="glass-card group overflow-hidden text-left flex flex-col h-full border border-chrono-border/30 hover:border-chrono-primary/50 hover:shadow-lg hover:shadow-chrono-primary/10 transition-all duration-300"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-chrono-surface">
                    <SuggestionImage
                      src={s.imageUrl}
                      alt={s.title}
                      franchise={s.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-violet-200 border border-violet-500/30 backdrop-blur-sm">
                      {s.tag}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-chrono-text text-sm group-hover:text-chrono-primary transition-colors">
                        {s.title}
                      </h4>
                      <p className="text-xs text-chrono-text-muted mt-1.5 line-clamp-3 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-chrono-border/20 flex items-center justify-between text-xs text-chrono-text-dim">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-chrono-accent" />
                        {s.score.toFixed(1)}
                      </span>
                      <span className="text-chrono-primary font-semibold group-hover:translate-x-0.5 transition-transform">
                        Start →
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {SUGGESTIONS.length > 6 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                  className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
                >
                  {showAllSuggestions
                    ? "Show fewer"
                    : `Show all ${SUGGESTIONS.length}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
        {feedbackOpen && (
          <div className="glass-card w-80 sm:w-96 p-5 mb-3 shadow-2xl animate-slide-up border border-chrono-border/40 bg-chrono-bg/95 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 border-b border-chrono-border/20 pb-2">
              <h4 className="font-bold text-chrono-text text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-chrono-primary" />
                Feedback
              </h4>
              <button
                onClick={() => setFeedbackOpen(false)}
                className="text-chrono-text-dim hover:text-chrono-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {feedbackSubmitted ? (
              <div className="py-8 text-center flex flex-col items-center">
                <CheckCircle2 className="w-10 h-10 text-chrono-accent mb-3" />
                <h5 className="font-semibold text-chrono-text text-sm">
                  Sent!
                </h5>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackType("suggestion")}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-semibold rounded-md",
                      feedbackType === "suggestion"
                        ? "bg-chrono-primary text-white"
                        : "bg-chrono-surface text-chrono-text-dim"
                    )}
                  >
                    Feature
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackType("bug")}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-semibold rounded-md",
                      feedbackType === "bug"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-chrono-surface text-chrono-text-dim"
                    )}
                  >
                    Bug
                  </button>
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder={
                    feedbackType === "bug"
                      ? "What went wrong?"
                      : "What would you love?"
                  }
                  value={feedbackMsg}
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                  className="input-field w-full text-xs p-3 resize-none"
                />
                <input
                  type="text"
                  placeholder="Discord or email (optional)"
                  value={feedbackContact}
                  onChange={(e) => setFeedbackContact(e.target.value)}
                  className="input-field w-full text-xs p-3"
                />
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {feedbackSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Send
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
        <button
          onClick={() => setFeedbackOpen(!feedbackOpen)}
          className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105",
            feedbackOpen
              ? "bg-chrono-surface text-chrono-text border border-chrono-border"
              : "bg-chrono-primary text-white shadow-chrono-primary/30"
          )}
        >
          {feedbackOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <MessageSquare className="w-5 h-5" />
          )}
        </button>
      </div>

      <footer className="border-t border-chrono-border/20 bg-chrono-surface/10 py-10 relative z-0">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-chrono-text-dim space-y-2">
          <p className="font-semibold text-chrono-text-muted">
            ChronoFlow — grounded watch orders for real anime fans
          </p>
          <p>
            Search → set how you watch → generate → pick a path → focus any
            season → finish date for your pace
          </p>
          <p className="pt-2">
            <a
              href="https://github.com/agenticweeb/chronoflow"
              className="hover:text-chrono-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            {" · "}
            <a
              href="https://x.com/agenticweeb"
              className="hover:text-chrono-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              @agenticweeb
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
