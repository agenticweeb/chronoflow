"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="glass-card p-8 text-center border-l-4 border-tier-skip animate-fade-in">
      <AlertTriangle className="w-12 h-12 text-tier-skip mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-chrono-text mb-2">Something Went Wrong</h3>
      <p className="text-sm text-chrono-text-muted mb-6">{message}</p>
      <button onClick={onRetry} className="btn-primary inline-flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
