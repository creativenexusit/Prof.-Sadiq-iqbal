import { getProfile, getBlogPosts } from '@/lib/data';
import PortfolioShell from '@/components/home/PortfolioShell';
import BlogClient from './BlogClient';

export const metadata = {
  title: 'Blog & Academic Insights | Prof. Md. Sadiq Iqbal',
  description:
    'Scholarly reflections, articles, technical commentaries, and computer science educational guides by Prof. Md. Sadiq Iqbal.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog & Academic Insights | Prof. Md. Sadiq Iqbal',
    description:
      'Scholarly reflections, articles, and technical commentary on AI, research methodology, and computing innovation.',
    url: '/blog',
    type: 'website',
    images: [
      {
        url: '/prof-portrait.png',
        width: 1200,
        height: 630,
        alt: 'Prof. Md. Sadiq Iqbal Blog & Insights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog & Academic Insights | Prof. Md. Sadiq Iqbal',
    description:
      'Technical commentary, research analysis, and educational essays by Prof. Md. Sadiq Iqbal.',
    images: ['/prof-portrait.png'],
  },
};

export default async function BlogPage() {
  const profile = await getProfile();
  const blogPosts = await getBlogPosts(20);

  return (
    <PortfolioShell profile={profile}>
      <BlogClient blogPosts={blogPosts} />
    </PortfolioShell>
  );
}
