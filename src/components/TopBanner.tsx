"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

export function TopBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full bg-[#10101a] border-b border-chrono-border/25 py-2.5 px-4 flex items-center justify-between text-xs tracking-wider font-extrabold relative overflow-hidden select-none z-[100]">
      <div className="flex-1 overflow-hidden relative h-5">
        <div className="animate-marquee-horizontal absolute whitespace-nowrap flex gap-12 text-[#a78bfa] font-black uppercase text-[10px] sm:text-xs">
          <span>By Agenticweeb - grounded dynamic watch orders</span>
          <span>By Agenticweeb - grounded dynamic watch orders</span>
          <span>By Agenticweeb - grounded dynamic watch orders</span>
          <span>By Agenticweeb - grounded dynamic watch orders</span>
        </div>
      </div>
      <button 
        type="button" 
        onClick={() => setDismissed(true)} 
        className="p-1 rounded bg-black/40 border border-[#2a2540] text-[#6b6580] hover:text-white shrink-0 ml-4 cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
