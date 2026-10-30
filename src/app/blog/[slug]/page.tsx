import { notFound } from 'next/navigation';
import { getProfile, getBlogPostBySlug, getBlogPosts } from '@/lib/data';
import PortfolioShell from '@/components/home/PortfolioShell';
import BlogDetailClient from './BlogDetailClient';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found | Prof. Sadiq Iqbal',
    };
  }

  return {
    title: `${post.title} | Prof. Sadiq Iqbal`,
    description: post.excerpt,
    keywords: [post.category, ...(post.tags || []), 'Md. Sadiq Iqbal', 'Academic Research'],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      authors: [post.author],
      publishedTime: post.date,
      images: post.image ? [{ url: post.image }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [profile, post, allPosts] = await Promise.all([
    getProfile(),
    getBlogPostBySlug(slug),
    getBlogPosts(6),
  ]);

  if (!post) {
    notFound();
  }

  // Filter out current post for other recommendations
  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 2);

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sadiquiqbal.com').replace(/\/$/, '');
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author || profile?.fullName || 'Prof. Md. Sadiq Iqbal',
    },
    datePublished: post.date,
    image: post.image ? (post.image.startsWith('http') ? post.image : `${siteUrl}${post.image}`) : `${siteUrl}/prof-portrait.png`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  };

  return (
    <PortfolioShell profile={profile}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BlogDetailClient post={post} relatedPosts={relatedPosts} />
    </PortfolioShell>
  );
}
