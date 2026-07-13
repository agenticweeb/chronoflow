"use client";

import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareCardProps {
  result: any; // Accepts both legacy WatchOrderResult and V2 WatchOrderResultV2
}

export function ShareCard({ result }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Normalize Legacy vs V2 structures
  const entries = result.allEntriesFlat || result.entries || [];
  const totalEpisodes = result.totalEpisodes;
  const totalDuration = result.totalDuration;
  const franchise = result.franchise;

  // Render up to 6 key steps on the static card to avoid infinite layout clipping
  const previewLimit = 6;
  const displayedEntries = entries.slice(0, previewLimit);
  const remainingCount = entries.length - previewLimit;

  // Uses local server-side image proxy to completely avoid CORS canvas tainting and 403 blocks
  const getProxyUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("/")) return url; 
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      // Delay slightly to ensure images are fully rendered in the virtual DOM
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2, // High DPI render
        skipFonts: true,
      });

      const link = document.createElement("a");
      link.download = `chronoflow-${franchise.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate ChronoFlow share card:", error);
    } finally {
      setDownloading(false);
    }
  };

  if (!entries.length) return null;

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-4 border border-chrono-border/30">
      <div className="text-center max-w-md">
        <h3 className="font-bold text-chrono-text text-sm flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-chrono-accent animate-pulse" />
          Shareable Watch Order Card
        </h3>
        <p className="text-xs text-chrono-text-dim mt-1">
          Export a high-resolution, watermark-protected path summary. Perfect for sharing on Twitter/X, Discord, or Reddit.
        </p>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="btn-primary py-2.5 px-5 text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-chrono-primary/10 transition-transform active:scale-95"
      >
        {downloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Rendering high-res PNG...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Download Share Card</span>
          </>
        )}
      </button>

      {/* Hidden Off-Screen Screenshot Stage */}
      <div className="absolute left-[-9999px] top-[-9999px] pointer-events-none select-none">
        <div
          ref={cardRef}
          className="w-[800px] bg-[#0a0a0f] p-8 rounded-2xl border border-[#1f1f2e] text-white flex flex-col justify-between relative overflow-hidden"
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          {/* Radial light ring visual accents */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-indigo-600/10 rounded-full blur-[80px]" />

          {/* LARGE ROTATED WATERMARK IN THE BACKGROUND */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
            <div className="text-[76px] font-black text-white/[0.015] tracking-widest uppercase rotate-[-12deg] text-center leading-none">
              agenticweeb
              <br />
              chronoflow
            </div>
          </div>

          {/* Header section */}
          <div className="flex justify-between items-start border-b border-[#1f1f2e] pb-5 mb-6 relative z-10">
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md">
                Anime Journey Map
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                {franchise}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400 font-medium">
                <span>{entries.length} titles</span>
                <span>•</span>
                <span>{totalEpisodes} episodes</span>
                <span>•</span>
                <span className="text-indigo-400">{totalDuration} runtime</span>
              </div>
            </div>

            {/* Prominent Corner Watermark */}
            <div className="text-right flex flex-col items-end">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Curated by</span>
              <span className="text-sm font-black text-indigo-400 uppercase tracking-widest mt-0.5">@agenticweeb</span>
              <span className="text-[10px] text-zinc-500 tracking-wider font-semibold mt-0.5">chronoflow.app</span>
            </div>
          </div>

          {/* Preview list */}
          <div className="space-y-3.5 mb-6 relative z-10">
            {displayedEntries.map((e: any, idx: number) => {
              const num = idx + 1;
              const isMovie = e.type === "MOVIE" || e.format === "MOVIE";
              return (
                <div
                  key={e.id || idx}
                  className="bg-[#12121e]/85 border border-[#1f1f2e] p-3 rounded-xl flex items-center gap-4"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                    {num}
                  </div>

                  <div className="w-10 h-14 rounded-md overflow-hidden bg-zinc-900 shrink-0 relative border border-white/5">
                    {e.imageUrl ? (
                      <img
                        src={getProxyUrl(e.imageUrl)}
                        alt={e.title}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-600">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                        e.tier === "essential" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                        e.tier === "recommended" && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                        e.tier === "optional" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                        e.tier === "skip" && "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      )}>
                        {e.tier || "essential"}
                      </span>
                      <span className="text-[9px] text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded font-bold uppercase border border-zinc-700/40">
                        {e.type || e.format || "TV"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate mt-1">
                      {e.title}
                    </h4>

                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {isMovie ? "Movie" : `${e.episodeCount || 12} episodes`} · {e.durationMinutes || 24}m per ep {e.year ? `· ${e.year}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}

            {remainingCount > 0 && (
              <div className="bg-[#12121e]/40 border border-dashed border-[#1f1f2e] p-3 rounded-xl text-center">
                <p className="text-xs font-semibold text-zinc-400">
                  + {remainingCount} more entries in this custom watch path
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Explore full dynamic flowchart, skipping rules & notes at <span className="text-indigo-400 font-bold">chronoflow.app</span>
                </p>
              </div>
            )}
          </div>

          {/* Footer with watermark layout */}
          <div className="border-t border-[#1f1f2e] pt-5 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">ChronoFlow</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Created by</span>
              <span className="text-xs font-black text-indigo-400 tracking-widest uppercase">agenticweeb</span>
              <span className="text-[9px] text-zinc-500 block mt-0.5 font-semibold">chronoflow.app</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
