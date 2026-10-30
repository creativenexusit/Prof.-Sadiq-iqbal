'use server';

import { getAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Faq } from '@/models/Faq';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized: Admin access required.');
}

export async function getFaqsAdmin() {
  await checkAuth();
  await connectDB();
  const items = await Faq.find().sort({ category: 1, order: 1, createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(items));
}

export async function saveFaqAdmin(data: Record<string, unknown>, id?: string) {
  await checkAuth();
  await connectDB();

  if (id) {
    await Faq.findByIdAndUpdate(id, data, { new: true });
  } else {
    await Faq.create(data);
  }

  revalidatePath('/admin/faq');
  revalidatePath('/faq');
  revalidatePath('/');

  return { success: true, message: 'FAQ saved successfully!' };
}

export async function deleteFaqAdmin(id: string) {
  await checkAuth();
  await connectDB();

  const item = await Faq.findById(id);
  if (item?.pdfFile?.publicId) {
    await deleteFromCloudinary(item.pdfFile.publicId, 'raw');
  }

  await Faq.findByIdAndDelete(id);

  revalidatePath('/admin/faq');
  revalidatePath('/faq');

  return { success: true, message: 'FAQ deleted successfully!' };
}

export async function uploadFaqPdfAdmin(formData: FormData) {
  await checkAuth();

  const file = formData.get('file') as File;
  if (!file) return { success: false, error: 'No file provided' };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const result = await uploadToCloudinary(buffer, 'faq_documents', 'raw');
    return {
      success: true,
      url: result.url,
      publicId: result.publicId,
      fileName: file.name,
    };
  } catch (error) {
    console.error('FAQ PDF upload error:', error);
    return { success: false, error: 'Failed to upload PDF' };
  }
}
