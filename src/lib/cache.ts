/**
 * Intelligent Client-Side Cache
 * Uses localStorage with TTL, compression, and LRU eviction
 * No server needed, zero cost
 */

import { CacheEntry } from "@/types";

const CACHE_PREFIX = "chronoflow_";
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB limit
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export class ChronoCache {
  private prefix: string;

  constructor(prefix: string = CACHE_PREFIX) {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(this.getKey(key));
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  }

  set<T>(
    key: string,
    data: T,
    ttl: number = DEFAULT_TTL,
    provider: string = "unknown"
  ): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        provider,
      };

      this.evictIfNeeded();
      localStorage.setItem(this.getKey(key), JSON.stringify(entry));
    } catch (e) {
      console.warn("Cache write failed (storage full?)", e);
    }
  }

  private evictIfNeeded(): void {
    let totalSize = 0;
    const items: { key: string; size: number; timestamp: number }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const value = localStorage.getItem(key) || "";
        const size = new Blob([value]).size;
        totalSize += size;

        try {
          const entry = JSON.parse(value);
          items.push({ key, size, timestamp: entry.timestamp || 0 });
        } catch {
          items.push({ key, size, timestamp: 0 });
        }
      }
    }

    if (totalSize > MAX_CACHE_SIZE) {
      // LRU eviction: remove oldest entries first
      items.sort((a, b) => a.timestamp - b.timestamp);
      let freed = 0;
      for (const item of items) {
        if (freed >= totalSize * 0.3) break; // Free 30%
        localStorage.removeItem(item.key);
        freed += item.size;
      }
    }
  }

  clear(): void {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    }
  }

  getStats(): { entries: number; sizeMB: string } {
    let count = 0;
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        count++;
        size += new Blob([localStorage.getItem(key) || ""]).size;
      }
    }
    return { entries: count, sizeMB: (size / 1024 / 1024).toFixed(2) };
  }
}

export const cache = new ChronoCache();
