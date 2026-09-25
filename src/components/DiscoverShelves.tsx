"use client";

import React from "react";
import { DiscoverShelf } from "@/components/DiscoverShelf";
import { BecauseYouGeneratedShelf } from "@/components/BecauseYouGeneratedShelf";
import { OffYourUsualPathShelf } from "@/components/OffYourUsualPathShelf";
import { usePersonalizedShelfOrder } from "@/hooks/usePersonalizedShelfOrder";
import { SHELVES } from "@/lib/discover/shelf-recipes";
import type { DiscoverCardData } from "@/lib/discover/shelf-recipes";

interface DiscoverShelvesProps {
  onSelect: (card: DiscoverCardData) => void;
}

export function DiscoverShelves({ onSelect }: DiscoverShelvesProps) {
  const orderedShelves = usePersonalizedShelfOrder(SHELVES);

  return (
    <div className="space-y-8">
      {/* Personalized: Because you generated X */}
      <BecauseYouGeneratedShelf onSelect={onSelect} />

      {/* Personalized: Off your usual path */}
      <OffYourUsualPathShelf onSelect={onSelect} />

      {/* Curated shelves (reordered by taste) */}
      {orderedShelves.map((recipe) => (
        <DiscoverShelf key={recipe.id} recipe={recipe} onSelect={onSelect} />
      ))}
    </div>
  );
}
