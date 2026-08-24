// src/components/NarrativeLoader.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNarrative } from '@/data/loading-narratives';

interface NarrativeLoaderProps {
  franchiseQuery: string;
  estimatedTotalMs?: number;
}

export function NarrativeLoader({ franchiseQuery, estimatedTotalMs = 15000 }: NarrativeLoaderProps) {
  const narrative = getNarrative(franchiseQuery);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());
  
  const totalNarrativeMs = narrative.phases.reduce((sum, p) => sum + p.estimatedMs, 0);
  const scaleFactor = estimatedTotalMs / totalNarrativeMs;

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    let accumulatedMs = 0;
    
    narrative.phases.forEach((phase, index) => {
      const adjustedMs = phase.estimatedMs * scaleFactor;
      accumulatedMs += adjustedMs;
      
      const timeout = setTimeout(() => {
        setCurrentPhase(index);
        setCompletedPhases(prev => new Set([...prev, index]));
      }, accumulatedMs - adjustedMs);
      
      timeouts.push(timeout);
    });
    
    return () => timeouts.forEach(clearTimeout);
  }, [franchiseQuery, estimatedTotalMs, narrative, scaleFactor]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 relative w-full max-w-md mx-auto py-12">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-white/90 text-center"
      >
        Building your {narrative.franchise} timeline
      </motion.h2>
      
      <div className="w-full space-y-3">
        <AnimatePresence>
          {narrative.phases.map((phase, index) => {
            const isActive = index === currentPhase;
            const isCompleted = completedPhases.has(index);
            const isVisible = index <= currentPhase;
            
            if (!isVisible) return null;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0, scale: isActive ? 1.02 : 1 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-500 border ${
                  isActive ? 'bg-white/10 border-white/20' : 'border-transparent'
                } ${isCompleted && !isActive ? 'opacity-60' : ''}`}
              >
                <span className="text-xl">{phase.icon}</span>
                <span className={`text-sm ${isActive ? 'text-white font-medium' : 'text-white/60'}`}>
                  {phase.message}
                </span>
                {isCompleted && (
                  <motion.svg 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    className="w-4 h-4 text-green-400 ml-auto"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </motion.svg>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentPhase + 1) / narrative.phases.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
