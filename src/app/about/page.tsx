import { getProfile, getAcademicItems } from '@/lib/data';
import PortfolioShell from '@/components/home/PortfolioShell';
import AboutClient from './AboutClient';

export const metadata = {
  title: 'About | Prof. Sadiq Iqbal — Professor & Chairman, CSE',
  description:
    'Academic biography, leadership vision, doctoral background, educational journey, and photo gallery of Prof. Sadiq Iqbal, Professor & Chairman of CSE at Bangladesh University.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Prof. Sadiq Iqbal | Academic Biography & Leadership',
    description:
      'Explore the academic career, vision, and milestones of Prof. Sadiq Iqbal, Chairman of CSE at Bangladesh University.',
    url: '/about',
    type: 'profile',
    images: [
      {
        url: '/prof-portrait.png',
        width: 1200,
        height: 630,
        alt: 'Prof. Sadiq Iqbal Academic Profile',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Prof. Sadiq Iqbal | Chairman of CSE',
    description:
      'Academic leadership, research background, and qualifications of Prof. Sadiq Iqbal.',
    images: ['/prof-portrait.png'],
  },
};

export default async function AboutPage() {
  const [profile, galleryItems] = await Promise.all([
    getProfile(),
    getAcademicItems({ category: 'gallery' }),
  ]);

  return (
    <PortfolioShell profile={profile}>
      <AboutClient profile={profile} galleryItems={galleryItems} />
    </PortfolioShell>
  );
}
