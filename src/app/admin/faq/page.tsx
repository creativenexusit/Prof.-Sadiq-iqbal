import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Faq } from '@/models/Faq';
import FaqManager from './FaqManager';

export default async function AdminFaqPage() {
  const session = await getAdminSession();
  if (!session) redirect('/login');

  let faqs: unknown[] = [];
  try {
    await connectDB();
    const raw = await Faq.find().sort({ category: 1, order: 1, createdAt: -1 }).lean();
    faqs = JSON.parse(JSON.stringify(raw));
  } catch {
    faqs = [];
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <FaqManager initialFaqs={faqs as Record<string, unknown>[]} />
    </div>
  );
}
