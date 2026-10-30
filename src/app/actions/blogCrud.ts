'use server';

import { getAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { BlogPost } from '@/models/BlogPost';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { optimizeUploadedImage } from '@/lib/imageOptimizer';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized: Admin access required.');
}

export async function getBlogPostsAdmin() {
  await checkAuth();
  await connectDB();
  const items = await BlogPost.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(items));
}

export async function getBlogPostByIdAdmin(id: string) {
  await checkAuth();
  await connectDB();
  const item = await BlogPost.findById(id).lean();
  return item ? JSON.parse(JSON.stringify(item)) : null;
}

export async function saveBlogPostAdmin(data: Record<string, unknown>, id?: string) {
  await checkAuth();
  await connectDB();

  if (id) {
    await BlogPost.findByIdAndUpdate(id, data, { new: true });
  } else {
    await BlogPost.create(data);
  }

  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  revalidatePath('/');
  if (data.slug) {
    revalidatePath(`/blog/${data.slug}`);
  }

  return { success: true, message: 'Blog post saved successfully!' };
}

export async function deleteBlogPostAdmin(id: string) {
  await checkAuth();
  await connectDB();

  const item = await BlogPost.findById(id);
  if (item?.image?.publicId) {
    await deleteFromCloudinary(item.image.publicId);
  }

  await BlogPost.findByIdAndDelete(id);

  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  revalidatePath('/');

  return { success: true, message: 'Blog post deleted successfully!' };
}

export async function uploadBlogImageAdmin(formData: FormData) {
  await checkAuth();

  const file = formData.get('file') as File;
  if (!file) return { success: false, error: 'No file provided' };

  const bytes = await file.arrayBuffer();
  let buffer = Buffer.from(bytes);

  try {
    const optimized = await optimizeUploadedImage(buffer, 'thumbnail', false);
    buffer = Buffer.from(optimized.webpBuffer);
  } catch (err) {
    console.warn('Image optimization skipped, using raw buffer:', err);
  }

  try {
    const result = await uploadToCloudinary(buffer, 'academic_portfolio/blog', 'thumbnail');
    return {
      success: true,
      url: result.url,
      publicId: result.publicId,
    };
  } catch (error) {
    console.error('Blog image upload error:', error);
    return { success: false, error: 'Failed to upload image to Cloudinary' };
  }
}
