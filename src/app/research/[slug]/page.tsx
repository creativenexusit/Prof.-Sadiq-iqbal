import { notFound } from 'next/navigation';
import { getProfile, getAcademicItemBySlug, getAcademicItems } from '@/lib/data';
import PortfolioShell from '@/components/home/PortfolioShell';
import ResearchDetailClient from './ResearchDetailClient';

interface ResearchDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ResearchDetailPageProps) {
  const { slug } = await params;
  const item = await getAcademicItemBySlug(slug);

  if (!item) {
    return {
      title: 'Research Item Not Found | Prof. Sadiq Iqbal',
    };
  }

  return {
    title: `${item.title} | Research & Innovation | Prof. Sadiq Iqbal`,
    description: item.description,
    openGraph: {
      title: item.title,
      description: item.description,
      images: item.image?.url ? [{ url: item.image.url }] : undefined,
    },
  };
}

export default async function ResearchDetailPage({ params }: ResearchDetailPageProps) {
  const { slug } = await params;
  const [profile, item, allProjects] = await Promise.all([
    getProfile(),
    getAcademicItemBySlug(slug),
    getAcademicItems({ category: 'project', limit: 6 }),
  ]);

  if (!item) {
    notFound();
  }

  const relatedItems = allProjects
    .filter((p) => p.slug !== slug)
    .slice(0, 2);

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sadiquiqbal.com').replace(/\/$/, '');
  const researchJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ResearchProject',
    name: item.title,
    description: item.description,
    author: {
      '@type': 'Person',
      name: profile?.fullName || 'Prof. Md. Sadiq Iqbal',
    },
    url: `${siteUrl}/research/${item.slug}`,
    image: item.image?.url ? (item.image.url.startsWith('http') ? item.image.url : `${siteUrl}${item.image.url}`) : `${siteUrl}/prof-portrait.png`,
  };

  return (
    <PortfolioShell profile={profile}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(researchJsonLd) }}
      />
      <ResearchDetailClient item={item} relatedItems={relatedItems} />
    </PortfolioShell>
  );
}

