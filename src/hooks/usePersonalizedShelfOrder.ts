"use client";

import { useState, useEffect } from "react";
import { buildTasteVector, scoreShelf } from "@/lib/discover/taste-graph";
import type { ShelfRecipe } from "@/lib/discover/shelf-recipes";

/**
 * Reorders shelves client-side based on the user's taste vector.
 * Does NOT change shelf content — only the order they appear in.
 * Falls back to the original order if the user has no taste data.
 */
export function usePersonalizedShelfOrder(shelves: ShelfRecipe[]) {
  const [orderedShelves, setOrderedShelves] = useState<ShelfRecipe[]>(shelves);

  useEffect(() => {
    const vector = buildTasteVector();
    const hasTasteData = Object.keys(vector).length > 0;

    if (!hasTasteData) {
      // No taste data — use original order
      setOrderedShelves(shelves);
      return;
    }

    // Score each shelf, sort by score descending (most relevant first)
    const scored = shelves.map((shelf, index) => ({
      shelf,
      score: shelf.centroidTags.length > 0 
        ? scoreShelf(vector, shelf.centroidTags) 
        : -1, // Universal shelves (trending, airing) get -1 so they sink
      originalIndex: index,
    }));

    // Sort: highest score first, tie-break by original order
    scored.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.originalIndex - b.originalIndex;
    });

    setOrderedShelves(scored.map(s => s.shelf));

    // Log for debugging (Claude's recommendation: eyeball it first)
    if (process.env.NODE_ENV === "development") {
      console.log("[TASTE] Shelf order:", scored.map(s => `${s.shelf.id}: ${s.score.toFixed(1)}`));
    }
  }, [shelves]);

  return orderedShelves;
}
