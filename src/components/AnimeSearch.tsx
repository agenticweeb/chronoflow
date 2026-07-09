"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, X, Loader2, Film, Tv, Sparkles } from "lucide-react";
import { AnimeSearchResult } from "@/types";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import { SuggestionImage } from "@/components/SuggestionImage";

interface AnimeSearchProps {
  onSelect: (anime: AnimeSearchResult | null) => void;
  selectedAnime: AnimeSearchResult | null;
}

export function AnimeSearch({ onSelect, selectedAnime }: AnimeSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { results, loading, error, search, clear } = useSearch();

  // Track dropdown position for portal
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const updateDropdownPos = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setHighlightedIndex(0);
    if (value.trim().length >= 2) {
      search(value);
      setIsOpen(true);
      updateDropdownPos();
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlightedIndex]) {
        handleSelect(results[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Update position on resize/scroll
  useEffect(() => {
    if (!isOpen) return;
    updateDropdownPos();
    window.addEventListener("resize", updateDropdownPos);
    window.addEventListener("scroll", updateDropdownPos, true);
    return () => {
      window.removeEventListener("resize", updateDropdownPos);
      window.removeEventListener("scroll", updateDropdownPos, true);
    };
  }, [isOpen, updateDropdownPos]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current?.contains(e.target as Node) ||
        document.getElementById("search-dropdown")?.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
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
          onFocus={() => {
            if (query.trim().length >= 2 && results.length > 0) {
              setIsOpen(true);
              updateDropdownPos();
            }
          }}
          onKeyDown={handleKeyDown}
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
        {loading && (
          <div className="absolute right-14 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-chrono-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown via Portal — renders outside parent stacking context */}
      {isOpen && results.length > 0 && typeof window !== "undefined" &&
        createPortal(
          <div
            id="search-dropdown"
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 9999,
            }}
            className="glass-card max-h-96 overflow-y-auto shadow-2xl shadow-black/60"
          >
            {results.map((anime, index) => (
              <button
                key={anime.malId || anime.anilistId}
                onClick={() => handleSelect(anime)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 transition-colors text-left",
                  "border-b border-chrono-border/30 last:border-b-0",
                  index === highlightedIndex
                    ? "bg-chrono-surface-hover"
                    : "bg-transparent hover:bg-chrono-surface-hover/50"
                )}
              >
                <div className="w-14 h-20 rounded-lg overflow-hidden bg-chrono-surface flex-shrink-0 relative">
                  <SuggestionImage
                    src={anime.imageUrl}
                    alt={anime.title}
                    franchise={anime.title}
                    className="w-full h-full"
                  />
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
          </div>,
          document.body
        )}

      {/* Error state */}
      {error && isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card p-4 text-center text-chrono-danger z-50">
          {error}
        </div>
      )}

      {/* Selected state */}
      {selectedAnime && !isOpen && (
        <div className="mt-3 glass-card p-4 flex items-center gap-4 animate-slide-up">
          <div className="w-12 h-16 rounded-lg overflow-hidden bg-chrono-surface flex-shrink-0 relative">
            <SuggestionImage
              src={selectedAnime.imageUrl}
              alt={selectedAnime.title}
              franchise={selectedAnime.title}
              className="w-full h-full"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-chrono-text-muted">Selected</p>
            <h3 className="font-semibold text-chrono-text">{selectedAnime.title}</h3>
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
