import React from 'react';
import { getProfile, getPublications } from '@/lib/data';
import PortfolioShell from '@/components/home/PortfolioShell';
import PortfolioClient from '@/app/portfolio/PortfolioClient';

export const metadata = {
  title: 'Publications & Scholarly Papers | Prof. Sadiq Iqbal',
  description:
    'Peer-reviewed journals, IEEE and Springer conference papers, citations, and preprints by Prof. Sadiq Iqbal in AI, ML, and Telemedicine.',
  alternates: {
    canonical: '/publications',
  },
  openGraph: {
    title: 'Publications & Scholarly Research | Prof. Sadiq Iqbal',
    description:
      'Explore indexed research publications, journals, conference proceedings, and citations by Prof. Sadiq Iqbal.',
    url: '/publications',
    type: 'website',
    images: [
      {
        url: '/prof-portrait.png',
        width: 1200,
        height: 630,
        alt: 'Prof. Sadiq Iqbal Publications Archive',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Publications & Research Papers | Prof. Sadiq Iqbal',
    description:
      'Peer-reviewed journals, conference proceedings, and citations by Prof. Sadiq Iqbal.',
    images: ['/prof-portrait.png'],
  },
};

export default async function PublicationsPage() {
  const rawProfile = await getProfile();
  const rawPublications = await getPublications({ limit: 100 });

  const profile = JSON.parse(JSON.stringify(rawProfile));
  const publications = JSON.parse(JSON.stringify(rawPublications));

  const publicationsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Publications of ${profile.fullName}`,
    description: 'Peer-reviewed scholarly publications, journal papers, and conference proceedings.',
    hasPart: publications.slice(0, 25).map((pub: any) => ({
      '@type': 'ScholarlyArticle',
      headline: pub.title,
      name: pub.title,
      author: {
        '@type': 'Person',
        name: profile.fullName,
      },
      datePublished: pub.year || '2024',
      publisher: pub.journalOrPublisher || 'Academic Journal',
      url: pub.doi ? (pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`) : undefined,
    })),
  };

  return (
    <PortfolioShell profile={profile}>
      {/* Google Scholar Highwire Press Metadata Tags */}
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(publicationsJsonLd) }}
      />
      <PortfolioClient publications={publications} />
    </PortfolioShell>
  );
}

