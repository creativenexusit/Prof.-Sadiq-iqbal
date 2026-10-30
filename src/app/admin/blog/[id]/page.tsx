import { getAdminSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getBlogPostById, getBlogPostBySlug } from '@/lib/data';
import BlogEditorForm from '@/components/admin/BlogEditorForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditBlogPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  let post = await getBlogPostById(id);
  if (!post) {
    post = await getBlogPostBySlug(id);
  }

  if (!post) {
    notFound();
  }

  const plainPost = JSON.parse(JSON.stringify(post));

  return <BlogEditorForm initialData={plainPost} isNew={false} />;
}

