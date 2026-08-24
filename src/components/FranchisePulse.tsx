'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  mediaId: number;
  currentTier: string;
}

const TIERS = [
  { id: 'essential', label: 'Essential', color: 'bg-emerald-500' },
  { id: 'recommended', label: 'Rec.', color: 'bg-sky-500' },
  { id: 'optional', label: 'Opt.', color: 'bg-amber-500' },
  { id: 'skip', label: 'Skip', color: 'bg-zinc-600' },
];

export function FranchisePulse({ mediaId, currentTier }: Props) {
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const res = await fetch(`/api/vote?mediaId=${mediaId}`);
        const data = await res.json();
        if (data.success) {
          setVotes(data.votes || {});
          setTotalVotes(data.totalVotes || 0);
        }
      } catch (e) {
        // Fail silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchVotes();
  }, [mediaId]);

  const handleVote = async (tier: string) => {
    if (hasVoted) return;
    setHasVoted(true);
    
    // Optimistic UI
    setVotes(prev => ({ ...prev, [tier]: String(parseInt(prev[tier] || '0', 10) + 1) }));
    setTotalVotes(prev => prev + 1);

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, tier }),
      });
      const data = await res.json();
      if (data.success) {
        setVotes(data.votes || {});
        setTotalVotes(data.totalVotes || 0);
      }
    } catch (e) {
      // Revert on failure
      setVotes(prev => ({ ...prev, [tier]: String(parseInt(prev[tier] || '0', 10) - 1) }));
      setTotalVotes(prev => prev - 1);
      setHasVoted(false);
    }
  };

  if (isLoading || totalVotes === 0) {
    return (
      <div className="mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] text-chrono-text-dim font-bold uppercase tracking-wider">
          <Users className="w-3 h-3" /> Community Consensus
        </div>
        <div className="mt-2 flex gap-1.5">
          {TIERS.map((t) => (
            <button 
              key={t.id} 
              onClick={() => handleVote(t.id)} 
              className={cn(
                "flex-1 text-[9px] font-bold uppercase tracking-wider py-1 rounded-md border transition-all cursor-pointer",
                currentTier === t.id ? "border-white/30 bg-white/5 text-white" : "border-transparent text-zinc-500 hover:bg-white/5"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const topTier = Object.entries(votes).sort((a, b) => parseInt(b[1], 10) - parseInt(a[1], 10))[0]?.[0] || currentTier;
  const topTierPercentage = Math.round((parseInt(votes[topTier] || '0', 10) / totalVotes) * 100);

  return (
    <div className="mt-3 pt-3 border-t border-white/5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-chrono-text-dim font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3 h-3" /> Community Consensus
        </span>
        <span className="text-[10px] text-chrono-text-dim">{totalVotes} votes</span>
      </div>
      
      {/* Progress Bar */}
      <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-black/40 mb-2">
        {TIERS.map((t) => {
          const count = parseInt(votes[t.id] || '0', 10);
          const width = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          return (
            <div
              key={t.id}
              style={{ width: `${width}%` }}
              className={cn("transition-all duration-500", t.color)}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-zinc-400 truncate">
          <span className="font-bold text-white capitalize">{topTier}</span> ({topTierPercentage}%)
        </span>
        
        {/* Vote Buttons (Allows disagreement) */}
        {!hasVoted ? (
          <div className="flex gap-1">
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleVote(t.id)}
                className={cn(
                  "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border transition-all cursor-pointer",
                  currentTier === t.id 
                    ? "border-white/30 bg-white/5 text-white" 
                    : "border-transparent text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 shrink-0">
            <ThumbsUp className="w-2.5 h-2.5 fill-emerald-400" /> Voted!
          </span>
        )}
      </div>
    </div>
  );
}
