"use client";

import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="glass-card p-12 text-center animate-fade-in">
      <Loader2 className="w-12 h-12 text-chrono-primary animate-spin mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-chrono-text mb-2">
        Crafting Your Perfect Path
      </h3>
      <p className="text-sm text-chrono-text-muted">
        AI is analyzing franchise structure, filler episodes, and optimal viewing order...
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-chrono-primary animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-chrono-primary animate-pulse delay-150" />
        <div className="w-2 h-2 rounded-full bg-chrono-primary animate-pulse delay-300" />
      </div>
    </div>
  );
}
