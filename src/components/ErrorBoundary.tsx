"use client";

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ChronoFlow] boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="glass-card p-8 max-w-md border-l-4 border-rose-500/60">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Timeline Disrupted
            </h2>
            <p className="text-sm text-chrono-text-muted mb-6">
              We hit an unexpected anomaly while rendering this view. Your progress is safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reload ChronoFlow
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
