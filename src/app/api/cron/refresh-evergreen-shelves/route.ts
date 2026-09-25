import { NextResponse } from 'next/server';
import { fetchShelfPage } from '@/lib/discover/shelf-service';

// These shelves barely change day-to-day — pre-computing them
// means the read path (user visiting Discover) never hits AniList.
const EVERGREEN_SHELF_IDS = [
  'underrated-gems',
  'gateway',
  'movie-night',
  'hidden-classics',
] as const;

export async function GET(request: Request) {
  // Vercel signs cron requests with this header — reject anything else
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  console.log('[CRON] Refreshing evergreen shelves...');

  const results = await Promise.allSettled(
    EVERGREEN_SHELF_IDS.map(async (id) => {
      // Fetch page 1 — this populates the Redis cache with a fresh TTL
      const data = await fetchShelfPage(id, 1);
      console.log(`[CRON] Refreshed ${id}: ${data.cards.length} cards`);
      return { id, cards: data.cards.length };
    })
  );

  const succeeded = results.filter(r => r.status === 'fulfilled').map(r => 
    (r as PromiseFulfilledResult<{ id: string; cards: number }>).value
  );
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`[CRON] Done: ${succeeded.length} succeeded, ${failed} failed`);

  return NextResponse.json({
    ok: failed === 0,
    refreshed: succeeded,
    failures: failed,
    timestamp: new Date().toISOString(),
  });
}
