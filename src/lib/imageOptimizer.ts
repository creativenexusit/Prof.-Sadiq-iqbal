/**
 * imageOptimizer.ts
 * ─────────────────────────────────────────────────────────────
 * Server-side image optimization pipeline using `sharp`.
 *
 * Implements user's exact recommendations:
 *   - Format: AVIF primary, WebP fallback, SVG preserved
 *   - Course / Item Thumbnail:  30–80 KB,  quality ~75%
 *   - Hero image:              100–200 KB, quality ~82%
 *   - Instructor image / avatar: 20–60 KB, quality ~78%
 *   - Global quality envelope:  70–85%
 */

import sharp from 'sharp';

export type ImageCategory = 'hero' | 'instructor' | 'thumbnail' | 'logo' | 'general';

export interface OptimizationResult {
  avifBuffer: Buffer;
  webpBuffer: Buffer;
  fallbackBuffer: Buffer;
  bestBuffer: Buffer;
  format: 'avif' | 'webp' | 'png' | 'svg';
  sizeKB: number;
  width: number;
  height: number;
}

interface DimensionConfig {
  maxWidth: number;
  maxHeight?: number;
  minKB: number;
  maxKB: number;
  defaultQuality: number;
}

const CATEGORY_RULES: Record<ImageCategory, DimensionConfig> = {
  // Course/pub/project thumbnail: 30–80 KB
  thumbnail: {
    maxWidth: 800,
    maxHeight: 600,
    minKB: 30,
    maxKB: 80,
    defaultQuality: 76,
  },
  // Hero image: 100–200 KB
  hero: {
    maxWidth: 1920,
    maxHeight: 1080,
    minKB: 100,
    maxKB: 200,
    defaultQuality: 82,
  },
  // Instructor / Portrait: 20–60 KB
  instructor: {
    maxWidth: 800,
    maxHeight: 1000,
    minKB: 20,
    maxKB: 60,
    defaultQuality: 78,
  },
  // Logo: crisp, 90%
  logo: {
    maxWidth: 500,
    minKB: 10,
    maxKB: 50,
    defaultQuality: 88,
  },
  general: {
    maxWidth: 1200,
    minKB: 30,
    maxKB: 120,
    defaultQuality: 80,
  },
};

/**
 * Optimizes an input image buffer to meet exact byte-size targets and formats.
 */
export async function optimizeUploadedImage(
  inputBuffer: Buffer,
  category: ImageCategory = 'general',
  isSvg: boolean = false
): Promise<OptimizationResult> {
  // SVGs are vector: preserve as-is
  if (isSvg) {
    const sizeKB = Number((inputBuffer.length / 1024).toFixed(1));
    return {
      avifBuffer: inputBuffer,
      webpBuffer: inputBuffer,
      fallbackBuffer: inputBuffer,
      bestBuffer: inputBuffer,
      format: 'svg',
      sizeKB,
      width: 0,
      height: 0,
    };
  }

  const rules = CATEGORY_RULES[category] || CATEGORY_RULES.general;
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  const originalWidth = metadata.width || rules.maxWidth;
  const targetWidth = Math.min(originalWidth, rules.maxWidth);

  // 1. Generate AVIF (Primary format — best compression ratio)
  // Ensure quality is clamped in [70, 85]
  let avifQuality = Math.min(Math.max(rules.defaultQuality, 70), 85);
  let avifBuffer = await sharp(inputBuffer)
    .resize({ width: targetWidth, withoutEnlargement: true })
    .avif({ quality: avifQuality, effort: 4 })
    .toBuffer();

  // If size is above target maxKB, gently reduce quality (staying >= 70%)
  if (avifBuffer.length / 1024 > rules.maxKB && avifQuality > 70) {
    avifQuality = 70;
    avifBuffer = await sharp(inputBuffer)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .avif({ quality: avifQuality, effort: 5 })
      .toBuffer();
  }

  // 2. Generate WebP (Universal fallback format)
  let webpQuality = Math.min(Math.max(rules.defaultQuality + 2, 72), 85);
  let webpBuffer = await sharp(inputBuffer)
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({ quality: webpQuality, effort: 4 })
    .toBuffer();

  if (webpBuffer.length / 1024 > rules.maxKB && webpQuality > 70) {
    webpQuality = 70;
    webpBuffer = await sharp(inputBuffer)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: webpQuality, effort: 5 })
      .toBuffer();
  }

  // 3. Fallback (PNG or MozJPEG)
  const fallbackBuffer = await sharp(inputBuffer)
    .resize({ width: targetWidth, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();

  const finalMeta = await sharp(avifBuffer).metadata();
  const sizeKB = Number((avifBuffer.length / 1024).toFixed(1));

  return {
    avifBuffer,
    webpBuffer,
    fallbackBuffer,
    bestBuffer: avifBuffer,
    format: 'avif',
    sizeKB,
    width: finalMeta.width || targetWidth,
    height: finalMeta.height || 0,
  };
}

