import type { MetadataRoute } from 'next';
import { SEO_FRANCHISES } from '@/lib/seo/franchises';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chronoflow-zeta.vercel.app';
  
  // 1. Core static pages
  const staticPages = [
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
  ];

  // 2. The 20 Programmatic SEO Franchise Pages
  const franchisePages = SEO_FRANCHISES.map(franchise => ({
    url: `${baseUrl}/watch-order/${franchise.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...franchisePages];
}
