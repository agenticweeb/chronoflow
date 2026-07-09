"use client";

import { useState, useCallback } from "react";
import { Sparkles, Loader2, Wand2, Github, ExternalLink, Star, MessageSquare, X, Send, CheckCircle2 } from "lucide-react";
import { AnimeSearchResult, UserPreferences } from "@/types";
import { useWatchOrder } from "@/hooks/useWatchOrder";
import { AnimeSearch } from "@/components/AnimeSearch";
import { PreferencePanel } from "@/components/PreferencePanel";
import { Flowchart } from "@/components/Flowchart";
import { cn } from "@/lib/utils";

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

const SUGGESTIONS = [
  {
    title: "Fate Series",
    malId: 10087,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx10087-COToXNo9X356.jpg",
    score: 8.3,
    tag: "Multiverse",
    tagColor: "badge-essential",
    desc: "3 parallel timelines, branching visual novel routes, and prequel structures with no defined official starting point.",
  },
  {
    title: "Monogatari Series",
    malId: 5081,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5081-N8Wv4SgY0v4A.jpg",
    score: 8.4,
    tag: "Non-Linear",
    tagColor: "badge-recommended",
    desc: "Over a dozen parts adapted completely out of chronological order by SHAFT. Heavy debate over Airing vs Novel order.",
  },
  {
    title: "The Melancholy of Haruhi Suzumiya",
    malId: 849,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx849-01pU9f2W9Xg0.png",
    score: 7.8,
    tag: "Time Loop",
    tagColor: "badge-optional",
    desc: "Aired intentionally out of order in 2006, then rebroadcast with the infamous 8-episode looping 'Endless Eight' arc.",
  },
  {
    title: "Steins;Gate",
    malId: 9253,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-7p9mDIn99YpS.jpg",
    score: 9.1,
    tag: "Time Travel",
    tagColor: "badge-essential",
    desc: "Watching chronologically requires you to pause at S1 Episode 22, watch Steins;Gate 0, then finish S1.",
  },
  {
    title: "Toaru Series",
    malId: 4654,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx4654-20R5gI6O5YfG.jpg",
    score: 7.4,
    tag: "Overlap",
    tagColor: "badge-recommended",
    desc: "Index, Railgun, and Accelerator overlap in Academy City during the same timeline. Crossovers happen mid-season.",
  },
  {
    title: "Neon Genesis Evangelion",
    malId: 30,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx30-gY7NGBYpM92N.png",
    score: 8.3,
    tag: "Alternate Reality",
    tagColor: "badge-skip",
    desc: "Unravel the abstract original TV finale, the legendary 'End of Evangelion' film, and the modern Rebuild tetralogy.",
  },
  {
    title: "Gundam (Universal Century)",
    malId: 80,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx80-gX7m4Q3O9u2G.jpg",
    score: 7.8,
    tag: "Decades-Long",
    tagColor: "badge-essential",
    desc: "Spanning over 40 years of media. Navigating the UC timeline involves jumping across decades of classic series and OVAs.",
  },
  {
    title: "Higurashi: When They Cry",
    malId: 934,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx934-8z7mN19P8w7F.png",
    score: 7.9,
    tag: "Mystery Loops",
    tagColor: "badge-recommended",
    desc: "A plot structured entirely around time loops. The reboots Gou/Sotsu turned out to be secret direct sequels.",
  },
  {
    title: "Kara no Kyoukai",
    malId: 3784,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx3784-y9hDNoZ6M9xN.jpg",
    score: 7.9,
    tag: "Anachronistic",
    tagColor: "badge-essential",
    desc: "This 8-movie series by ufotable was intentionally released out of order. Movie 2 is first, Movie 4 is second, Movie 1 is third.",
  },
  {
    title: "Durarara!! & Baccano!",
    malId: 6746,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx2151-MvNoYp9m9U2N.jpg",
    score: 8.1,
    tag: "Hyper-Ensemble",
    tagColor: "badge-optional",
    desc: "Dozens of characters with overlapping storylines. Baccano! cuts back and forth between three years simultaneously.",
  },
  {
    title: "Ghost in the Shell",
    malId: 43,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx43-qX7MNoP9C49N.jpg",
    score: 8.3,
    tag: "Parallel Timelines",
    tagColor: "badge-recommended",
    desc: "Splits into three entirely separate parallel timelines: the 1995 films, Stand Alone Complex, and Arise prequel/reboots.",
  },
  {
    title: "Legend of the Galactic Heroes",
    malId: 820,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx820-A8WvDNo6M9xN.jpg",
    score: 9.0,
    tag: "Space Opera",
    tagColor: "badge-essential",
    desc: "The massive 110-episode main OVA series is best started only after watching specific prequel movies first.",
  },
  {
    title: "Sailor Moon",
    malId: 530,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx530-t9eDNoP9XfGg.jpg",
    score: 7.7,
    tag: "Classic vs Remake",
    tagColor: "badge-skip",
    desc: "Choose between the 90s classic (hundreds of filler episodes and movies) and Sailor Moon Crystal (fast-paced canon reset).",
  },
  {
    title: "JoJo's Bizarre Adventure",
    malId: 14719,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx14719-gDToXNo8M8xN.jpg",
    score: 8.2,
    tag: "Generational",
    tagColor: "badge-recommended",
    desc: "Follows a linear family tree, but drastic shifts in art style, genre, protagonist, and setting often throw newcomers off.",
  },
  {
    title: "Final Fantasy VII Compilation",
    malId: 295,
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx295-pY7NNoG7O9gN.jpg",
    score: 7.4,
    tag: "Multimedia",
    tagColor: "badge-optional",
    desc: "Navigating across prequel OVAs, feature films, and video games just to gather a single cohesive plotline.",
  },
];

