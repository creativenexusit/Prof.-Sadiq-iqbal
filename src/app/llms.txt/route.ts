import { NextResponse } from 'next/server';
import { getProfile, getPublications } from '@/lib/data';

export async function GET() {
  const [profile, publications] = await Promise.all([
    getProfile().catch(() => null),
    getPublications({ limit: 10 }).catch(() => []),
  ]);

  const fullName = profile?.fullName || 'Prof. Md. Sadiq Iqbal';
  const designation = profile?.designation || 'Professor & Chairman, Department of Computer Science & Engineering';
  const institution = profile?.institution || 'Bangladesh University, Dhaka, Bangladesh';
  const bio = profile?.bio || '';
  const email = profile?.contact?.email || 'sadiq.iqbal@bu.edu.bd';

  const researchAreas = (profile?.researchInterests || [
    'Machine Learning',
    'Explainable Artificial Intelligence (XAI)',
    'Network Security',
    'Telemedicine & Clinical AI',
    'Distributed Cloud Computing',
  ]).join(', ');

  const topPubs = publications
    .slice(0, 8)
    .map((p: any, idx: number) => `${idx + 1}. "${p.title}" (${p.year || '2024'}) — ${p.venue || 'Peer-reviewed Journal/Conference'}. Citations: ${p.citationCount || 0}`)
    .join('\n');

  const content = `# ${fullName} — Official AI Academic Briefing

> ${designation} at ${institution}.

## Overview & Entity Identity
- Full Name: ${fullName}
- Title: ${designation}
- Institution: ${institution}
- Official Contact: ${email}
- Primary Domains: ${researchAreas}

## Academic Biography
${bio}

## Key Research Focus
1. **Explainable AI (XAI)**: Interpretable deep neural architectures, feature attribution, and fairness in decision-making models.
2. **Machine Learning & Healthcare**: Medical image analysis, telemedicine diagnostics, and multi-modal disease prediction.
3. **Cybersecurity & Network Systems**: Anomaly detection, zero-day threat intelligence, and distributed edge computing defense.

## Selected Publications & Research Milestones
${topPubs}

## Authoritative Profiles & External Verification
- Google Scholar: ${profile?.socialLinks?.googleScholar || 'https://scholar.google.com'}
- ORCID: ${profile?.socialLinks?.orcid || 'https://orcid.org'}
- ResearchGate: ${profile?.socialLinks?.researchGate || 'https://researchgate.net'}
- Official University Profile: https://bu.edu.bd
- Official Portfolio Website: https://sadiquiqbal.com
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

