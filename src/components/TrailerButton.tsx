import { Play, ExternalLink } from 'lucide-react';

interface TrailerButtonProps {
  trailer: { id: string; site: string; thumbnail?: string } | null;
  title: string;
  englishTitle?: string | null;
  onPlayTrailer?: (url: string) => void;
}

export default function TrailerButton({ trailer, title, englishTitle, onPlayTrailer }: TrailerButtonProps) {
  // Primary: AniList has the exact trailer ID
  if (trailer?.site === 'youtube' && trailer.id) {
    const url = `https://www.youtube.com/watch?v=${trailer.id}`;
    
    // If internal modal handler is provided, use it (keeps users on site)
    if (onPlayTrailer) {
      return (
        <button
          onClick={() => onPlayTrailer(url)}
          className="btn-primary py-2 px-3 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Play className="h-3.5 w-3.5 fill-current" /> Trailer
        </button>
      );
    }

    // Fallback to direct link if no modal handler
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary py-2 px-3 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
      >
        <Play className="h-3.5 w-3.5 fill-current" /> Trailer
      </a>
    );
  }

  if (trailer?.site === 'dailymotion' && trailer.id) {
    return (
      <a
        href={`https://www.dailymotion.com/video/${trailer.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary py-2 px-3 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
      >
        <Play className="h-3.5 w-3.5 fill-current" /> Trailer
      </a>
    );
  }

  // FALLBACK: Construct YouTube search URL (zero-cost, no API key needed)
  const searchQuery = englishTitle || title;
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${searchQuery} official trailer`
  )}`;

  return (
    <a
      href={youtubeSearchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-secondary py-2 px-3 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
    >
      <ExternalLink className="h-3.5 w-3.5" />
      Find Trailer
    </a>
  );
}
