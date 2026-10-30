import { NextResponse } from 'next/server';
import { getProfile, getPublications, getBlogPosts, getAcademicItems } from '@/lib/data';

function escapeXml(unsafe: string = ''): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sadiquiqbal.com').replace(/\/$/, '');

  const [profile, publications, blogPosts, researchItems] = await Promise.all([
    getProfile().catch(() => null),
    getPublications({ limit: 50 }).catch(() => []),
    getBlogPosts(50).catch(() => []),
    getAcademicItems({ category: 'project', limit: 50 }).catch(() => []),
  ]);

  const authorName = profile?.fullName || 'Prof. Md. Sadiq Iqbal';
  const siteTitle = `${authorName} — Academic & Research Feed`;
  const siteDesc = profile?.bio || 'Official academic, research, and publication RSS feed.';

  // Build items array
  const feedItems: Array<{
    title: string;
    link: string;
    description: string;
    pubDate: string;
    guid: string;
    category: string;
  }> = [];

  // Add publications
  for (const pub of publications) {
    const pubYear = pub.year || '2024';
    const anyPub = pub as any;
    feedItems.push({
      title: pub.title,
      link: pub.doi ? (pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`) : `${baseUrl}/publications`,
      description: pub.abstract || anyPub.description || `${pub.title} published in ${pub.journalOrPublisher || 'Academic Journal'}.`,
      pubDate: new Date(`${pubYear}-01-01`).toUTCString(),
      guid: `${baseUrl}/publications#${anyPub.slug || encodeURIComponent(pub.title)}`,
      category: 'Publication',
    });
  }

  // Add blog posts
  for (const post of blogPosts) {
    feedItems.push({
      title: post.title,
      link: `${baseUrl}/blog/${post.slug}`,
      description: post.excerpt || post.title,
      pubDate: new Date().toUTCString(),
      guid: `${baseUrl}/blog/${post.slug}`,
      category: post.category || 'Article',
    });
  }

  // Add research milestones
  for (const res of researchItems) {
    feedItems.push({
      title: res.title,
      link: `${baseUrl}/research/${res.slug || ''}`,
      description: res.description || res.title,
      pubDate: new Date().toUTCString(),
      guid: `${baseUrl}/research/${res.slug || encodeURIComponent(res.title)}`,
      category: 'Research',
    });
  }

  const itemsXml = feedItems
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>
      <category>${escapeXml(item.category)}</category>
      <author>${escapeXml(authorName)}</author>
    </item>`
    )
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(siteDesc)}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>${profile?.contact?.email || 'sadiq.iqbal@bu.edu.bd'} (${escapeXml(authorName)})</managingEditor>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
