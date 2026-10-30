import { getAdminSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getSpecialProjectByIdAdmin } from '@/app/actions/specialProjectCrud';
import SpecialProjectEditorForm from '@/components/admin/SpecialProjectEditorForm';

export const metadata = {
  title: 'Edit Special Project | Admin Portal',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditSpecialProjectPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const project = await getSpecialProjectByIdAdmin(id);

  if (!project) {
    notFound();
  }

  const plainProject = JSON.parse(JSON.stringify(project));

  return <SpecialProjectEditorForm initialData={plainProject} isNew={false} />;
}

