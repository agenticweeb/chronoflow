'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface Props {
  airingAt: number; // Unix timestamp in seconds
  episode: number;
}

export function AiringCountdown({ airingAt, episode }: Props) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const airing = airingAt * 1000; // Convert seconds to ms
      const diff = airing - now;
      
      if (diff <= 0) {
        setTimeLeft('Aired recently!');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };
    
    update();
    const interval = setInterval(update, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [airingAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold bg-violet-500/15 border border-violet-500/30 text-violet-300 w-fit"
    >
      <Zap className="w-3 h-3" />
      Ep {episode} airs in {timeLeft}
    </motion.div>
  );
}
