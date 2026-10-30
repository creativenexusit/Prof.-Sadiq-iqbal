'use client';

/**
 * OptimizedImage
 * ─────────────────────────────────────────────────────────────
 * Universal image component that serves:
 *   1. AVIF  (best compression, modern browsers)
 *   2. WebP  (universal fallback)
 *   3. Original (final fallback for old browsers)
 *
 * For Cloudinary URLs: injects f_avif / f_webp transforms.
 * For local /public images: Next.js <Image> handles AVIF/WebP via next.config.ts
 *
 * Usage:
 *   <OptimizedImage src="/prof-portrait.png" alt="..." fill />
 *   <OptimizedImage src="https://res.cloudinary.com/..." alt="..." width={600} height={400} />
 */

import Image, { type ImageProps } from 'next/image';
import { useMemo } from 'react';

type OptimizedImageProps = ImageProps & {
  /** Override quality (default: 80) */
  quality?: number;
  /** Force Cloudinary width transform (for CDN-served AVIF/WebP) */
  cdnWidth?: number;
};

/** Inject Cloudinary transformations into an existing URL */
function toCloudinaryAvif(url: string, width?: number, quality = 80): string {
  if (!url.includes('res.cloudinary.com')) return url;
  // Already has transforms — update them
  if (url.includes('/upload/f_')) {
    return url.replace(/\/upload\/[^/]+\//, `/upload/f_avif,q_${quality}${width ? `,w_${width},c_limit` : ''}/`);
  }
  const transforms = `f_avif,q_${quality}${width ? `,w_${width},c_limit` : ''}`;
  return url.replace('/upload/', `/upload/${transforms}/`);
}

function toCloudinaryWebp(url: string, width?: number, quality = 82): string {
  if (!url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/f_')) {
    return url.replace(/\/upload\/[^/]+\//, `/upload/f_webp,q_${quality}${width ? `,w_${width},c_limit` : ''}/`);
  }
  const transforms = `f_webp,q_${quality}${width ? `,w_${width},c_limit` : ''}`;
  return url.replace('/upload/', `/upload/${transforms}/`);
}

export default function OptimizedImage({
  src,
  alt,
  quality = 80,
  cdnWidth,
  ...props
}: OptimizedImageProps) {
  const srcStr = typeof src === 'string' ? src : '';
  const isCloudinary = srcStr.includes('res.cloudinary.com');

  // For Cloudinary images: use <picture> with AVIF + WebP sources for maximum browser support
  const avifSrc = useMemo(() =>
    isCloudinary ? toCloudinaryAvif(srcStr, cdnWidth, quality) : null,
    [isCloudinary, srcStr, cdnWidth, quality]
  );
  const webpSrc = useMemo(() =>
    isCloudinary ? toCloudinaryWebp(srcStr, cdnWidth, Math.min(quality + 2, 85)) : null,
    [isCloudinary, srcStr, cdnWidth, quality]
  );

  if (isCloudinary && avifSrc && webpSrc) {
    // Use native <picture style={{ display: 'contents' }}> for Cloudinary to guarantee format serving without breaking layout/fill
    return (
      <picture style={{ display: 'contents' }}>
        <source srcSet={avifSrc} type="image/avif" />
        <source srcSet={webpSrc} type="image/webp" />
        {/* Next.js <Image> as the final fallback — handles layout/sizing */}
        <Image
          src={srcStr}
          alt={alt}
          quality={quality}
          {...props}
        />
      </picture>
    );
  }

  // For local /public images: Next.js handles AVIF/WebP automatically
  // via `formats: ['image/avif', 'image/webp']` in next.config.ts
  return (
    <Image
      src={src}
      alt={alt}
      quality={quality}
      {...props}
    />
  );
}

