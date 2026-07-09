/**
 * Utility Functions
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Debounce for search input
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Format duration in minutes to human-readable
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Estimate total time from episode count
export function estimateTime(episodes: number, durationMin: number = 24): string {
  const totalMin = episodes * durationMin;
  const hours = Math.round((totalMin / 60) * 10) / 10;
  if (hours < 1) return `${totalMin}m`;
  return `~${hours}h`;
}

// Generate share text for X (Twitter)
export function generateShareText(
  franchise: string,
  entries: any[],
  timeBudget: string
): string {
  const essential = entries.filter((e) => e.tier === "essential").length;
  const total = entries.length;
  const skipped = entries.filter((e) => e.tier === "skip").length;

  return (
    `Just planned my ${franchise} watch journey on ChronoFlow 🎯\n\n` +
    `📺 ${essential}/${total} essential entries\n` +
    `⏱ ${timeBudget} budget\n` +
    `🚫 ${skipped} smart skips identified\n\n` +
    `Never watch anime wrong again → chronoflow.app`
  );
}

// Compress data for URL sharing (base64 encode)
export function compressToUrl(data: any): string {
  const json = JSON.stringify(data);
  if (typeof window !== "undefined") {
    return btoa(encodeURIComponent(json));
  }
  return Buffer.from(json).toString("base64");
}

// Decompress from URL hash
export function decompressFromUrl(str: string): any {
  try {
    if (typeof window !== "undefined") {
      return JSON.parse(decodeURIComponent(atob(str)));
    }
    return JSON.parse(Buffer.from(str, "base64").toString());
  } catch {
    return null;
  }
}

/**
 * Safely extracts and cleans a JSON string returned by an LLM,
 * removing markdown wrappers or surrounding conversational text.
 */
export function cleanJsonString(raw: string): string {
  let clean = raw.trim();
  
  // Find the boundaries of the first JSON object block
  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  
  return clean;
}
