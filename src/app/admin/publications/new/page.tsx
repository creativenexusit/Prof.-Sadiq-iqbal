import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PublicationEditorForm from '@/components/admin/PublicationEditorForm';

export default async function AdminNewPublicationPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  return <PublicationEditorForm isNew={true} />;
}
