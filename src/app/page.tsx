import { getProfile } from '@/lib/data';
import { getPublicSpecialProjects } from '@/app/actions/specialProjectCrud';
import { initialSpecialProjectsData } from '@/lib/seedData';
import PortfolioShell from '@/components/home/PortfolioShell';
import HomeHero from './HomeHero';
import SpecialProjectShowcase from '@/components/home/SpecialProjectShowcase';

export const metadata = {
  title: 'Prof. Sadiq Iqbal | Professor & Chairman, CSE, Bangladesh University',
  description:
    'Official academic portfolio of Prof. Sadiq Iqbal — Professor & Chairman of CSE, Bangladesh University. Specialist in Machine Learning, Explainable AI, Network Security, and Telemedicine.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Prof. Sadiq Iqbal | Academic Leader & AI Researcher',
    description:
      'Official academic portfolio of Prof. Sadiq Iqbal — Professor & Chairman of CSE at Bangladesh University. Machine Learning, Explainable AI, and Telemedicine.',
    url: '/',
    type: 'website',
    images: [
      {
        url: '/prof-portrait.png',
        width: 1200,
        height: 630,
        alt: 'Prof. Sadiq Iqbal - Professor & Chairman, Department of CSE',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prof. Sadiq Iqbal | Academic Portfolio & Research',
    description:
      'Professor & Chairman, Department of Computer Science & Engineering, Bangladesh University.',
    images: ['/prof-portrait.png'],
  },
};

export default async function HomePage() {
  const [profile, dbProjects] = await Promise.all([
    getProfile().catch(() => null),
    getPublicSpecialProjects().catch(() => []),
  ]);

  const specialProjects =
    dbProjects && dbProjects.length > 0 ? dbProjects : initialSpecialProjectsData;

  return (
    <PortfolioShell profile={profile}>
      <HomeHero profile={profile} />
      <SpecialProjectShowcase projects={specialProjects} />
    </PortfolioShell>
  );
}
