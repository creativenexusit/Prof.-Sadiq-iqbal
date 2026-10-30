import { getProfile } from '@/lib/data';
import PortfolioShell from '@/components/home/PortfolioShell';
import ContactClient from './ContactClient';

export const metadata = {
  title: 'Contact | Prof. Md. Sadiq Iqbal — Department of CSE',
  description:
    'Contact Prof. Md. Sadiq Iqbal, Professor & Chairman, Department of Computer Science & Engineering, Bangladesh University, Dhaka. Office location, email, and academic inquiry form.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Prof. Md. Sadiq Iqbal | Chairman, Department of CSE',
    description:
      'Official contact information, academic office address, consultation hours, and message portal.',
    url: '/contact',
    type: 'website',
    images: [
      {
        url: '/prof-portrait.png',
        width: 1200,
        height: 630,
        alt: 'Contact Prof. Md. Sadiq Iqbal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Prof. Md. Sadiq Iqbal | Department of CSE',
    description:
      'Professor & Chairman, Department of Computer Science & Engineering, Bangladesh University.',
    images: ['/prof-portrait.png'],
  },
};

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <PortfolioShell profile={profile}>
      <ContactClient profile={profile} />
    </PortfolioShell>
  );
}
