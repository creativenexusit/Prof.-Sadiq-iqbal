'use server';

import { getAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Profile } from '@/models/Profile';
import { Publication } from '@/models/Publication';
import { AcademicItem } from '@/models/AcademicItem';
import { uploadToCloudinary, deleteFromCloudinary, type ImageProfile } from '@/lib/cloudinary';
import { optimizeUploadedImage, type ImageCategory } from '@/lib/imageOptimizer';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized: Admin access required.');
  }
}

// ─── Map folder paths → image profiles (controls quality + size) ───
const FOLDER_TO_PROFILE: Record<string, ImageProfile> = {
  'academic_portfolio/avatar':      'portrait',   // 20–60 KB, face-crop
  'academic_portfolio/documents':   'document',   // PDF raw
  'academic_portfolio/publications': 'thumbnail', // 30–80 KB
  'academic_portfolio/items':       'thumbnail',  // 30–80 KB
  'academic_portfolio/hero':        'hero',       // 100–200 KB
  'academic_portfolio/logo':        'logo',       // 90% quality, small
  'academic_portfolio/special_projects': 'thumbnail', // 30–80 KB
};

function resolveProfile(folder: string, isPdf: boolean): ImageProfile {
  if (isPdf) return 'document';
  return FOLDER_TO_PROFILE[folder] || 'general';
}

