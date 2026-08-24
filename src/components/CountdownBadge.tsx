'use client';
import { useEffect, useState } from 'react';

interface Props {
  airingAt: number;
  episode: number;
}

export function CountdownBadge({ airingAt, episode }: Props) {
  const [text, setText] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = airingAt * 1000 - Date.now();
      if (diff <= 0) { setText('Airing now'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      setText(d > 0 ? `Ep ${episode} in ${d}d ${h}h` : `Ep ${episode} in ${h}h`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [airingAt, episode]);

  if (!text) return null;
  return <span className="absolute top-2 right-2 rounded-full bg-purple-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg z-10">{text}</span>;
}