// Helper Component for Premium Image Fallback (Routed through wsrv.nl proxy)
function SuggestionCardImage({ src, alt, tag, tagColor }: { src: string; alt: string; tag: string; tagColor: string }) {
  const [error, setError] = useState(false);

  const initials = alt
    .split(/[\s:;!]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  // Route through proxy to prevent CDN 403 Forbidden referer blockages
  const proxiedUrl = src ? `https://wsrv.nl/?url=${encodeURIComponent(src.replace(/^https?:\/\//, ""))}` : "";

  return (
    <div className="relative h-44 w-full overflow-hidden bg-chrono-surface flex items-center justify-center">
      {!error && proxiedUrl ? (
        <img
          src={proxiedUrl}
          alt={alt}
          onError={() => setError(true)}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-chrono-surface via-chrono-surface-hover to-chrono-primary/20 flex flex-col items-center justify-center relative p-4 select-none text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0,transparent_100%)]" />
          <span className="text-4xl font-extrabold tracking-widest text-chrono-primary/40 animate-pulse">
            {initials}
          </span>
          <span className="text-[10px] font-semibold text-chrono-text-dim uppercase tracking-wider mt-2 group-hover:text-chrono-primary transition-colors truncate w-full px-2">
            {alt}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-chrono-surface via-chrono-surface/30 to-transparent pointer-events-none" />
      <span className={cn("absolute top-3 right-3 badge text-[10px] pointer-events-none", tagColor)}>
        {tag}
      </span>
    </div>
  );
}

export default function Home() {
  const [selectedAnime, setSelectedAnime] = useState<AnimeSearchResult | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const { result, loading, error, provider, latency, generate, reset } = useWatchOrder();

  // Feedback State
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"bug" | "suggestion">("suggestion");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackContact, setFeedbackContact] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSelectAnime = useCallback((anime: AnimeSearchResult | null) => {
    setSelectedAnime(anime);
    reset(); 
  }, [reset]);

  const handleGenerate = useCallback(async () => {
    if (!selectedAnime) return;
    await generate(selectedAnime.title, preferences);
  }, [selectedAnime, preferences, generate]);

  const handleReset = useCallback(() => {
    setSelectedAnime(null);
    setPreferences(DEFAULT_PREFERENCES);
    reset();
  }, [reset]);

  const handleSelectSuggestion = useCallback((suggestion: typeof SUGGESTIONS[0]) => {
    setSelectedAnime({
      malId: suggestion.malId,
      title: suggestion.title,
      type: "TV",
      imageUrl: suggestion.imageUrl,
      score: suggestion.score,
      synopsis: suggestion.desc,
      genres: [],
      status: "Finished Airing",
      isFranchise: true,
    });
    reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [reset]);

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

  const displayedSuggestions = showAllSuggestions ? SUGGESTIONS : SUGGESTIONS.slice(0, 6);

  return (
    <main className="min-h-screen bg-chrono-bg relative">
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
              href="https://github.com/agenticweeb/chronoflow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-chrono-text-muted hover:text-chrono-text transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
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
          <div className="max-w-2xl mx-auto mb-8 relative z-50">
            <AnimeSearch onSelect={handleSelectAnime} selectedAnime={selectedAnime} />
          </div>

          {/* Preferences */}
          {selectedAnime && !result && (
            <div className="max-w-2xl mx-auto mb-8 animate-slide-up relative z-40">
              <PreferencePanel preferences={preferences} onChange={setPreferences} />
            </div>
          )}

          {/* Generate Button */}
          {selectedAnime && !result && (
            <div className="max-w-2xl mx-auto text-center animate-slide-up relative z-30">
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
            <div className="max-w-2xl mx-auto mt-6 glass-card p-6 border-l-4 border-tier-skip animate-fade-in relative z-30">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-20">
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

      {/* Empty State / Interactive Suggestions */}
      {!selectedAnime && !result && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-0">
          
          {/* Interactive Suggestions Grid */}
          <div className="mb-16 animate-fade-in">
            <div className="text-center sm:text-left mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-chrono-text flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-5 h-5 text-chrono-accent animate-pulse" />
                Notoriously Confusing Watch Orders
              </h3>
              <p className="text-sm text-chrono-text-muted mt-1">
                Select a legendary franchise below to automatically load its profiles and explore your optimal watching path.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSuggestions.map((s) => (
                <div
                  key={s.title}
                  onClick={() => handleSelectSuggestion(s)}
                  className="glass-card group overflow-hidden cursor-pointer flex flex-col h-full border border-chrono-border/30 hover:border-chrono-primary/50 hover:shadow-lg hover:shadow-chrono-primary/10 transition-all duration-300 animate-slide-up"
                >
                  <SuggestionCardImage src={s.imageUrl} alt={s.title} tag={s.tag} tagColor={s.tagColor} />

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-chrono-surface/10">
                    <div>
                      <h4 className="font-bold text-chrono-text text-base leading-snug group-hover:text-chrono-primary transition-colors duration-200">
                        {s.title}
                      </h4>
                      <p className="text-xs text-chrono-text-muted mt-2 line-clamp-3 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-chrono-border/20 flex items-center justify-between text-xs text-chrono-text-dim">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-chrono-accent" />
                        MAL: {s.score.toFixed(1)}
                      </span>
                      <span className="text-chrono-primary group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-1 font-semibold">
                        Select Franchise →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Toggle Button for suggestions expand/collapse */}
            {SUGGESTIONS.length > 6 && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                  className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all duration-200 shadow-md shadow-black/40 hover:scale-[1.02]"
                >
                  {showAllSuggestions ? "Show Fewer Series" : `Show All ${SUGGESTIONS.length} Complex Timelines`}
                </button>
              </div>
            )}
          </div>

          {/* Sleeker Core Features Row */}
          <div className="border-t border-chrono-border/20 pt-16">
            <div className="text-center mb-10">
              <h3 className="text-lg font-bold text-chrono-text">The ChronoFlow Engine</h3>
              <p className="text-xs text-chrono-text-dim mt-1">Built specifically for the modern anime enthusiast.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: <Wand2 className="w-5 h-5" />,
                  title: "Any Anime",
                  desc: "From mainstream hits to obscure gems — AI maps the entire multiverse.",
                },
                {
                  icon: <Sparkles className="w-5 h-5" />,
                  title: "Smart Skip",
                  desc: "4-tier filler intelligence — categorizing essential, optional, and skippable content.",
                },
                {
                  icon: <ExternalLink className="w-5 h-5" />,
                  title: "Share Paths",
                  desc: "Generate custom sharing URLs. Keep friends and communities in sync effortlessly.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="glass-card p-6 text-center hover:bg-chrono-surface-hover/30 border border-chrono-border/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-chrono-primary/10 text-chrono-primary flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="font-semibold text-chrono-text text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-chrono-text-dim leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Collapsible Discord Suggestion/Feedback Box */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
        {feedbackOpen && (
          <div className="glass-card w-80 sm:w-96 p-5 mb-3 shadow-2xl animate-slide-up border border-chrono-border/40 bg-chrono-bg/95 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 border-b border-chrono-border/20 pb-2">
              <h4 className="font-bold text-chrono-text text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-chrono-primary" />
                Submit Feedback / Suggestion
              </h4>
              <button
                onClick={() => setFeedbackOpen(false)}
                className="text-chrono-text-dim hover:text-chrono-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="py-8 text-center flex flex-col items-center justify-center animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-chrono-accent animate-bounce mb-3" />
                <h5 className="font-semibold text-chrono-text text-sm">Feedback Sent Successfully!</h5>
                <p className="text-xs text-chrono-text-dim mt-1">Thank you for helping optimize ChronoFlow.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackType("suggestion")}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors",
                      feedbackType === "suggestion"
                        ? "bg-chrono-primary text-white"
                        : "bg-chrono-surface text-chrono-text-dim hover:bg-chrono-surface-hover"
                    )}
                  >
                    Feature Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackType("bug")}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors",
                      feedbackType === "bug"
                        ? "bg-tier-skip/30 text-tier-skip border border-tier-skip/50"
                        : "bg-chrono-surface text-chrono-text-dim hover:bg-chrono-surface-hover"
                    )}
                  >
                    Report Bug
                  </button>
                </div>

                <div>
                  <textarea
                    required
                    rows={3}
                    placeholder={
                      feedbackType === "bug"
                        ? "What went wrong? List any specific anime or issue..."
                        : "What features or adjustments would you love to see?"
                    }
                    value={feedbackMsg}
                    onChange={(e) => setFeedbackMsg(e.target.value)}
                    className="input-field w-full text-xs p-3 focus:ring-1 focus:ring-chrono-primary resize-none"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Your Discord username or email (Optional)"
                    value={feedbackContact}
                    onChange={(e) => setFeedbackContact(e.target.value)}
                    className="input-field w-full text-xs p-3"
                  />
                </div>

                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {feedbackSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send to Developer
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Floating trigger button */}
        <button
          onClick={() => setFeedbackOpen(!feedbackOpen)}
          className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 duration-200",
            feedbackOpen
              ? "bg-chrono-surface text-chrono-text border border-chrono-border"
              : "bg-chrono-primary text-white hover:bg-chrono-primary-hover shadow-chrono-primary/30 shadow-md"
          )}
        >
          {feedbackOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-chrono-border/20 bg-chrono-surface/10 py-12 relative z-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-chrono-primary to-chrono-accent flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-chrono-text text-sm">ChronoFlow</span>
            </div>
            <p className="text-xs text-chrono-text-dim leading-relaxed max-w-xs">
              Your anime journey, optimized. Mapping complex franchises with zero fluff and full schedule capabilities.
            </p>
          </div>

          {/* Col 2: Community & Retention */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-chrono-text-muted uppercase tracking-wider">Community</h4>
            <ul className="space-y-2 text-xs text-chrono-text-dim">
              <li>
                <a 
                  href="https://discord.gg/VQ344Fczc" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-chrono-primary transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
                  </svg>
                  <span>Discord Server</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://x.com/agenticweeb" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-chrono-primary transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Follow on X</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/agenticweeb" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-chrono-primary transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  <span>GitHub Profile</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Product Engine */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-chrono-text-muted uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs text-chrono-text-dim">
              <li>
                <a 
                  href="https://github.com/agenticweeb/chronoflow" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-chrono-text transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li className="text-[11px] text-chrono-text-muted select-none">
                ChronoCache TTL: 7 Days
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-chrono-border/10 text-center text-xs text-chrono-text-dim">
          ChronoFlow — Open Source • Free Forever
        </div>
      </footer>
    </main>
  );
}
