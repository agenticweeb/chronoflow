'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  src?: string
  alt: string
  franchise?: string
  className?: string
  ratio?: 'portrait' | 'landscape' | 'square'
}

const ASPECTS = {
  portrait:  'aspect-[2/3]',
  landscape: 'aspect-[3/2]',
  square:    'aspect-square',
}

function monogram(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3) || '?'
}

function hueFor(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h % 360
}

const BRAND_HUE = 258 // Matches your --chrono-primary violet color hue (~258deg)

export function SuggestionImage({
  src,
  alt,
  franchise = '',
  className,
  ratio = 'portrait',
}: Props) {
  const [errored, setErrored] = useState(false)
  const onError = useCallback(() => setErrored(true), [])

  if (!src || errored) {
    const initials = monogram(franchise || alt || '?')
    const hue = (BRAND_HUE + hueFor(franchise || alt) * 0.5) % 360
    const accentHue = (hue + 60) % 360
    return (
      <div
        role="img"
        aria-label={`Cover for ${franchise || alt || 'unknown'}`}
        className={cn(
          ASPECTS[ratio],
          'relative grid place-items-center overflow-hidden rounded-lg',
          'bg-zinc-900 ring-1 ring-white/10',
          className,
        )}
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 20%, hsl(${hue} 70% 35% / 0.6), transparent 60%),
            radial-gradient(circle at 70% 80%, hsl(${accentHue} 70% 30% / 0.4), transparent 65%),
            linear-gradient(135deg, hsl(${hue} 40% 12%), #0a0a0f)
          `,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),transparent_60%)]"
        />
        <span
          className="relative font-bold tracking-tight text-white/90 select-none animate-fade-in"
          style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}
        >
          {initials}
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
        />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={onError}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={cn(ASPECTS[ratio], 'object-cover rounded-lg', className)}
    />
  )
}
