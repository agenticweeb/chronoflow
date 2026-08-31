'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WatchOrderEntryV2 } from '@/types/intelligent';

interface CollapsibleArcProps {
  arc: {
    id: string;
    name: string;
    entries: WatchOrderEntryV2[];
  };
  children: React.ReactNode[];
}

interface CollapsibleArcProps {
  arc: {
    id: string;
    name: string;
    entries: WatchOrderEntryV2[];
  };
  defaultOpen?: boolean;
  children: React.ReactNode[];
}

export function CollapsibleArc({ arc, children, defaultOpen = false }: CollapsibleArcProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Calculate total time for the arc
  const totalMins = arc.entries.reduce((sum, e) => sum + (e.episodeCount || 1) * (e.durationMinutes || 24), 0);
  const totalEps = arc.entries.reduce((sum, e) => sum + (e.episodeCount || 1), 0);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  return (
    <div className="rounded-2xl border border-chrono-border/40 bg-chrono-surface/20 overflow-hidden mb-4">
      {/* ARC HEADER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.02] transition-colors text-left cursor-pointer touch-manipulation"
      >
        <div className="flex items-center gap-2 min-w-0">
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-chrono-text-dim" />
          </motion.div>
          <div className="min-w-0">
            <h4 className="font-bold text-white text-sm truncate">{arc.name}</h4>
            <div className="flex items-center gap-2 text-[10px] text-chrono-text-dim mt-0.5">
              <span>{arc.entries.length} titles</span>
              <span>•</span>
              <span>{totalEps} eps</span>
              <span>•</span>
              <span>{hrs > 0 ? `${hrs}h ` : ''}{mins}m</span>
            </div>
          </div>
        </div>
      </button>

      {/* EXPANDABLE CONTENT */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-4 bg-black/20 border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
