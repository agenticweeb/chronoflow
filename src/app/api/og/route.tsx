import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const franchise = searchParams.get('franchise') ?? 'Anime';
    const entries = searchParams.get('entries') ?? '?';
    const hours = searchParams.get('hours') ?? '?';
    const tierProfile = searchParams.get('tier') ?? 'Essential';
    
    const palette = { primary: '#6366f1', accent: '#818cf8' };
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '1200px',
            height: '630px',
            background: '#0a0a0f',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at top right, ${palette.primary}22, transparent 60%)`,
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '60px',
              height: '100%',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '18px', color: palette.accent, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>
                ChronoFlow Watch Order
              </div>
              <div style={{ fontSize: '64px', fontWeight: 800, color: 'white', lineHeight: 1.1, maxWidth: '700px' }}>
                {franchise}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '40px', marginTop: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '48px', fontWeight: 700, color: palette.accent }}>{entries}</div>
                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Entries
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '48px', fontWeight: 700, color: palette.accent }}>{`${hours}h`}</div>
                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Estimated Time
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '48px', fontWeight: 700, color: palette.accent }}>{tierProfile}</div>
                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Tier Profile
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '40px' }}>
              <div style={{ display: 'flex', width: '32px', height: '32px', borderRadius: '8px', background: palette.accent, alignItems: 'center', justifyContent: 'center', color: '#0a0a0f', fontWeight: 800, fontSize: '18px' }}>
                C
              </div>
              <div style={{ display: 'flex', color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
                chronoflow.app
              </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (e) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '1200px', height: '630px', background: '#0a0a0f', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '48px' }}>
          ChronoFlow Watch Order
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
