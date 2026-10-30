import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BlogEditorForm from '@/components/admin/BlogEditorForm';

export default async function AdminNewBlogPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  return <BlogEditorForm isNew={true} />;
}

