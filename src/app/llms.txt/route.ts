import { SEO_FRANCHISES } from '@/lib/seo/franchises';

export function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aniwatchorder.cc';
  
  const franchiseUrls = SEO_FRANCHISES.map(f => 
    `- ${f.name}: ${siteUrl}/watch-order/${f.slug}`
  ).join('\n');

  const content = `# MyAniWatchOrder

> MyAniWatchOrder is an AI-powered anime watch order generator that maps AniList's verified relation edges into deterministic timelines. It prevents AI hallucinations by grounding all generated watch orders in verified database IDs.

## Key Pages
- Homepage: ${siteUrl}/
- About: ${siteUrl}/about

## Top Franchise Watch Order Guides (Ground Truth)
 ${franchiseUrls}
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
