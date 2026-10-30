import { getProfile, getAcademicItems, getFaqsPublic } from '@/lib/data';
import PortfolioShell from '@/components/home/PortfolioShell';
import StudentsClient from './StudentsClient';

export const metadata = {
  title: 'Students & Research Lab | Prof. Md. Sadiq Iqbal',
  description:
    'Research lab members, supervised undergraduate & graduate thesis candidates, student advising, and academic FAQ by Prof. Md. Sadiq Iqbal.',
  alternates: {
    canonical: '/students',
  },
  openGraph: {
    title: 'Students & Research Lab | Prof. Md. Sadiq Iqbal',
    description:
      'Research mentorship, thesis candidates, lab alumni, and prospective student guidance by Prof. Md. Sadiq Iqbal.',
    url: '/students',
    type: 'website',
    images: [
      {
        url: '/prof-portrait.png',
        width: 1200,
        height: 630,
        alt: 'Prof. Md. Sadiq Iqbal Student Mentorship & Research Lab',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Students & Research Lab | Prof. Md. Sadiq Iqbal',
    description:
      'Supervised students, research team members, and student FAQs at Bangladesh University.',
    images: ['/prof-portrait.png'],
  },
};

export default async function StudentsPage() {
  const [profile, labMembers, supervisions, faqs] = await Promise.all([
    getProfile(),
    getAcademicItems({ category: 'lab_member' }),
    getAcademicItems({ category: 'supervision' }),
    getFaqsPublic(),
  ]);

  return (
    <PortfolioShell profile={profile}>
      <StudentsClient
        labMembers={labMembers}
        supervisions={supervisions}
        faqs={faqs}
      />
    </PortfolioShell>
  );
}

