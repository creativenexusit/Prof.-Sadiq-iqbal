import { getProfile } from '@/lib/data';
import { getPublicSpecialProjectBySlugOrId } from '@/app/actions/specialProjectCrud';
import PortfolioShell from '@/components/home/PortfolioShell';
import ProjectDetailClient from './ProjectDetailClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const project = await getPublicSpecialProjectBySlugOrId(resolvedParams.slug);

  if (!project) {
    return {
      title: 'Project Not Found | Prof. Md. Sadiq Iqbal',
    };
  }

  const projectUrl = `/projects/${project.slug || project._id}`;
  const imageUrl = project.thumbnail?.url || '/prof-portrait.png';

  return {
    title: `${project.title} | Special Project | Prof. Md. Sadiq Iqbal`,
    description: project.description?.slice(0, 160),
    alternates: {
      canonical: projectUrl,
    },
    openGraph: {
      title: project.title,
      description: project.description?.slice(0, 200),
      url: projectUrl,
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description?.slice(0, 160),
      images: [imageUrl],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const [profile, project] = await Promise.all([
    getProfile().catch(() => null),
    getPublicSpecialProjectBySlugOrId(resolvedParams.slug),
  ]);

  if (!project) {
    notFound();
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sadiquiqbal.com').replace(/\/$/, '');
  const projectJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ResearchProject',
    name: project.title,
    headline: project.subtitle || project.title,
    description: project.description,
    image: project.thumbnail?.url ? (project.thumbnail.url.startsWith('http') ? project.thumbnail.url : `${siteUrl}${project.thumbnail.url}`) : `${siteUrl}/prof-portrait.png`,
    author: {
      '@type': 'Person',
      name: profile?.fullName || 'Prof. Md. Sadiq Iqbal',
      jobTitle: profile?.designation,
      worksFor: {
        '@type': 'EducationalOrganization',
        name: profile?.institution,
      },
    },
    keywords: project.tags?.join(', '),
    url: `${siteUrl}/projects/${project.slug || project._id}`,
  };

  return (
    <PortfolioShell profile={profile}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <ProjectDetailClient project={project} />
    </PortfolioShell>
  );
}

