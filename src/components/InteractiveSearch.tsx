"use client";

import React, { 
  useState, 
  useTransition, 
  useDeferredValue, 
  useEffect, 
  useCallback, 
  useId, 
  useRef, 
  useMemo 
} from "react";
import {
  AlertTriangle,
  Clock,
  Eye,
  Loader2,
  Map,
  RotateCcw,
  Search,
  Sparkles,
  X,
  Compass,
  LayoutGrid,
  List,
  Check,
  Star,
  SlidersHorizontal,
  Send,
  MessageSquare,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { generateWatchOrderAction, searchAnimeAction, discoverAnimeAction } from "@/app/actions";
import { PreferencePanel } from "@/components/PreferencePanel";
import { SuggestionImage } from "@/components/SuggestionImage";
import { VisualFlowchart } from "@/components/VisualFlowchart";
import { cn } from "@/lib/utils";
import type { AnimeSearchResult, UserPreferences } from "@/types";
import type { WatchOrderResultV2, CustomSchedule } from "@/types/intelligent";

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
  paceType: "duration",
  episodesPerDay: 2,
};

const SUGGESTIONS = [
  { title: "Fate Series", malId: 10087, anilistId: 10087, imageUrl: "/suggestions/fate.jpg", score: 8.3, tag: "Multiverse", desc: "Routes are parallel realities, not sequels." },
  { title: "Monogatari Series", malId: 5081, anilistId: 5081, imageUrl: "/suggestions/monogatari.jpeg", score: 8.4, tag: "Non-Linear", desc: "Release vs chronological is a real debate." },
  { title: "Steins;Gate", malId: 9253, anilistId: 9253, imageUrl: "/suggestions/Steins;Gate.jpeg", score: 9.1, tag: "Time Travel", desc: "Routes are not linear sequels." },
  { title: "JoJo's Bizarre Adventure", malId: 14719, anilistId: 14719, imageUrl: "/suggestions/JoJo's Bizarre Adventure.jpeg", score: 8.2, tag: "Generational", desc: "Each Part shifts art, genre, and protagonist." },
  { title: "Neon Genesis Evangelion", malId: 30, anilistId: 30, imageUrl: "/suggestions/Neon Genesis Evangelion.jpeg", score: 8.3, tag: "Alt Reality", desc: "TV, End of Eva, and Rebuilds — three endings." },
  { title: "Gundam (Universal Century)", malId: 80, anilistId: 80, imageUrl: "/suggestions/Gundam (Universal Century).jpeg", score: 7.8, tag: "Decades", desc: "40+ years of UC media. Jump carefully." },
] as const;

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Mystery", "Psychological", "Romance", "Sci-Fi", "Supernatural", "Thriller"];

const GENERATION_STAGES = [
  { step: "01/05", label: "Querying AniList & Jikan Graph nodes..." },
  { step: "02/05", label: "Resolving recursive light-novel crossover leaks..." },
  { step: "03/05", label: "Classifying anime shapes & branching routes..." },
  { step: "04/05", label: "Synthesizing optimal path & smart-skip timelines..." },
  { step: "05/05", label: "Validating structural hashes against grounded DB IDs..." },
];

const LANGUAGES = [
  { code: "All", label: "Any Origin" },
  { code: "JP", label: "Japanese (Anime)" },
  { code: "CN", label: "Chinese (Donghua)" },
  { code: "KR", label: "Korean (Hanguk)" },
  { code: "US", label: "English (US/Global)" },
  { code: "FR", label: "French (Co-productions)" },
];

