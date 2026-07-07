"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2, Film, Tv, Sparkles } from "lucide-react";
import { AnimeSearchResult } from "@/types";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

interface AnimeSearchProps {
  onSelect: (anime: AnimeSearchResult | null) => void;
  selectedAnime: AnimeSearchResult | null;
}

export function AnimeSearch({ onSelect, selectedAnime }: AnimeSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { results, loading, error, search, clear } = useSearch();

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim().length >= 2) {
      search(value);
      setIsOpen(true);
    } else {
      clear();
      setIsOpen(false);
    }
  };

  const handleSelect = (anime: AnimeSearchResult) => {
    onSelect(anime);
    setQuery(anime.title);
    setIsOpen(false);
    clear();
  };

  const handleClear = () => {
    setQuery("");
    onSelect(null);
    clear();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chrono-text-dim" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() =>
            query.trim().length >= 2 && results.length > 0 && setIsOpen(true)
          }
          placeholder="Search any anime — JoJo, Hunter x Hunter, Grand Blue Dreaming..."
          className="input-field pl-12 pr-12 py-4 text-lg"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-chrono-text-dim hover:text-chrono-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="absolute right-14 top-1/2 -translate-y-1/2">
          <Loader2 className="w-5 h-5 text-chrono-primary animate-spin" />
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card max-h-96 overflow-y-auto z-50 animate-fade-in">
          {results.map((anime) => (
            <button
              key={anime.malId || anime.anilistId}
              onClick={() => handleSelect(anime)}
              className={cn(
                "w-full flex items-center gap-4 p-4 hover:bg-chrono-surface-hover transition-colors text-left",
                "border-b border-chrono-border/30 last:border-b-0"
              )}
            >
              <div className="w-14 h-20 rounded-lg overflow-hidden bg-chrono-surface flex-shrink-0">
                {anime.imageUrl ? (
                  <img
                    src={anime.imageUrl}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-6 h-6 text-chrono-text-dim" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-chrono-text truncate">
                  {anime.title}
                </h3>
                {anime.titleJapanese && anime.titleJapanese !== anime.title && (
                  <p className="text-sm text-chrono-text-muted truncate">
                    {anime.titleJapanese}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-xs text-chrono-text-dim">
                    <Tv className="w-3 h-3" />
                    {anime.type || "TV"}
                  </span>
                  {anime.episodes && (
                    <span className="text-xs text-chrono-text-dim">
                      {anime.episodes} eps
                    </span>
                  )}
                  {anime.score > 0 && (
                    <span className="flex items-center gap-1 text-xs text-chrono-accent">
                      <Sparkles className="w-3 h-3" />
                      {anime.score.toFixed(1)}
                    </span>
                  )}
                  {anime.isFranchise && (
                    <span className="badge bg-chrono-primary/20 text-chrono-primary text-[10px]">
                      Franchise
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card p-4 text-center text-chrono-danger">
          {error}
        </div>
      )}

      {/* Selected State */}
      {selectedAnime && !isOpen && (
        <div className="mt-3 glass-card p-4 flex items-center gap-4 animate-slide-up">
          <div className="w-12 h-16 rounded-lg overflow-hidden bg-chrono-surface flex-shrink-0">
            {selectedAnime.imageUrl ? (
              <img
                src={selectedAnime.imageUrl}
                alt={selectedAnime.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-5 h-5 text-chrono-text-dim" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-chrono-text-muted">Selected</p>
            <h3 className="font-semibold text-chrono-text">
              {selectedAnime.title}
            </h3>
          </div>
          <button
            onClick={handleClear}
            className="text-chrono-text-dim hover:text-chrono-danger transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
