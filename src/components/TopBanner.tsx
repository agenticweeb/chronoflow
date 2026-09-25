"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Volume2, VolumeX } from "lucide-react";
import { useWatchStore } from "@/lib/store";

export function TopBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { isAudioEnabled, toggleAudio } = useWatchStore();

  if (dismissed) return null;

  return (
    <div className="w-full bg-[#10101a] border-b border-chrono-border/25 py-2.5 px-4 flex items-center justify-between text-xs tracking-wider font-extrabold relative overflow-hidden select-none z-[100]">
      <div className="flex-1 overflow-hidden relative h-5 mr-4">
        <motion.div
          className="absolute whitespace-nowrap flex gap-12 text-[#a78bfa] font-black uppercase text-[10px] sm:text-xs"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <span>By Agenticweeb - grounded dynamic watch orders</span>
          <span>By Agenticweeb - grounded dynamic watch orders</span>
          <span>By Agenticweeb - grounded dynamic watch orders</span>
          <span>By Agenticweeb - grounded dynamic watch orders</span>
        </motion.div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={toggleAudio}
          className="p-1 rounded bg-black/40 border border-[#2a2540] text-[#6b6580] hover:text-white cursor-pointer"
          aria-label={isAudioEnabled ? "Disable audio cues" : "Enable audio cues"}
        >
          {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded bg-black/40 border border-[#2a2540] text-[#6b6580] hover:text-white cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
