import type { MetadataRoute } from 'next';
import { SEO_FRANCHISES } from '@/lib/seo/franchises';
import { redis } from '@/lib/redis';
import { getCurrentSeasonSlug, getPreviousSeasonSlug } from '@/lib/anilist/get-season-anime';

// Revalidate every hour — reads fresh Redis data (airing titles) without a deploy.
// Without this, Next treats the sitemap as static and freezes it at build time.
export const revalidate = 3600;
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aniwatchorder.cc';

  // 1. Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  // 2. The 20 Programmatic SEO Franchise Pages
  const franchisePages: MetadataRoute.Sitemap = SEO_FRANCHISES.map(franchise => ({
    url: `${baseUrl}/watch-order/${franchise.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // 3. Season pages (current + previous) — content pages targeting
  //    "fall 2026 anime" style queries, self-refreshing via ISR
  const seasonPages: MetadataRoute.Sitemap = [
    getCurrentSeasonSlug(),
    getPreviousSeasonSlug(),
  ].map(slug => ({
    url: `${baseUrl}/season/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // 4. Airing + trending deep-links — from Redis (written by the
  //    refresh-airing-sitemap cron). One entry per currently-airing or
  //    trending show this season. Falls back to empty if cron hasn't run.
  let airingEntries: MetadataRoute.Sitemap = [];
  try {
    const raw = await redis.get('sitemap:airing-titles');
    console.log('[sitemap] Redis raw type:', typeof raw, '| value preview:', JSON.stringify(raw)?.slice(0, 100));

    // The Upstash SDK may auto-deserialize on read — handle BOTH shapes:
    // a raw JSON string (needs parsing) or an already-parsed array
    let titles: string[] = [];
    if (typeof raw === 'string') {
      titles = JSON.parse(raw);
    } else if (Array.isArray(raw)) {
      titles = raw as string[];
    }

    console.log('[sitemap] Airing titles found:', titles.length);

    airingEntries = titles.map(title => ({
      url: `${baseUrl}/?q=${encodeURIComponent(title)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.error('[sitemap] Redis read failed:', e);
    // Redis unavailable — sitemap still serves the static + franchise + season entries
  }

  return [...staticPages, ...franchisePages, ...seasonPages, ...airingEntries];
}
