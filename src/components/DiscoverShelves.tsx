"use client";

import React from "react";
import { DiscoverShelf } from "@/components/DiscoverShelf";
import { SHELVES } from "@/lib/discover/shelf-recipes";
import type { DiscoverCardData } from "@/lib/discover/shelf-recipes";

interface DiscoverShelvesProps {
  onSelect: (card: DiscoverCardData) => void;
}

/**
 * Zone 1 of the Discover tab: curated rails.
 * Identical for every visitor; deliberately ignores the filter bar below.
 * Every future engine (Off Your Usual Path, Community Bridges, Wildcard)
 * renders through this same container as additional ShelfRecipes.
 */
export function DiscoverShelves({ onSelect }: DiscoverShelvesProps) {
  return (
    <div className="space-y-8">
      {SHELVES.map((recipe) => (
        <DiscoverShelf key={recipe.id} recipe={recipe} onSelect={onSelect} />
      ))}
    </div>
  );
}
