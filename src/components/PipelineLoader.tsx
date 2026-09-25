'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 'resolve', label: 'Resolving title & checking curated database', estMs: 1100 },
  { id: 'graph', label: 'Traversing the AniList relation graph', estMs: 2600 },
  { id: 'classify', label: 'AI classifying essential / skippable tiers', estMs: 4800 },
  { id: 'enrich', label: 'Enriching entries — covers, scores, synopses', estMs: 2400 },
  { id: 'budget', label: 'Calculating your personalized finish date', estMs: 1100 },
] as const;

type StepStatus = 'pending' | 'active' | 'done';

interface PipelineLoaderProps {
  isComplete: boolean;
  onFinished: () => void;
}

export function PipelineLoader({ isComplete, onFinished }: PipelineLoaderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [statuses, setStatuses] = useState<StepStatus[]>(
    STEPS.map((_, i) => (i === 0 ? 'active' : 'pending'))
  );
  const [elapsedMs, setElapsedMs] = useState(0);
  const finishedRef = useRef(false);

  // Advance through fake-but-honest timed steps
  useEffect(() => {
    if (activeIndex >= STEPS.length - 1) return;
    const timer = setTimeout(() => {
      setStatuses((prev) =>
        prev.map((s, i) => (i === activeIndex ? 'done' : i === activeIndex + 1 ? 'active' : s))
      );
      setActiveIndex((i) => i + 1);
    }, STEPS[activeIndex].estMs);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  // Elapsed time ticker
  useEffect(() => {
    const interval = setInterval(() => setElapsedMs((t) => t + 100), 100);
    return () => clearInterval(interval);
  }, []);

  // Snap to completion the instant real data lands
  useEffect(() => {
    if (isComplete && !finishedRef.current) {
      finishedRef.current = true;
      setStatuses(STEPS.map(() => 'done'));
      const t = setTimeout(onFinished, 550);
      return () => clearTimeout(t);
    }
  }, [isComplete, onFinished]);

  const isTakingLong = elapsedMs > 16000 && !isComplete;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-chrono-bg/95 backdrop-blur-md"
    >
      <div className="w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-black/40 p-6 font-mono shadow-2xl shadow-chrono-primary/10">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/10">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="ml-2 text-xs text-chrono-text-dim tracking-wide">
            generating-watch-order.log
          </span>
          <span className="ml-auto text-xs text-chrono-text-dim tabular-nums">
            {(elapsedMs / 1000).toFixed(1)}s
          </span>
        </div>

        <ul className="space-y-3">
          {STEPS.map((step, i) => {
            const status = statuses[i];
            return (
              <li key={step.id} className="flex items-center gap-3">
                <span className="w-4 h-4 flex items-center justify-center shrink-0">
                  {status === 'done' && <Check className="w-4 h-4 text-emerald-400" />}
                  {status === 'active' && (
                    <Loader2 className="w-4 h-4 text-chrono-accent animate-spin" />
                  )}
                  {status === 'pending' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  )}
                </span>
                <span
                  className={`text-sm transition-colors ${
                    status === 'pending'
                      ? 'text-chrono-text-dim/50'
                      : status === 'active'
                        ? 'text-chrono-text'
                        : 'text-chrono-text-muted'
                  }`}
                >
                  {step.label}
                  {status === 'active' && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-chrono-accent/80 animate-pulse align-middle" />
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 h-1 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-chrono-primary to-chrono-accent"
            initial={{ width: '0%' }}
            animate={{ width: `${((activeIndex + (isComplete ? 1 : 0.5)) / STEPS.length) * 100}%` }}
            transition={{ ease: 'easeOut', duration: 0.4 }}
          />
        </div>

        <AnimatePresence>
          {isTakingLong && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 text-xs text-chrono-text-dim"
            >
              Still working — AniList or the AI provider may be under load. Hang tight.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
