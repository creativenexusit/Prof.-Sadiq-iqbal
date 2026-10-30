import { getProfile, getAcademicItems } from '@/lib/data';
import PortfolioShell from '@/components/home/PortfolioShell';
import ResearchClient from './ResearchClient';

export const metadata = {
  title: 'Research & Innovation | Prof. Sadiq Iqbal',
  description:
    'Research focus areas, funded initiatives, patents, keynote talks, and computing paradigms investigated by Prof. Sadiq Iqbal in Machine Learning and Telemedicine.',
  alternates: {
    canonical: '/research',
  },
  openGraph: {
    title: 'Research & Innovation Labs | Prof. Sadiq Iqbal',
    description:
      'Investigating Machine Learning, Explainable AI, Network Security, and Telemedicine frameworks.',
    url: '/research',
    type: 'website',
    images: [
      {
        url: '/prof-portrait.png',
        width: 1200,
        height: 630,
        alt: 'Research Initiatives of Prof. Sadiq Iqbal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research & Innovation | Prof. Sadiq Iqbal',
    description:
      'Funded projects, algorithmic breakthroughs, and keynote talks in Explainable AI.',
    images: ['/prof-portrait.png'],
  },
};

export default async function ResearchPage() {
  const [profile, projects, patents, talks] = await Promise.all([
    getProfile(),
    getAcademicItems({ category: 'project' }),
    getAcademicItems({ category: 'patent' }),
    getAcademicItems({ category: 'talk' }),
  ]);

  return (
    <PortfolioShell profile={profile}>
      <ResearchClient
        projects={projects}
        patents={patents}
        talks={talks}
      />
    </PortfolioShell>
  );
}
