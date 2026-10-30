import { getAdminSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getAcademicItemById, getAcademicItemBySlug } from '@/lib/data';
import ItemEditorForm from '@/components/admin/ItemEditorForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditItemPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  let item = await getAcademicItemById(id);
  if (!item) {
    item = await getAcademicItemBySlug(id);
  }

  if (!item) {
    notFound();
  }

  const plainItem = JSON.parse(JSON.stringify(item));

  return <ItemEditorForm initialData={plainItem} isNew={false} />;
}

