"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ChronoFlow] boundary:", error);
  }, [error]);

  return (
    <main
      className="min-h-dvh flex items-center justify-center px-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="glass-card max-w-md w-full p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/15 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-rose-400" aria-hidden="true" />
        </div>
        <h1 className="text-lg font-bold text-white">Something went wrong</h1>
        <p className="text-sm text-chrono-text-muted leading-relaxed">
          {error.message || "An unexpected error interrupted ChronoFlow."}
        </p>
        {error.digest ? (
          <p className="text-[10px] text-chrono-text-dim font-mono">
            digest {error.digest}
          </p>
        ) : null}
        <button type="button" onClick={reset} className="btn-primary text-sm mx-auto">
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    </main>
  );
}
