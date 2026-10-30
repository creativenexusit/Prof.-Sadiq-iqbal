import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { BlogPost } from '@/models/BlogPost';
import { initialBlogPosts } from '@/lib/data';
import BlogManager from './BlogManager';

export default async function AdminBlogPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  let posts: unknown[] = [];
  try {
    await connectDB();
    const raw = await BlogPost.find().sort({ order: 1, createdAt: -1 }).lean();
    if (raw && raw.length > 0) {
      posts = JSON.parse(JSON.stringify(raw));
    }
  } catch {
    posts = [];
  }

  if (posts.length === 0) {
    posts = JSON.parse(
      JSON.stringify(
        initialBlogPosts.map((p, idx) => ({
          ...p,
          _id: `seed-${idx}`,
          image: { url: p.image || '' },
          status: 'published',
          isFeatured: idx === 0,
        }))
      )
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <BlogManager initialPosts={posts as Record<string, unknown>[]} />
    </div>
  );
}

