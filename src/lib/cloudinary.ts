import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ─────────────────────────────────────────────────────────────
//  IMAGE UPLOAD PROFILES
//  Format:  AVIF (primary) → WebP (fallback)
//  Quality: 70–85 depending on image type
//  Sizes:   Hero 100–200 KB | Portrait 20–60 KB | Thumbnail 30–80 KB
// ─────────────────────────────────────────────────────────────

export type ImageProfile =
  | 'hero'        // Hero / banner images  → max 1920px, quality 80
  | 'portrait'    // Professor / person portraits → max 800px, quality 78
  | 'thumbnail'   // Blog/publication thumbnails → max 600px, quality 75
  | 'logo'        // Logo / icon → keep original + WebP, quality 90
  | 'document'    // PDF / raw file → no image transform
  | 'raw'         // Alias for document
  | 'general';    // Fallback → max 1200px, quality 80

interface ProfileConfig {
  width: number;
  quality: number;
  /** crop strategy */
  crop: string;
  gravity?: string;
}

const PROFILE_CONFIG: Record<Exclude<ImageProfile, 'document' | 'raw'>, ProfileConfig> = {
  hero: {
    width: 1920,
    quality: 80,
    crop: 'limit',
  },
  portrait: {
    width: 800,
    quality: 78,
    crop: 'fill',
    gravity: 'face',
  },
  thumbnail: {
    width: 600,
    quality: 75,
    crop: 'fill',
    gravity: 'center',
  },
  logo: {
    width: 400,
    quality: 90,
    crop: 'limit',
  },
  general: {
    width: 1200,
    quality: 80,
    crop: 'limit',
  },
};

/**
 * Build Cloudinary eager transformation array.
 * Primary: AVIF  •  Fallback: WebP  •  both losslessly optimised
 */
function buildEagerTransforms(profile: ProfileConfig) {
  const base = {
    width: profile.width,
    crop: profile.crop,
    ...(profile.gravity ? { gravity: profile.gravity } : {}),
    fetch_format: 'auto',      // Cloudinary auto-selects best format
    quality: 'auto:best',      // Cloudinary quality AI within our range
  };

  return [
    // AVIF — smallest file size, best quality ratio
    { ...base, format: 'avif', quality: profile.quality },
    // WebP — universal fallback
    { ...base, format: 'webp', quality: Math.min(profile.quality + 5, 85) },
  ];
}

export interface UploadResult {
  url: string;
  publicId: string;
  bytes?: number;
  format?: string;
  /** AVIF eager URL (preferred) */
  avifUrl?: string;
  /** WebP eager URL (fallback) */
  webpUrl?: string;
  width?: number;
  height?: number;
}

/**
 * Upload an image/file to Cloudinary with automatic AVIF + WebP optimisation.
 *
 * @param fileBuffer  Raw file bytes
 * @param folder      Cloudinary folder path
 * @param profile     Upload profile controlling size & quality
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = 'academic_portfolio',
  profile: ImageProfile = 'general'
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const isDocument = profile === 'document' || profile === 'raw';

    // Documents (PDF, etc.) — no image transforms
    if (isDocument) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'raw',
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            format: result.format,
          });
        }
      );
      uploadStream.end(fileBuffer);
      return;
    }

    const config = PROFILE_CONFIG[profile];
    const eager = buildEagerTransforms(config);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // ─── On-upload transformation: resize + strip metadata ───
        transformation: [
          {
            width: config.width,
            crop: config.crop,
            ...(config.gravity ? { gravity: config.gravity } : {}),
            quality: config.quality,
            fetch_format: 'auto',
            // Strip EXIF metadata to reduce file size
            flags: 'strip_profile',
          },
        ],
        // ─── Eagerly generate AVIF + WebP variants immediately ───
        eager,
        eager_async: false,           // Wait for variants to be ready
        eager_notification_url: '',   // No webhook needed
        // ─── Overwrite same public_id if re-uploaded ───
        invalidate: true,
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));

        const avifEager = result.eager?.find(
          (e: { format?: string }) => e.format === 'avif'
        );
        const webpEager = result.eager?.find(
          (e: { format?: string }) => e.format === 'webp'
        );

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
          avifUrl: avifEager?.secure_url,
          webpUrl: webpEager?.secure_url,
          width: result.width,
          height: result.height,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Get the best available URL for an image.
 * Priority: AVIF → WebP → original
 */
export function getBestImageUrl(result: UploadResult): string {
  return result.avifUrl || result.webpUrl || result.url;
}

/**
 * Transform an existing Cloudinary URL to serve as AVIF.
 * Works by injecting Cloudinary transformation parameters into the URL.
 */
export function toAvifUrl(cloudinaryUrl: string, width?: number, quality = 80): string {
  if (!cloudinaryUrl.includes('res.cloudinary.com')) return cloudinaryUrl;
  const transforms = `f_avif,q_${quality}${width ? `,w_${width},c_limit` : ''}`;
  // Insert transform after /upload/
  return cloudinaryUrl.replace('/upload/', `/upload/${transforms}/`);
}

/**
 * Transform an existing Cloudinary URL to serve as WebP.
 */
export function toWebpUrl(cloudinaryUrl: string, width?: number, quality = 82): string {
  if (!cloudinaryUrl.includes('res.cloudinary.com')) return cloudinaryUrl;
  const transforms = `f_webp,q_${quality}${width ? `,w_${width},c_limit` : ''}`;
  return cloudinaryUrl.replace('/upload/', `/upload/${transforms}/`);
}

/**
 * Delete an asset from Cloudinary.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'raw' | 'video' = 'image'
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error deleting asset from Cloudinary:', error);
  }
}

export default cloudinary;
