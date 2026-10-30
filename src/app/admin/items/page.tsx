import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAcademicItems } from '@/lib/data';
import ItemsManager from './ItemsManager';

export default async function AdminItemsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const initialCategory = resolvedParams.category || 'all';

  const items = await getAcademicItems();
  const plainItems = JSON.parse(JSON.stringify(items));

  return (
    <div className="space-y-3 sm:space-y-4 max-w-5xl mx-auto pb-4">
      <ItemsManager initialItems={plainItems} initialCategory={initialCategory} />
    </div>
  );
}