export function InteractiveSearch() {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<"builder" | "discover">("builder");

  // Search Core States
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [searching, startSearch] = useTransition();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  // Generator States
  const [selected, setSelected] = useState<AnimeSearchResult | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [generating, startGenerating] = useTransition();
  const [currentStage, setCurrentStage] = useState(0);
  const [finalData, setFinalData] = useState<WatchOrderResultV2 | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  // Discover Filters State (Multi-genre array instead of single string)
  const [discoverLayout, setDiscoverLayout] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"popularity" | "score" | "title" | "underrated">("popularity");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]); // Multi-select array
  const [minRating, setMinRating] = useState<number>(0); // Star value selector (0 to 10)
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedLang, setSelectedYearLang] = useState<string>("All"); // Language matrix
  const [showFilters, setShowFilters] = useState(true); // Default open

  // Discover Results Streaming States
  const [discoverList, setDiscoverList] = useState<AnimeSearchResult[]>([]);
  const [discoverLoading, startDiscoverQuery] = useTransition();

  // Feedback State
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"bug" | "suggestion">("suggestion");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackContact, setFeedbackContact] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Sync stage steps during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generating) {
      setCurrentStage(0);
      interval = setInterval(() => {
        setCurrentStage((prev) => (prev < GENERATION_STAGES.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [generating]);

  // Query database dynamically as user types
  useEffect(() => {
    if (deferredQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    startSearch(async () => {
      const res = await searchAnimeAction(deferredQuery.trim());
      if (res.success) {
        setResults(res.data);
        setDropdownOpen(true);
        setHighlight(0);
      } else {
        setResults([]);
      }
    });
  }, [deferredQuery]);

  // DYNAMIC COMPILATION STREAMING: Query AniList based on Discover filters
  useEffect(() => {
    if (activeTab !== "discover") return;

    startDiscoverQuery(async () => {
      const res = await discoverAnimeAction({
        genres: selectedGenres,
        minRating,
        yearEra: selectedYear,
        sortBy,
        language: selectedLang,
      });
      if (res.success && res.data) {
        setDiscoverList(res.data);
      } else {
        setDiscoverList([]);
      }
    });
  }, [activeTab, selectedGenres, minRating, selectedYear, sortBy, selectedLang]);

  const handleSelect = useCallback((anime: AnimeSearchResult) => {
    setSelected(anime);
    setQuery("");
    setResults([]);
    setDropdownOpen(false);
    setFinalData(null);
    setError(null);
    setProvider(null);
    setLatency(null);
  }, []);

  const handleSelectSuggestion = useCallback((s: typeof SUGGESTIONS[number] | AnimeSearchResult) => {
    const item = s as any; // Cast as any to bypass strict union property checking
    handleSelect({
      malId: item.malId,
      anilistId: item.anilistId,
      title: item.title,
      type: "TV",
      imageUrl: item.imageUrl,
      score: item.score,
      synopsis: item.synopsis || item.desc || "",
      genres: [],
      status: item.status || "Finished Airing",
      isFranchise: true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [handleSelect]);

  const handleGenerate = useCallback(() => {
    if (!selected) return;
    startGenerating(async () => {
      setError(null);
      const startTime = Date.now();

      const actionPromise = generateWatchOrderAction({
        animeName: selected.title,
        anilistId: selected.anilistId,
        malId: selected.malId || undefined,
        scope: "franchise",
        preferences: {
          timeBudget: preferences.timeBudget,
          mood: preferences.mood,
          skipPreference: preferences.skipPreference,
          includeMovies: preferences.includeMovies,
          includeOVAs: preferences.includeOVAs,
          includeSpecials: preferences.includeSpecials,
          includeRecaps: preferences.includeRecaps,
          preferredPath: preferences.preferredPath,
          language: preferences.language,
          customSchedule: preferences.customSchedule,
        },
      });

      const delayPromise = new Promise((resolve) => setTimeout(resolve, 3500));
      const [res] = await Promise.all([actionPromise, delayPromise]);

      if (res.success && res.data) {
        setFinalData(res.data.dataV2);
        setProvider(res.data.provider);
        setLatency(Date.now() - startTime);
      } else {
        setError(res.error || "Generation execution failed");
      }
    });
  }, [selected, preferences]);

  const handleReset = useCallback(() => {
    setSelected(null);
    setFinalData(null);
    setQuery("");
    setError(null);
    setProvider(null);
    setLatency(null);
    setPreferences(DEFAULT_PREFERENCES);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen || results.length === 0) {
      if (e.key === "Escape") setDropdownOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = results[highlight] ?? results[0];
      if (pick) handleSelect(pick);
    } else if (e.key === "Escape") {
      setDropdownOpen(false);
    }
  };

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
          context: selected?.title || finalData?.franchise || "General",
        }),
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
        setFeedbackMsg("");
        setFeedbackContact("");
        setTimeout(() => {
          setFeedbackSubmitted(false);
          setFeedbackOpen(false);
        }, 2200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleGenreToggle = (genre: string) => {
    if (genre === "All") {
      setSelectedGenres([]);
      return;
    }
    setSelectedGenres((prev) => {
      const current = prev.filter((g) => g !== "All");
      if (current.includes(genre)) {
        return current.filter((g) => g !== genre);
      } else {
        return [...current, genre];
      }
    });
  };

  const displayedSuggestions = showAllSuggestions ? SUGGESTIONS : SUGGESTIONS.slice(0, 6);

  return (
    <div className="space-y-8 w-full relative">
      {/* Tabs Selector */}
      {!selected && !finalData && (
        <div className="flex justify-center border-b border-chrono-border/20 max-w-md mx-auto relative z-50">
          <button
            type="button"
            onClick={() => setActiveTab("builder")}
            className={cn(
              "flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer",
              activeTab === "builder"
                ? "border-chrono-primary text-chrono-primary"
                : "border-transparent text-chrono-text-dim hover:text-chrono-text"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Find Your Path
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("discover")}
            className={cn(
              "flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer",
              activeTab === "discover"
                ? "border-chrono-primary text-chrono-primary"
                : "border-transparent text-chrono-text-dim hover:text-chrono-text"
            )}
          >
            <Compass className="w-4 h-4" />
            Discover Library
          </button>
        </div>
      )}

      {/* Tab 1 Search Stage */}
      {activeTab === "builder" && !selected && !finalData && (
        <div className="relative max-w-2xl mx-auto w-full z-50 animate-fade-in">
          <label htmlFor="chrono-search" className="sr-only">Search any anime title</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chrono-text-dim pointer-events-none" />
            <input
              ref={inputRef}
              id="chrono-search"
              type="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="Search any anime — Fate, JoJo, Re:Zero, One Piece…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (results.length > 0) setDropdownOpen(true); }}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-expanded={dropdownOpen && results.length > 0}
              aria-controls={listboxId}
              className="input-field w-full pl-12 pr-12 py-4 text-base sm:text-lg font-medium shadow-2xl shadow-black/40"
            />
            {searching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chrono-primary animate-spin" />
            )}
            {query && !searching && (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-chrono-text-dim hover:text-chrono-text"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {dropdownOpen && results.length > 0 && (
            <ul id={listboxId} role="listbox" className="absolute top-[calc(100%+0.5rem)] left-0 right-0 glass-card rounded-2xl overflow-hidden shadow-2xl z-[70] max-h-96 overflow-y-auto p-1.5">
              {results.map((item, i) => (
                <li key={`${item.anilistId}-${i}`} role="presentation">
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-14 rounded-md overflow-hidden bg-chrono-surface border border-white/5 shrink-0">
                      <SuggestionImage src={item.imageUrl} alt="" franchise={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-white block truncate">{item.title}</span>
                      <p className="text-xs text-chrono-text-dim mt-1">★ {item.score.toFixed(1)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Tab 2 Discover Stage with IMDb-Grade Filter controls */}
      {activeTab === "discover" && !selected && !finalData && (
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in relative z-50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-chrono-surface/30 p-4 rounded-2xl border border-chrono-border/10">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary py-2.5 px-4 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-chrono-primary" />
              <span>{showFilters ? "Hide Dynamic Filters" : "Show Deep Filters"}</span>
            </button>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-chrono-surface border border-chrono-border text-chrono-text text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-chrono-primary cursor-pointer font-bold"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="score">Sort by Score</option>
                <option value="underrated">Sort by Underrated Gems ★</option>
                <option value="title">Sort by Title</option>
              </select>

              <div className="flex items-center rounded-xl bg-chrono-surface border border-chrono-border p-1">
                <button
                  type="button"
                  onClick={() => setDiscoverLayout("grid")}
                  className={cn("p-1.5 rounded-lg transition-colors cursor-pointer", discoverLayout === "grid" ? "bg-chrono-primary/20 text-chrono-primary" : "text-chrono-text-dim hover:text-chrono-text")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDiscoverLayout("list")}
                  className={cn("p-1.5 rounded-lg transition-colors cursor-pointer", discoverLayout === "list" ? "bg-chrono-primary/20 text-chrono-primary" : "text-chrono-text-dim hover:text-chrono-text")}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border border-chrono-border/20">
                  {/* Genre multi-select selector (IMDb style) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-chrono-text-muted uppercase tracking-wider block">Genres (Multi-select)</label>
                    <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                      <button
                        type="button"
                        onClick={() => handleGenreToggle("All")}
                        className={cn("px-2.5 py-1 text-xs rounded-full border cursor-pointer", selectedGenres.length === 0 ? "bg-chrono-primary/20 border-chrono-primary text-chrono-primary font-bold" : "bg-black/10 border-chrono-border text-chrono-text-dim")}
                      >
                        All
                      </button>
                      {GENRES.map((g) => {
                        const isSelected = selectedGenres.includes(g);
                        return (
                          <button
                            type="button"
                            key={g}
                            onClick={() => handleGenreToggle(g)}
                            className={cn("px-2.5 py-1 text-xs rounded-full border cursor-pointer transition-all", isSelected ? "bg-chrono-primary/20 border-chrono-primary text-chrono-primary font-bold shadow-lg shadow-chrono-primary/5" : "bg-black/10 border-chrono-border text-chrono-text-dim")}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Discrete Star selector (IMDb style) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#f1f0f7] uppercase tracking-wider block">Minimum Rating</label>
                    <div className="flex flex-wrap gap-1 max-h-44 overflow-y-auto">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => {
                        const isSelected = minRating === rating;
                        return (
                          <button
                            type="button"
                            key={rating}
                            onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                            className={cn(
                              "px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all cursor-pointer",
                              isSelected
                                ? "bg-chrono-accent/20 border-chrono-accent text-chrono-accent shadow-lg shadow-chrono-accent/10 font-extrabold"
                                : "bg-black/10 border-chrono-border text-chrono-text-dim hover:text-chrono-text"
                            )}
                          >
                            <Star className={cn("w-3 h-3 shrink-0", isSelected ? "fill-chrono-accent text-chrono-accent animate-pulse" : "text-chrono-text-dim")} />
                            <span>{rating}★+</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Era Selector & Language Selection Matrix */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-chrono-text-muted uppercase tracking-wider block">Production Era / Year</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="bg-chrono-surface border border-chrono-border text-chrono-text text-xs rounded-xl w-full p-2.5 cursor-pointer font-semibold"
                      >
                        <option value="All">All Years</option>
                        <option value="2020s">Modern Era (2020s)</option>
                        <option value="2010s">Era Golden (2010s)</option>
                        <option value="2000s">Classic Era (2000s)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-chrono-text-muted uppercase tracking-wider block">Original Language (Origin)</label>
                      <select
                        value={selectedLang}
                        onChange={(e) => setSelectedYearLang(e.target.value)}
                        className="bg-chrono-surface border border-chrono-border text-chrono-text text-xs rounded-xl w-full p-2.5 cursor-pointer font-semibold"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Shimmering Skeletons */}
          {discoverLoading ? (
            <div className={cn(discoverLayout === "grid" ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "space-y-2")}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={cn("skeleton h-44 border border-chrono-border/10 shadow-lg", discoverLayout === "grid" ? "rounded-2xl" : "rounded-xl")} />
              ))}
            </div>
          ) : (
            <>
              {discoverList.length === 0 ? (
                <div className="glass-card p-8 text-center text-chrono-text-muted rounded-2xl">
                  No anime found matching your dynamic filter criteria. Try expanding your search [1].
                </div>
              ) : (
                <>
                  {discoverLayout === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {discoverList.map((s) => (
                        <div
                          key={s.anilistId}
                          onClick={() => handleSelectSuggestion(s)}
                          className="glass-card overflow-hidden group cursor-pointer border border-chrono-border/20 hover:border-chrono-primary/30"
                        >
                          <div className="aspect-[16/10] relative overflow-hidden bg-chrono-surface">
                            <SuggestionImage src={s.imageUrl} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-chrono-primary/80 text-white">
                              ★ {s.score.toFixed(1)}
                            </span>
                          </div>
                          <div className="p-4 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-white group-hover:text-chrono-primary transition-colors text-sm truncate">{s.title}</h4>
                              <span className="text-[10px] bg-zinc-800 text-chrono-text-muted px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 border border-zinc-700/50">{s.type}</span>
                            </div>
                            <p className="text-xs text-chrono-text-dim line-clamp-2 leading-relaxed">{s.synopsis}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {discoverList.map((s) => (
                        <div
                          key={s.anilistId}
                          onClick={() => handleSelectSuggestion(s)}
                          className="glass-card p-3 flex items-center justify-between gap-4 cursor-pointer hover:border-chrono-primary/30 group border border-chrono-border/10"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-16 rounded-lg overflow-hidden bg-chrono-surface border border-white/5 shrink-0">
                              <SuggestionImage src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white group-hover:text-chrono-primary transition-colors text-sm">{s.title}</h4>
                              <p className="text-xs text-chrono-text-dim line-clamp-1 mt-1">{s.synopsis}</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <span className="text-[10px] bg-zinc-800 text-chrono-text-muted px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-zinc-700">{s.type}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-chrono-primary/10 text-chrono-primary border border-chrono-primary/20">★ {s.score.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Cinematic Stages Overlay */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#030306]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-[99999]"
          >
            <div className="max-w-md w-full space-y-8 relative">
              <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <div className="absolute inset-0 bg-chrono-primary/15 rounded-full animate-ping" />
                <div className="w-16 h-16 bg-gradient-to-br from-chrono-primary to-chrono-accent rounded-full flex items-center justify-center shadow-lg shadow-chrono-primary/30">
                  <Sparkles className="w-7 h-7 text-white animate-pulse" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <span className="text-[10px] font-black tracking-[0.25em] text-chrono-primary uppercase">ChronoFlow Synthesizer</span>
                <h3 className="text-lg font-extrabold text-white">RECONSTRUCTING FRANCHISE GRAPH</h3>
                <p className="text-xs text-chrono-text-dim">Securing database safety gates and path matrices...</p>
              </div>

              <div className="space-y-2.5 bg-chrono-surface/30 p-4 rounded-2xl border border-chrono-border/20">
                {GENERATION_STAGES.map((stage, idx) => {
                  const isActive = idx === currentStage;
                  const isFinished = idx < currentStage;
                  return (
                    <div
                      key={stage.step}
                      className={cn(
                        "flex items-center gap-3 text-xs transition-all duration-300",
                        isActive ? "text-chrono-primary font-bold scale-[1.02]" : isFinished ? "text-chrono-success/70" : "text-chrono-text-dim opacity-50"
                      )}
                    >
                      <span className={cn("font-mono shrink-0", isActive ? "text-chrono-primary" : isFinished ? "text-chrono-success" : "text-chrono-text-dim")}>
                        {stage.step}
                      </span>
                      <span className="flex-1 truncate">{stage.label}</span>
                      {isFinished && <Check className="w-3.5 h-3.5 text-chrono-success shrink-0" />}
                      {isActive && <Loader2 className="w-3.5 h-3.5 text-chrono-primary animate-spin shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Config preferences */}
      {selected && !finalData && !generating && (
        <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
          <div className="glass-card p-4 flex items-center justify-between gap-4 border-l-4 border-chrono-primary">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-chrono-surface border border-white/5 shrink-0">
                <SuggestionImage src={selected.imageUrl} alt="" franchise={selected.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-chrono-accent uppercase tracking-widest block">Selected</span>
                <h3 className="font-bold text-white text-base truncate">{selected.title}</h3>
                <p className="text-[11px] text-chrono-text-dim mt-0.5 font-medium">Custom preferences loaded</p>
              </div>
            </div>
            <button type="button" onClick={handleReset} className="btn-secondary py-2 px-3 text-xs shrink-0 flex items-center gap-1.5 cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <PreferencePanel preferences={preferences} onChange={setPreferences} />

          <div className="text-center">
            <button
              type="button"
              onClick={handleGenerate}
              className="btn-primary text-base px-8 py-4 shadow-xl shadow-chrono-primary/25 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate watch order</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Block */}
      {error && (
        <div className="max-w-2xl mx-auto glass-card p-5 border-l-4 border-rose-500 animate-fade-in space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-rose-300">Generation failed</h3>
              <p className="text-sm text-chrono-text-muted mt-1">{error}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={handleGenerate} className="btn-primary text-sm cursor-pointer">Retry</button>
            <button type="button" onClick={handleReset} className="btn-secondary text-sm cursor-pointer">Start over</button>
          </div>
        </div>
      )}

      {/* VisualFlowchart Result Block */}
      {finalData && (
        <div className="max-w-5xl mx-auto space-y-5 animate-slide-up">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setFinalData(null);
                setError(null);
              }}
              className="btn-secondary text-sm cursor-pointer"
            >
              ← Adjust preferences
            </button>
            <div className="flex items-center gap-4">
              {provider && latency != null && (
                <span className="text-[11px] text-chrono-text-dim">via {provider} · {latency}ms</span>
              )}
              <button type="button" onClick={handleReset} className="text-sm text-[#a8a3b8] hover:text-white transition-colors cursor-pointer font-bold">New search</button>
            </div>
          </div>
          <VisualFlowchart data={finalData} timeBudget={preferences.timeBudget} customSchedule={preferences.customSchedule} />
        </div>
      )}

      {/* Landing suggestions */}
      {activeTab === "builder" && !selected && !finalData && (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: <Map className="w-4 h-4" />, title: "Spoiler-safe paths", desc: "Optimal order preserves reveals. Chronological when you want lore." },
              { icon: <Eye className="w-4 h-4" />, title: "Smart skip", desc: "Keep story, skip pure filler & recaps. Canon-only when ruthless." },
              { icon: <Clock className="w-4 h-4" />, title: "Real finish dates", desc: "Casual → Binge paces. Exact minutes, not rounded fluff." },
            ].map((f) => (
              <div key={f.title} className="glass-card p-4 border border-chrono-border/30 flex gap-3 items-start">
                <div className="w-9 h-9 rounded-lg bg-chrono-primary/15 text-chrono-primary flex items-center justify-center shrink-0">{f.icon}</div>
                <div>
                  <h3 className="text-sm font-semibold text-chrono-text">{f.title}</h3>
                  <p className="text-xs text-chrono-text-dim mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#a8a3b8] uppercase tracking-wider">Confusing franchises</h3>
              <button
                type="button"
                onClick={() => setShowAllSuggestions((v) => !v)}
                className="text-xs text-chrono-primary hover:text-chrono-primary-hover font-semibold cursor-pointer"
              >
                {showAllSuggestions ? "Show less" : "Show more"}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {displayedSuggestions.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="glass-card p-0 overflow-hidden text-left group border border-chrono-border/30 hover:border-chrono-primary/40 transition-all cursor-pointer"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-chrono-surface">
                    <SuggestionImage src={s.imageUrl} alt="" franchise={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-chrono-primary/80 text-white">{s.tag}</span>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-bold text-white group-hover:text-chrono-primary transition-colors line-clamp-1">{s.title}</h4>
                    <p className="text-[11px] text-[#a8a3b8] mt-1 line-clamp-2 leading-relaxed">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating feedback system */}
      <div className="fixed bottom-5 right-5 z-[100]">
        {feedbackOpen ? (
          <div className="glass-card w-[min(100vw-2rem,22rem)] p-4 shadow-2xl animate-slide-up border border-chrono-border/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Feedback</h3>
              <button type="button" onClick={() => setFeedbackOpen(false)} className="text-chrono-text-dim hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            {feedbackSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <Check className="w-8 h-8 text-chrono-success mx-auto" />
                <p className="text-sm text-chrono-text-muted">Thanks — sent.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <div className="flex gap-2">
                  {(["suggestion", "bug"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFeedbackType(t)}
                      className={cn("flex-1 text-xs py-1.5 rounded-lg font-semibold border transition-colors cursor-pointer", feedbackType === t ? "bg-chrono-primary/20 border-chrono-primary/40 text-chrono-primary" : "border-chrono-border text-[#6b6580]")}
                    >
                      {t === "bug" ? "Bug" : "Idea"}
                    </button>
                  ))}
                </div>
                <textarea
                  value={feedbackMsg}
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                  required
                  rows={3}
                  placeholder="What should we improve?"
                  className="input-field text-sm resize-none"
                />
                <input
                  type="text"
                  value={feedbackContact}
                  onChange={(e) => setFeedbackContact(e.target.value)}
                  placeholder="Contact (optional)"
                  className="input-field text-sm"
                />
                <button type="submit" disabled={feedbackSubmitting || !feedbackMsg.trim()} className="btn-primary w-full text-sm py-2.5 cursor-pointer">
                  {feedbackSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Send
                </button>
              </form>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-chrono-primary to-fuchsia-600 text-white shadow-lg shadow-chrono-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
