'use client';

import { motion } from 'framer-motion';
import type { FranchiseDNA } from '@/lib/dna';

interface FranchiseDNAProps {
  dna: FranchiseDNA;
  franchiseName: string;
}

const METRICS = [
  { key: 'nonLinearity', label: 'Timeline Complexity', description: 'How non-linear is the narrative structure?' },
  { key: 'entryClarity', label: 'Entry Points', description: 'How many valid starting places exist?' },
  { key: 'density', label: 'Essential Density', description: 'What percentage of entries are must-watch?' },
  { key: 'sequelDepth', label: 'Sequel Depth', description: 'How deep does the story chain go?' },
  { key: 'branchFactor', label: 'Branching', description: 'How many parallel storylines exist?' },
] as const;

export function FranchiseDNA({ dna, franchiseName }: FranchiseDNAProps) {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-2xl bg-white/5 border border-white/10 mt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white/90 mb-1">
          {franchiseName} Complexity Report
        </h3>
        <p className="text-sm text-white/50">
          Structural analysis based on {dna.nonLinearity > 7 ? 'complex' : 'straightforward'} narrative topology
        </p>
      </div>
      
      <div className="space-y-4">
        {METRICS.map((metric, index) => {
          const value = dna[metric.key];
          const percentage = value * 10;
          
          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white/80">{metric.label}</span>
                  <span className="text-xs text-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    {metric.description}
                  </span>
                </div>
                <span className={`text-sm font-bold ${
                  value >= 8 ? 'text-red-400' : 
                  value >= 5 ? 'text-yellow-400' : 
                  'text-green-400'
                }`}>
                  {value}/10
                </span>
              </div>
              
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    value >= 8 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                    value >= 5 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                    'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/5">
        <p className="text-sm text-white/60 leading-relaxed">
          {getComplexityMessage(dna, franchiseName)}
        </p>
      </div>
    </div>
  );
}

function getComplexityMessage(dna: FranchiseDNA, name: string): string {
  const avg = (dna.nonLinearity + dna.sequelDepth + dna.branchFactor) / 3;
  if (avg >= 7) return `${name} rewards patience. With ${dna.sequelDepth}/10 sequel depth and ${dna.branchFactor}/10 branching, this is a franchise that unfolds across multiple interconnected storylines. Fans who navigate it completely often cite it as a defining anime experience.`;
  if (avg >= 4) return `${name} offers a balanced narrative structure. ${dna.entryClarity}/10 entry clarity means most viewers can find a comfortable starting point, while ${dna.nonLinearity}/10 non-linearity adds enough complexity to stay engaging.`;
  return `${name} is structurally straightforward — a great entry point for new fans or a relaxed rewatch for veterans. The linear progression and ${dna.density}/10 essential density mean you won't miss critical context by skipping optional entries.`;
}
