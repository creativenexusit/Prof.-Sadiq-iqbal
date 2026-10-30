import React from 'react';
import { getProfile, getPublications } from '@/lib/data';
import PortfolioShell from '@/components/home/PortfolioShell';
import PortfolioClient from './PortfolioClient';

export const metadata = {
  title: 'Publications & Research Portfolio | Prof. Md. Sadiq Iqbal',
  description:
    'Academic publications, journal articles, and conference proceedings by Prof. Md. Sadiq Iqbal, Chairman of CSE at Bangladesh University.',
  alternates: {
    canonical: '/publications',
  },
  openGraph: {
    title: 'Publications & Research Portfolio | Prof. Md. Sadiq Iqbal',
    description:
      'Peer-reviewed journals, international conference papers, and preprints by Prof. Md. Sadiq Iqbal.',
    url: '/publications',
    type: 'website',
    images: [
      {
        url: '/prof-portrait.png',
        width: 1200,
        height: 630,
        alt: 'Prof. Md. Sadiq Iqbal Publications Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Publications & Research Portfolio | Prof. Md. Sadiq Iqbal',
    description:
      'Academic publications, journal articles, and conference proceedings by Prof. Md. Sadiq Iqbal.',
    images: ['/prof-portrait.png'],
  },
};

export default async function PortfolioPage() {
  const rawProfile = await getProfile();
  const rawPublications = await getPublications({ limit: 100 });

  const profile = JSON.parse(JSON.stringify(rawProfile));
  const publications = JSON.parse(JSON.stringify(rawPublications));

  return (
    <PortfolioShell profile={profile}>
      <head>
        {publications.slice(0, 10).map((pub: any, idx: number) => (
          <React.Fragment key={idx}>
            <meta name="citation_title" content={pub.title} />
            <meta name="citation_author" content={pub.authors?.[0] || profile.fullName} />
            <meta name="citation_publication_date" content={pub.year ? `${pub.year}/01/01` : '2024/01/01'} />
            {pub.journalOrPublisher && (
              <meta name="citation_journal_title" content={pub.journalOrPublisher} />
            )}
            {pub.doi && (
              <meta name="citation_doi" content={pub.doi.replace(/^https?:\/\/doi\.org\//, '')} />
            )}
          </React.Fragment>
        ))}
      </head>
      <PortfolioClient publications={publications} />
    </PortfolioShell>
  );
}
