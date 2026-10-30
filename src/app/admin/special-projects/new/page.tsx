import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SpecialProjectEditorForm from '@/components/admin/SpecialProjectEditorForm';

export const metadata = {
  title: 'Add Special Project | Admin Portal',
};

export default async function AdminNewSpecialProjectPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  return <SpecialProjectEditorForm isNew={true} />;
}