// ─────────────────────────────────────────────────────────────
//  1. Profile Update
// ─────────────────────────────────────────────────────────────
export async function updateProfileAdmin(profileData: Record<string, unknown>) {
  await checkAuth();

  try {
    await connectDB();

    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile(profileData);
    } else {
      Object.assign(profile, profileData);
    }
    await profile.save();

    // Revalidate whole website so changes are immediately live everywhere
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/portfolio');
    revalidatePath('/research');
    revalidatePath('/contact');
    revalidatePath('/events');
    revalidatePath('/experience');
    revalidatePath('/blog');
    revalidatePath('/admin');
    revalidatePath('/admin/profile');
    revalidatePath('/login');

    return { success: true, message: 'Profile updated successfully across the entire website!' };
  } catch (err: unknown) {
    console.error('updateProfileAdmin error:', err);
    return {
      success: false,
      error: 'Database connection failed. Please ensure MongoDB is running and connected.',
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  2. Publication CRUD
// ─────────────────────────────────────────────────────────────
export async function savePublicationAdmin(data: Record<string, unknown>, id?: string) {
  await checkAuth();
  await connectDB();

  if (id) {
    await Publication.findByIdAndUpdate(id, data, { new: true });
  } else {
    await Publication.create(data);
  }

  revalidatePath('/publications');
  revalidatePath('/research');
  revalidatePath('/');
  revalidatePath('/admin/publications');

  return { success: true, message: 'Publication saved successfully!' };
}

export async function deletePublicationAdmin(id: string) {
  await checkAuth();
  await connectDB();

  const item = await Publication.findById(id);
  if (item?.coverImage?.publicId) {
    await deleteFromCloudinary(item.coverImage.publicId);
  }
  if (item?.pdfFile?.publicId) {
    await deleteFromCloudinary(item.pdfFile.publicId, 'raw');
  }

  await Publication.findByIdAndDelete(id);

  revalidatePath('/publications');
  revalidatePath('/research');
  revalidatePath('/admin/publications');

  return { success: true, message: 'Publication deleted successfully!' };
}

// ─────────────────────────────────────────────────────────────
//  3. AcademicItem CRUD
// ─────────────────────────────────────────────────────────────
export async function saveAcademicItemAdmin(data: Record<string, unknown>, id?: string) {
  await checkAuth();
  await connectDB();

  if (id) {
    await AcademicItem.findByIdAndUpdate(id, data, { new: true });
  } else {
    await AcademicItem.create(data);
  }

  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/portfolio');
  revalidatePath('/research');
  revalidatePath('/experience');
  revalidatePath('/events');
  revalidatePath('/blog');
  revalidatePath('/contact');
  revalidatePath('/admin/items');

  return { success: true, message: 'Item saved successfully!' };
}

export async function deleteAcademicItemAdmin(id: string) {
  await checkAuth();
  await connectDB();

  const item = await AcademicItem.findById(id);
  if (item?.image?.publicId) {
    await deleteFromCloudinary(item.image.publicId);
  }

  await AcademicItem.findByIdAndDelete(id);

  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/portfolio');
  revalidatePath('/research');
  revalidatePath('/experience');
  revalidatePath('/events');
  revalidatePath('/blog');
  revalidatePath('/contact');
  revalidatePath('/admin/items');

  return { success: true, message: 'Item deleted successfully!' };
}

// ─────────────────────────────────────────────────────────────
//  4. Cloudinary Upload Server Action
//     Automatically applies AVIF + WebP transforms based on folder
// ─────────────────────────────────────────────────────────────
export async function uploadMediaAdmin(formData: FormData) {
  await checkAuth();

  const file = formData.get('file') as File;
  const folder = (formData.get('folder') as string) || 'academic_portfolio';

  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  // ─── Validate file type ───
  const allowedImageTypes = [
    'image/jpeg', 'image/png', 'image/webp',
    'image/avif', 'image/gif', 'image/svg+xml',
  ];
  const allowedDocTypes = ['application/pdf'];
  const allAllowed = [...allowedImageTypes, ...allowedDocTypes];

  if (!allAllowed.includes(file.type)) {
    return {
      success: false,
      error: `File type "${file.type}" is not allowed. Use: JPEG, PNG, WebP, AVIF, or PDF.`,
    };
  }

  // ─── Validate file size (max 20 MB raw upload) ───
  const MAX_BYTES = 20 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return { success: false, error: 'File too large. Maximum size is 20 MB.' };
  }

  const isPdf = file.type === 'application/pdf';
  const isSvg = file.type === 'image/svg+xml';
  const profile = resolveProfile(folder, isPdf);

  const bytes = await file.arrayBuffer();
  let buffer: Buffer = Buffer.from(bytes);

  // ─── Determine category for target byte size & quality ───
  let category: ImageCategory = 'general';
  if (folder.includes('avatar')) category = 'instructor'; // 20–60 KB
  else if (folder.includes('hero')) category = 'hero'; // 100–200 KB
  else if (
    folder.includes('publications') ||
    folder.includes('items') ||
    folder.includes('thumbnail') ||
    folder.includes('special_projects')
  )
    category = 'thumbnail'; // 30–80 KB
  else if (folder.includes('logo')) category = 'logo';

  let localOptKB = 0;
  if (!isPdf && !isSvg) {
    try {
      const optimized = await optimizeUploadedImage(buffer, category, isSvg);
      buffer = Buffer.from(optimized.webpBuffer);
      localOptKB = optimized.sizeKB;
    } catch (err) {
      console.warn('Local sharp optimization fallback:', err);
    }
  }

  try {
    const result = await uploadToCloudinary(buffer, folder, profile);
    return {
      success: true,
      url: result.url,
      publicId: result.publicId,
      fileName: file.name,
      format: result.format || (isSvg ? 'svg' : 'webp'),
      bytes: result.bytes || buffer.length,
      sizeKB: localOptKB || (result.bytes ? Number((result.bytes / 1024).toFixed(1)) : 0),
      width: result.width,
      height: result.height,
      avifUrl: result.avifUrl,
      webpUrl: result.webpUrl,
    };
  } catch (error) {
    console.error('Upload action error:', error);
    return { success: false, error: 'Failed to upload to Cloudinary' };
  }
}

// ─────────────────────────────────────────────────────────────
//  5. Theme Color Update
// ─────────────────────────────────────────────────────────────
export async function updateThemeColorAdmin(colorHex: string) {
  await checkAuth();
  await connectDB();

  let profile = await Profile.findOne();
  if (profile) {
    profile.themeConfig = {
      ...(profile.themeConfig || {}),
      primaryColor: colorHex,
    };
    await profile.save();
  }

  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/portfolio');
  revalidatePath('/research');
  revalidatePath('/experience');
  revalidatePath('/events');
  revalidatePath('/blog');
  revalidatePath('/contact');
  revalidatePath('/admin');
  revalidatePath('/admin/profile');

  return { success: true, message: 'Theme color updated successfully!' };
}
