import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { mediaId, tier } = await request.json();
    
    if (!mediaId || !tier || !['essential', 'recommended', 'optional', 'skip'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid vote data' }, { status: 400 });
    }

    // Get IP for rate limiting (1 vote per IP per mediaId per hour)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `vote_rl:${mediaId}:${ip}`;
    
    const isRateLimited = await redis.get(rateLimitKey);
    if (isRateLimited) {
      return NextResponse.json({ error: 'Already voted recently' }, { status: 429 });
    }

    // Increment the vote count in a Redis sorted set (hash) for this mediaId
    const voteKey = `votes:${mediaId}`;
    await redis.hincrby(voteKey, tier, 1);
    
    // Set rate limit for 1 hour
    await redis.set(rateLimitKey, '1', { ex: 3600 });

    // Fetch updated totals
    const votes = await redis.hgetall(voteKey);
    const totalVotes = Object.values(votes || {}).reduce((sum: number, val: string) => sum + parseInt(val, 10), 0);

    return NextResponse.json({ success: true, votes, totalVotes });
  } catch (error) {
    console.error('Vote API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Fetch votes for a specific mediaId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');
    
    if (!mediaId) return NextResponse.json({ error: 'Missing mediaId' }, { status: 400 });

    const votes = await redis.hgetall(`votes:${mediaId}`);
    const totalVotes = Object.values(votes || {}).reduce((sum: number, val: string) => sum + parseInt(val, 10), 0);

    return NextResponse.json({ success: true, votes, totalVotes });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
