'use client';
import { useState } from 'react';
import Image from 'next/image';

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

const PLACEHOLDER = `data:image/svg+xml;base64,${btoa(
  `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="345" viewBox="0 0 230 345"><rect width="230" height="345" fill="#1a1a2e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="14">No Image</text></svg>`
)}`;

export function SafeImage({ src, alt, width, height, className = '', priority = false }: Props) {
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (!failed) {
      setImgSrc(`/api/image-proxy?url=${encodeURIComponent(src)}`);
      setFailed(true);
    } else {
      setImgSrc(PLACEHOLDER);
    }
  };

  const isProxy = imgSrc.startsWith('/api/') || imgSrc.startsWith('data:');

  return (
    <div className="relative h-full w-full">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        priority={priority}
        unoptimized={isProxy}
        onError={handleError}
      />
    </div>
  );
}
