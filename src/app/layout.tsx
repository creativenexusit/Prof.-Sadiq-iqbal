import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import ThemeProvider from '@/components/ThemeProvider';
import { getProfile } from '@/lib/data';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-serif',
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sadiquiqbal.com').replace(/\/$/, '');
  const title = profile.siteMeta?.title || `${profile.fullName} | Professor & Chairman, CSE`;
  const description = profile.siteMeta?.description || profile.bio;
  const avatarUrl = profile.avatar?.url || '/prof-portrait.png';

  return {
    title: {
      default: title,
      template: `%s | ${profile.fullName}`,
    },
    description,
    keywords: profile.siteMeta?.keywords || profile.researchInterests,
    authors: [{ name: profile.fullName }],
    creator: profile.fullName,
    publisher: profile.institution,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: '/',
      types: {
        'application/rss+xml': '/feed.xml',
      },
    },
    icons: {
      icon: '/icon.png',
      apple: '/icon.png',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: `${profile.fullName} Academic Portfolio`,
      title,
      description,
      images: [
        {
          url: avatarUrl,
          width: 800,
          height: 800,
          alt: profile.fullName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [avatarUrl],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sadiquiqbal.com').replace(/\/$/, '');

  // JSON-LD Structured Data (Person + WebSite Schema)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: profile.fullName,
        jobTitle: profile.designation,
        worksFor: {
          '@type': 'EducationalOrganization',
          name: profile.institution,
          department: profile.department,
        },
        description: profile.bio,
        image: profile.avatar?.url || `${siteUrl}/prof-portrait.png`,
        email: `mailto:${profile.contact?.email}`,
        url: siteUrl,
        sameAs: [
          profile.socialLinks?.googleScholar,
          profile.socialLinks?.orcid,
          profile.socialLinks?.researchGate,
          profile.socialLinks?.linkedin,
          profile.socialLinks?.github,
        ].filter(Boolean),
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: `${profile.fullName} | Official Academic Website`,
        publisher: { '@id': `${siteUrl}/#person` },
      },
    ],
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Prof. Md. Sadiq Iqbal — Academic & Research Feed"
          href="/feed.xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${newsreader.variable} min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SmoothScroll>
            <main className="min-h-screen">{children}</main>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
