import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing required parameter: url', { status: 400 });
  }

  try {
    const targetUrl = new URL(imageUrl);
    const domain = targetUrl.hostname;

    // Simulate browser headers to bypass CDN locks
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    };

    if (domain.includes('myanimelist.net')) {
      headers['Referer'] = 'https://myanimelist.net/';
    } else if (domain.includes('anilist.co')) {
      headers['Referer'] = 'https://anilist.co/';
    }

    const response = await fetch(imageUrl, { headers });

    if (!response.ok) {
      return new NextResponse(`Upstream proxy failure: ${response.statusText}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Image proxy process error:', error);
    return new NextResponse('Proxy Server Error', { status: 500 });
  }
}
