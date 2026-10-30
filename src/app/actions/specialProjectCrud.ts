'use server';

import { getAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { SpecialProject } from '@/models/SpecialProject';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { initialSpecialProjectsData } from '@/lib/seedData';

async function checkAuth() {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized: Admin access required.');
}

/** Admin: Fetch all special projects */
export async function getSpecialProjectsAdmin() {
  await checkAuth();
  await connectDB();
  const items = await SpecialProject.find().sort({ order: 1, createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(items));
}

/** Admin: Fetch single special project by ID or slug */
export async function getSpecialProjectByIdAdmin(id: string) {
  await checkAuth();
  await connectDB();
  let item = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    item = await SpecialProject.findById(id).lean();
  }
  if (!item) {
    item = await SpecialProject.findOne({ slug: id }).lean();
  }
  return item ? JSON.parse(JSON.stringify(item)) : null;
}

/** Admin: Save (Create / Update) special project */
export async function saveSpecialProjectAdmin(
  data: Record<string, unknown>,
  id?: string
) {
  await checkAuth();
  await connectDB();

  // Auto-generate slug if missing
  if (!data.slug && data.title && typeof data.title === 'string') {
    data.slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  if (id) {
    await SpecialProject.findByIdAndUpdate(id, data, { new: true });
  } else {
    await SpecialProject.create(data);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/special-projects');
  if (data.slug) {
    revalidatePath(`/projects/${data.slug}`);
  }

  return { success: true, message: 'Special project saved successfully!' };
}

/** Admin: Delete special project and its Cloudinary media */
export async function deleteSpecialProjectAdmin(id: string) {
  await checkAuth();
  await connectDB();

  const item = await SpecialProject.findById(id);
  if (item) {
    if (item.thumbnail?.publicId) {
      await deleteFromCloudinary(item.thumbnail.publicId).catch(() => {});
    }
    if (Array.isArray(item.gallery)) {
      for (const img of item.gallery) {
        if (img?.publicId) {
          await deleteFromCloudinary(img.publicId).catch(() => {});
        }
      }
    }
    await SpecialProject.findByIdAndDelete(id);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/special-projects');

  return { success: true, message: 'Special project deleted successfully!' };
}

/** Public: Fetch published special projects for Home page */
export async function getPublicSpecialProjects() {
  try {
    await connectDB();
    const items = await SpecialProject.find({ status: 'published' })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(items));
  } catch (err) {
    console.warn('Error fetching public special projects:', err);
    return [];
  }
}

/** Public: Fetch single special project by slug or ID */
export async function getPublicSpecialProjectBySlugOrId(slugOrId: string) {
  try {
    await connectDB();
    const query = mongoose.isValidObjectId(slugOrId)
      ? { $or: [{ slug: slugOrId }, { _id: slugOrId }] }
      : { slug: slugOrId };

    const item = await SpecialProject.findOne(query).lean();
    if (item) {
      return JSON.parse(JSON.stringify(item));
    }

    // Fallback search in seed data
    const seedItem = initialSpecialProjectsData.find(
      (p) =>
        p.slug === slugOrId ||
        p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slugOrId
    );
    return seedItem ? JSON.parse(JSON.stringify(seedItem)) : null;
  } catch (err) {
    console.warn('Error fetching special project by slug:', err);
    const seedItem = initialSpecialProjectsData.find(
      (p) =>
        p.slug === slugOrId ||
        p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slugOrId
    );
    return seedItem ? JSON.parse(JSON.stringify(seedItem)) : null;
  }
}

