import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSpecialProjectsAdmin } from '@/app/actions/specialProjectCrud';
import SpecialProjectsManager from './SpecialProjectsManager';

export const metadata = {
  title: 'Special Projects | Admin Portal',
};

export default async function AdminSpecialProjectsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  const projects = await getSpecialProjectsAdmin();

  return <SpecialProjectsManager initialProjects={projects} />;
}

