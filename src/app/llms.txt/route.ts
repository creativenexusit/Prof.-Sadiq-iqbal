import { NextResponse } from 'next/server';
import { getProfile, getPublications } from '@/lib/data';

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://prof-sadiq-iqbal.vercel.app').replace(/\/$/, '');

  const [profile, publications] = await Promise.all([
    getProfile().catch(() => null),
    getPublications({ limit: 12 }).catch(() => []),
  ]);

  const fullName = profile?.fullName || 'Prof. Md. Sadiq Iqbal';
  const designation = profile?.designation || 'Professor & Chairman, Department of Computer Science & Engineering';
  const institution = profile?.institution || 'Bangladesh University, Dhaka, Bangladesh';
  const bio = profile?.bio || 'Academic leader, educator, and researcher in Machine Learning, Explainable AI, Network Security, and Telemedicine.';
  const email = profile?.contact?.email || 'sadiq.iqbal@bu.edu.bd';

  const scholarUrl = profile?.socialLinks?.googleScholar || 'https://scholar.google.com';
  const orcidUrl = profile?.socialLinks?.orcid || 'https://orcid.org';
  const researchGateUrl = profile?.socialLinks?.researchGate || 'https://www.researchgate.net';
  const linkedinUrl = profile?.socialLinks?.linkedin || 'https://www.linkedin.com';
  const githubUrl = profile?.socialLinks?.github || 'https://github.com';

  const pubItems = publications.slice(0, 10).map((p: any) => {
    const pubLink = p.doi
      ? (p.doi.startsWith('http') ? p.doi : `https://doi.org/${p.doi}`)
      : `${baseUrl}/publications`;
    const venue = p.journalOrPublisher || 'Academic Journal / Conference';
    const year = p.year || '2024';
    const citeCount = p.citationCount ? ` Citations: ${p.citationCount}.` : '';
    return `- [${p.title}](${pubLink}): ${venue} (${year}).${citeCount}`;
  }).join('\n');

  const content = `# ${fullName}

> ${designation} at ${institution}. ${bio}

## Core Documentation & Resources

- [Official Portfolio](${baseUrl}/): Official academic biography, leadership vision, and academic profile.
- [About & Career Biography](${baseUrl}/about): Full educational background, PhD research, awards, and gallery.
- [Research Initiatives & Labs](${baseUrl}/research): Flagship machine learning, explainable AI, and cybersecurity projects.
- [Peer-Reviewed Publications](${baseUrl}/publications): Indexed journals, IEEE/Springer conference proceedings, preprints, and citation indices.
- [Student Advising & Mentorship](${baseUrl}/students): Thesis openings, lab positions, graduate courses, and student advising FAQs.
- [Experience & Appointments](${baseUrl}/experience): University leadership positions, international keynote addresses, and program chairs.
- [Events & Conferences](${baseUrl}/events): Keynote speeches, workshops, academic consortiums, and seminars.
- [Blog & Technical Writing](${baseUrl}/blog): Academic essays, lecture notes, and technological insights.
- [Contact & Office Information](${baseUrl}/contact): Direct academic email (${email}), departmental location, and office hours.
- [Academic RSS Feed](${baseUrl}/feed.xml): Continuous RSS 2.0 feed of all publications, research updates, and blog articles.

## Selected Publications

${pubItems}

## Authoritative Academic Profiles

- [Google Scholar Profile](${scholarUrl}): Verified scholarly citation count, h-index, and indexed research publications.
- [ORCID Record](${orcidUrl}): Persistent digital researcher identifier for international academic accreditation.
- [ResearchGate Profile](${researchGateUrl}): Scientific network preprints, metrics, and peer research contributions.
- [LinkedIn Professional Profile](${linkedinUrl}): Academic leadership, professional milestones, and academic network.
- [GitHub Code Repositories](${githubUrl}): Open-source research implementations, models, and computational algorithms.
- [Bangladesh University Faculty Profile](https://bu.edu.bd): Official institutional appointment and department leadership.
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
