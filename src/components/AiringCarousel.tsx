'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { CountdownBadge } from './CountdownBadge';

interface AiringAnime {
  id: number;
  title: string;
  coverImage: string;
  episodes: number | null;
  nextAiringEpisode: { airingAt: number; episode: number } | null;
}

interface Props {
  anime: AiringAnime[];
}

export function AiringCarousel({ anime }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  if (!anime || anime.length === 0) return null;

  return (
    <section className="w-full mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Currently Airing</h2>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700 cursor-pointer">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => scroll('right')} className="rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700 cursor-pointer">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {anime.map((item, i) => (
          <article key={item.id} className="group relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px]">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-900 shadow-lg">
              <SafeImage
                src={item.coverImage}
                alt={item.title}
                width={230}
                height={345}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={i < 4}
              />

              {item.nextAiringEpisode && (
                <CountdownBadge airingAt={item.nextAiringEpisode.airingAt} episode={item.nextAiringEpisode.episode} />
              )}

              <div className="absolute top-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm z-10">
                <span className="flex items-center gap-1">
                  <Tv size={10} />
                  {item.episodes ?? '?'} eps
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-8">
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-white">
                  {item.title}
                </h3>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
