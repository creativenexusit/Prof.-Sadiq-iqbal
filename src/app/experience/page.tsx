import { getProfile, getAcademicItems } from '@/lib/data';
import PortfolioShell from '@/components/home/PortfolioShell';
import ExperienceClient from './ExperienceClient';

export const metadata = {
  title: 'Experience & Academic Timeline | Prof. Sadiq Iqbal',
  description:
    'Academic leadership, university administrative appointments, teaching courses, and engineering career history of Prof. Sadiq Iqbal.',
  alternates: {
    canonical: '/experience',
  },
  openGraph: {
    title: 'Experience & Leadership Timeline | Prof. Sadiq Iqbal',
    description:
      'Explore 32+ years of academic leadership, department chairmanship, and higher education teaching.',
    url: '/experience',
    type: 'website',
    images: [
      {
        url: '/prof-portrait.png',
        width: 1200,
        height: 630,
        alt: 'Prof. Sadiq Iqbal Experience & Career Journey',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Experience & Academic Timeline | Prof. Sadiq Iqbal',
    description:
      '32+ years of academic appointments, CSE department leadership, and teaching courses.',
    images: ['/prof-portrait.png'],
  },
};

export default async function ExperiencePage() {
  const [profile, teachingItems] = await Promise.all([
    getProfile(),
    getAcademicItems({ category: 'teaching' }),
  ]);

  return (
    <PortfolioShell profile={profile}>
      <ExperienceClient profile={profile} teachingItems={teachingItems} />
    </PortfolioShell>
  );
}
