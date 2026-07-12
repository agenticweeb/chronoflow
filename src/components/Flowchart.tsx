"use client";
import { calculateTimeBudget } from "@/lib/time-calculator";
import { TimeBudgetCard } from "@/components/TimeBudgetCard";
import { useState } from "react";
import { createPortal } from "react-dom";
import { generateWatchCalendarIcs, downloadIcsFile } from "@/lib/calendar-generator";

import {
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  Star,
  AlertTriangle,
  Info,
  Share2,
  Play,
  SkipForward,
  CalendarDays,
  X,
  Target,
} from "lucide-react";

import { WatchOrderEntry, WatchOrderResult } from "@/types";
import { useProgress } from "@/hooks/useProgress";
import { cn, generateShareText } from "@/lib/utils";
import { SuggestionImage } from "@/components/SuggestionImage";

interface FlowchartProps {
  result: WatchOrderResult;
}

function getYoutubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  if (url.includes("youtube.com/embed/")) return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
  return null;
}

export function Flowchart({ result }: FlowchartProps) {
  const [expanded, setExpanded] = useState(new Set<string>());
  const [activeTrailerUrl, setActiveTrailerUrl] = useState<string | null>(null);
  const [isCalOpen, setIsCalOpen] = useState(false);
  const [calStartDate, setCalStartDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [calEpsPerDay, setCalEpsPerDay] = useState(2);
  const [calStartTime, setCalStartTime] = useState("20:00");

  const toggleEntry = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const { progress, toggleWatched, getCompletionRate } = useProgress(result.franchiseId);

  const handleShare = () => {
    const text = generateShareText(result.franchise, result.entries, result.totalDuration);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleExportCalendar = () => {
    const icsContent = generateWatchCalendarIcs(result.franchise, result.entries, {
      startDate: calStartDate,
      episodesPerDay: calEpsPerDay,
      watchStartTime: calStartTime,
    });
    const slug = result.franchise.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    downloadIcsFile(`chronoflow-${slug}-schedule.ics`, icsContent);
    setIsCalOpen(false);
  };

  const completionRate = getCompletionRate();

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient">{result.franchise}</h1>
            <p className="text-chrono-text-muted mt-1">{result.description}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-chrono-text-dim">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{result.totalDuration} total</span>
              <span>•</span><span>{result.totalEntries} entries</span><span>•</span><span>{result.totalEpisodes} episodes</span>
              {result.confidence < 80 && <span className="flex items-center gap-1 text-chrono-warning"><AlertTriangle className="w-4 h-4" />Limited data — AI-generated</span>}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 sm:w-40 min-w-[120px]">
              <div className="flex justify-between text-xs text-chrono-text-muted mb-1"><span>Progress</span><span>{completionRate}%</span></div>
              <div className="h-2 bg-chrono-surface rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-chrono-primary to-chrono-accent transition-all duration-500" style={{ width: `${completionRate}%` }} /></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsCalOpen(true)} className="btn-secondary flex-1 sm:flex-initial flex items-center justify-center gap-2 border-chrono-primary/30 text-chrono-primary hover:bg-chrono-primary/5"><CalendarDays className="w-4 h-4" /><span>Schedule</span></button>
              <button onClick={handleShare} className="btn-secondary flex-1 sm:flex-initial flex items-center justify-center gap-2"><Share2 className="w-4 h-4" /><span>Share</span></button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-chrono-text-dim"><span>Powered by</span><span className="px-2 py-0.5 bg-chrono-primary/10 text-chrono-primary rounded-full font-medium">{result.aiProvider}</span><span>• Generated {new Date(result.generatedAt).toLocaleDateString()}</span></div>
      </div>

      <TimeBudgetCard data={calculateTimeBudget(result.franchise, result.entries.map((e) => ({ title: e.title, episodes: e.episodeCount ?? 1, durationMin: e.durationMinutes ?? 24, tier: e.tier })), new Date(result.generatedAt))} />

      <div className="relative">
        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-chrono-primary/50 via-chrono-border to-chrono-border" />
        <div className="space-y-0">
          {result.entries.map((entry, index) => (
            <FlowchartNode key={entry.id} entry={entry} index={index} isExpanded={expanded.has(entry.id)} onToggle={() => toggleEntry(entry.id)} isWatched={progress?.entries[entry.id]?.watched || false} onToggleWatched={() => toggleWatched(entry.id, entry)} isLast={index === result.entries.length - 1} onPlayTrailer={(url) => setActiveTrailerUrl(url)} />
          ))}
        </div>
      </div>

      {isCalOpen && typeof window !== "undefined" && createPortal(<div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999]"><div className="glass-card w-full max-w-md overflow-hidden shadow-2xl border border-chrono-border"><div className="p-6 border-b border-chrono-border/40 flex items-center justify-between bg-chrono-surface/30"><div className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-chrono-primary" /><h3 className="text-lg font-bold">Customize Calendar</h3></div><button onClick={() => setIsCalOpen(false)} className="p-1.5 rounded-lg bg-chrono-surface hover:bg-chrono-surface-hover"><X className="w-4 h-4" /></button></div><div className="p-6 space-y-5"><div className="space-y-2"><label className="text-xs font-bold uppercase">Start Date</label><input type="date" value={calStartDate} onChange={(e) => setCalStartDate(e.target.value)} className="input-field w-full" /></div><div className="space-y-2"><div className="flex justify-between text-xs"><span>Pace</span><span className="font-bold">{calEpsPerDay} ep/day</span></div><div className="grid grid-cols-4 gap-2">{[1,2,4,8].map(v=><button key={v} onClick={()=>setCalEpsPerDay(v)} className={cn("py-2 rounded-lg text-xs font-semibold border",calEpsPerDay===v?"bg-chrono-primary text-white":"bg-chrono-surface")}>{v} Ep</button>)}</div></div><div className="space-y-2"><label className="text-xs font-bold uppercase">Daily Time</label><input type="time" value={calStartTime} onChange={e=>setCalStartTime(e.target.value)} className="input-field w-full" /></div></div><div className="p-6 border-t flex justify-end gap-3"><button onClick={()=>setIsCalOpen(false)} className="btn-secondary">Cancel</button><button onClick={handleExportCalendar} className="btn-primary">Download .ics</button></div></div></div>,document.body)}
      {activeTrailerUrl && typeof window !== "undefined" && createPortal(<div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[99999]"><div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden relative bg-black"><button onClick={()=>setActiveTrailerUrl(null)} className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white z-50"><X className="w-5 h-5" /></button>{getYoutubeEmbedUrl(activeTrailerUrl)?<iframe src={getYoutubeEmbedUrl(activeTrailerUrl)!} className="w-full h-full" allowFullScreen />:<div className="w-full h-full flex flex-col items-center justify-center"><Play className="w-12 h-12" /><a href={activeTrailerUrl} target="_blank" className="text-chrono-primary underline text-xs mt-2">{activeTrailerUrl}</a></div>}</div></div>,document.body)}
    </div>
  );
}

interface FlowchartNodeProps { entry: WatchOrderEntry; index: number; isExpanded: boolean; onToggle: () => void; isWatched: boolean; onToggleWatched: () => void; isLast: boolean; onPlayTrailer: (url: string) => void; }
function FlowchartNode({ entry, index, isExpanded, onToggle, isWatched, onToggleWatched, isLast, onPlayTrailer }: FlowchartNodeProps) {
  const tierStyles = { essential: "tier-essential", recommended: "tier-recommended", optional: "tier-optional", skip: "tier-skip" };
  const tierBadges = { essential: "badge-essential", recommended: "badge-recommended", optional: "badge-optional", skip: "badge-skip" };
  return (
    <div className="relative pl-14 sm:pl-16">
      <div className={cn("absolute left-4 sm:left-6 top-6 w-4 h-4 rounded-full border-2 z-10", isWatched?"bg-chrono-success border-chrono-success":entry.tier==="essential"?"bg-tier-essential border-tier-essential":entry.tier==="recommended"?"bg-tier-recommended border-tier-recommended":entry.tier==="optional"?"bg-tier-optional border-tier-optional":"bg-tier-skip border-tier-skip")}>{isWatched && <Check className="w-3 h-3 text-white absolute -top-0.5 -left-0.5" />}</div>
      <div className={cn("glass-card mb-4 hover:bg-chrono-surface-hover", tierStyles[entry.tier], isWatched&&"opacity-60")}>
        <div className="p-4 cursor-pointer flex items-start gap-4" onClick={onToggle}>
          <div className="w-16 h-24 rounded-lg overflow-hidden bg-chrono-surface hidden sm:block"><SuggestionImage src={entry.imageUrl} alt={entry.title} franchise={entry.title} className="w-full h-full" /></div>
          <div className="flex-1 min-w-0"><div className="flex gap-2 flex-wrap"><span className={cn("text-xs font-medium",tierBadges[entry.tier])}>{entry.tier.toUpperCase()}</span><span className="text-xs bg-chrono-surface px-2 py-0.5 rounded-full">{entry.type}</span>{entry.arcName&&<span className="text-xs text-chrono-primary bg-chrono-primary/10 px-2 py-0.5 rounded-full">{entry.arcName}</span>}</div><h3 className="font-semibold mt-1 truncate">{entry.title}</h3><div className="flex gap-3 mt-2 text-sm text-chrono-text-muted"><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{entry.timeEstimate}</span>{entry.episodeCount&&<span>{entry.episodeCount} eps</span>}{entry.malScore&&entry.malScore>0&&<span className="flex items-center gap-1 text-chrono-accent"><Star className="w-3.5 h-3.5" />{entry.malScore.toFixed(1)}</span>}</div><p className="text-sm text-chrono-text-dim mt-2 line-clamp-2">{entry.whyWatch}</p></div>
          <div className="flex flex-col gap-2"><button onClick={e=>{e.stopPropagation();onToggleWatched();}} className={cn("w-10 h-10 rounded-xl flex items-center justify-center",isWatched?"bg-chrono-success/20 text-chrono-success":"bg-chrono-surface") }><Check className="w-5 h-5" /></button>{isExpanded?<ChevronUp className="w-5 h-5" />:<ChevronDown className="w-5 h-5" />}</div>
        </div>
        {isExpanded && <div className="px-4 pb-4 border-t pt-4"><div className="grid md:grid-cols-2 gap-4"><div className="space-y-3"><div className="flex gap-2"><Info className="w-4 h-4 text-chrono-primary mt-0.5" /><div><p className="text-sm font-medium">Why Watch</p><p className="text-sm text-chrono-text-muted mt-1">{entry.whyWatch}</p></div></div>{entry.skipWarning&&<div className="flex gap-2"><AlertTriangle className="w-4 h-4 text-chrono-warning mt-0.5" /><div><p className="text-sm font-medium text-chrono-warning">If You Skip</p><p className="text-sm mt-1">{entry.skipWarning}</p></div></div>}</div><div className="space-y-3">{entry.synopsis&&<div><p className="text-sm font-medium">Synopsis</p><p className="text-sm text-chrono-text-muted mt-1 line-clamp-4">{entry.synopsis}</p></div>}{entry.genres&&entry.genres.length>0&&<div><p className="text-sm font-medium">Genres</p><div className="flex flex-wrap gap-1 mt-1">{entry.genres.map(g=><span key={g} className="text-xs px-2 py-0.5 bg-chrono-surface rounded-full">{g}</span>)}</div></div>}{entry.trailerUrl&&<button onClick={e=>{e.stopPropagation();onPlayTrailer(entry.trailerUrl!);}} className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5"><Play className="w-3.5 h-3.5" />Watch Trailer</button>}<button onClick={e=>{e.stopPropagation();if((window as any).ChronoFlow_SelectAnime&&entry.anilistId){(window as any).ChronoFlow_SelectAnime({anilistId:entry.anilistId,malId:entry.malId,title:entry.title,type:entry.type,imageUrl:entry.imageUrl,scope:"season"});}}} className="btn-secondary py-2 px-4 text-xs inline-flex items-center gap-1.5"><Target className="w-3.5 h-3.5" />Focus Season →</button></div></div></div>}
      </div>
    </div>
  );
}

// Add default export so both import styles work
export default Flowchart;
