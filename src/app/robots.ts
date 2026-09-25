import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aniwatchorder.cc';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Standard search engines — explicitly and unambiguously allowed
      {
        userAgent: ['Googlebot', 'Bingbot', 'Applebot'],
        allow: '/',
        disallow: ['/api/'],
      },
      // AI crawlers — allow them too if the goal is LLM/answer-engine visibility
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'ChatGPT-User'],
        allow: '/',
        disallow: ['/api/'],
      },
      // Everything else
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
