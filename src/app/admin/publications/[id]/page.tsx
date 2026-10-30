import { getAdminSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getPublicationById, getPublicationBySlug } from '@/lib/data';
import PublicationEditorForm from '@/components/admin/PublicationEditorForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditPublicationPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  let publication = await getPublicationById(id);
  if (!publication) {
    publication = await getPublicationBySlug(id);
  }

  if (!publication) {
    notFound();
  }

  const plainPublication = JSON.parse(JSON.stringify(publication));

  return <PublicationEditorForm initialData={plainPublication} isNew={false} />;
}
