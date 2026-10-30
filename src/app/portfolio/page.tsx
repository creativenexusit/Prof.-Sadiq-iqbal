import React from 'react';
import { getProfile, getPublications } from '@/lib/data';
import PortfolioShell from '@/components/home/PortfolioShell';
import PortfolioClient from './PortfolioClient';

export async function generateMetadata() {
  const rawProfile = await getProfile();
  const rawPublications = await getPublications({ limit: 10 });
  const otherMeta: Record<string, string> = {};

  if (rawPublications && rawPublications.length > 0) {
    const first = rawPublications[0];
    otherMeta['citation_title'] = first.title;
    otherMeta['citation_author'] = first.authors?.[0] || rawProfile.fullName;
    otherMeta['citation_publication_date'] = first.year ? `${first.year}/01/01` : '2024/01/01';
    if (first.journalOrPublisher) otherMeta['citation_journal_title'] = first.journalOrPublisher;
    if (first.doi) otherMeta['citation_doi'] = first.doi.replace(/^https?:\/\/doi\.org\//, '');
  }

  return {
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
    other: otherMeta,
  };
}

export default async function PortfolioPage() {
  const rawProfile = await getProfile();
  const rawPublications = await getPublications({ limit: 100 });

  const profile = JSON.parse(JSON.stringify(rawProfile));
  const publications = JSON.parse(JSON.stringify(rawPublications));

  return (
    <PortfolioShell profile={profile}>
      <PortfolioClient publications={publications} />
    </PortfolioShell>
  );
}
