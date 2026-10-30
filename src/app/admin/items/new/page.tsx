import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ItemEditorForm from '@/components/admin/ItemEditorForm';

export default async function AdminNewItemPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const initialCategory = resolvedParams.category || 'gallery';

  return <ItemEditorForm isNew={true} initialCategory={initialCategory} />;
}

