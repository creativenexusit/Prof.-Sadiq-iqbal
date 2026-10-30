'use client';

import React, { useState } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import {
  ChevronRight,
  ExternalLink,
  BookOpen,
  Layers,
  Cpu,
  Eye,
  Activity,
  ShieldCheck,
  Calendar,
  Sparkles,
  Quote,
} from 'lucide-react';
import { IPublication } from '@/models/Publication';
import { usePortfolio } from '@/components/home/PortfolioShell';
import CitationModal from '@/components/CitationModal';

interface PortfolioClientProps {
  publications: IPublication[];
}

export default function PortfolioClient({ publications }: PortfolioClientProps) {
  const { themeColor, openDrawer } = usePortfolio();
  const [portfolioFilter, setPortfolioFilter] = useState('ALL');
  const [citePublication, setCitePublication] = useState<IPublication | null>(null);

  // Filter publications by domain
  const filteredPublications = publications.filter((pub) => {
    if (portfolioFilter === 'ALL') return true;
    if (portfolioFilter === 'ML')
      return (
        pub.title.toLowerCase().includes('machine learning') ||
        pub.title.toLowerCase().includes('svm') ||
        pub.title.toLowerCase().includes('neural')
      );
    if (portfolioFilter === 'XAI')
      return (
        pub.title.toLowerCase().includes('explainab') ||
        pub.title.toLowerCase().includes('interpret')
      );
    if (portfolioFilter === 'HEALTH')
      return (
        pub.title.toLowerCase().includes('kidney') ||
        pub.title.toLowerCase().includes('health') ||
        pub.title.toLowerCase().includes('cancer') ||
        pub.title.toLowerCase().includes('liver') ||
        pub.title.toLowerCase().includes('telemedicine')
      );
    if (portfolioFilter === 'SECURITY')
      return (
        pub.title.toLowerCase().includes('security') ||
        pub.title.toLowerCase().includes('malware') ||
        pub.title.toLowerCase().includes('detect') ||
        pub.title.toLowerCase().includes('cyber')
      );
    return true;
  });

  const filterTabs = [
    {
      id: 'ALL',
      shortName: 'All',
      label: 'All Work',
      count: publications.length,
      icon: Layers,
    },
    {
      id: 'ML',
      shortName: 'ML',
      label: 'Machine Learning',
      count: publications.filter(
        (p) =>
          p.title.toLowerCase().includes('machine learning') ||
          p.title.toLowerCase().includes('svm') ||
          p.title.toLowerCase().includes('neural')
      ).length,
      icon: Cpu,
    },
    {
      id: 'XAI',
      shortName: 'XAI',
      label: 'Explainable AI',
      count: publications.filter(
        (p) =>
          p.title.toLowerCase().includes('explainab') ||
          p.title.toLowerCase().includes('interpret')
      ).length,
      icon: Eye,
    },
    {
      id: 'HEALTH',
      shortName: 'Health',
      label: 'Healthcare',
      count: publications.filter(
        (p) =>
          p.title.toLowerCase().includes('kidney') ||
          p.title.toLowerCase().includes('health') ||
          p.title.toLowerCase().includes('cancer') ||
          p.title.toLowerCase().includes('liver') ||
          p.title.toLowerCase().includes('telemedicine')
      ).length,
      icon: Activity,
    },
    {
      id: 'SECURITY',
      shortName: 'Security',
      label: 'Cybersecurity',
      count: publications.filter(
        (p) =>
          p.title.toLowerCase().includes('security') ||
          p.title.toLowerCase().includes('malware') ||
          p.title.toLowerCase().includes('detect') ||
          p.title.toLowerCase().includes('cyber')
      ).length,
      icon: ShieldCheck,
    },
  ];

  const handleOpenDetail = (pub: IPublication, idx: number) => {
    const doiLink = pub.doi
      ? pub.doi.startsWith('http')
        ? pub.doi
        : `https://doi.org/${pub.doi}`
      : undefined;

    openDrawer({
      type: 'publication',
      title: pub.title,
      category: pub.category || 'Journal Article',
      date: String(pub.year || '2024'),
      authors: pub.authors,
      journal: pub.journalOrPublisher || 'Peer-Reviewed Journal',
      doi: pub.doi,
      doiUrl: doiLink,
      description:
        pub.abstract ||
        'Peer-reviewed scholarly contribution focusing on advanced algorithm design, machine learning benchmarks, and high-assurance computational frameworks by Prof. Sadiq Iqbal.',
      image: `/contact-sheet/img${idx % 7}.jpg`,
      linkText: doiLink ? 'EXPLORE DOI RECORD' : 'VIEW PUBLICATION',
      linkUrl: doiLink || pub.doiUrl || pub.publisherUrl || pub.openAccessPdfUrl || pub.pdfFile?.url || undefined,
    });
  };

  return (
    <div className="animate-slide-from-sidebar w-full space-y-7 sm:space-y-9 max-w-full overflow-hidden">
      {/* ═══════════════════════════════════════════════
          HEADER (Clean & Professional)
      ═══════════════════════════════════════════════ */}
      <div className="text-center space-y-2 px-1">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
          <span style={{ color: themeColor.hex }} className="transition-colors duration-300">
            PUBLICATIONS
          </span>
        </h1>
        <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#888888]">
          <span className="hidden sm:inline-block w-6 sm:w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
          <span className="text-center leading-normal">
            PEER-REVIEWED JOURNALS, CONFERENCES &amp; SCHOLARLY CONTRIBUTIONS
          </span>
          <span className="hidden sm:inline-block w-6 sm:w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          MOBILE-OPTIMIZED ICON & SHORT NAME TABS BAR
          (Centered, no numbers on phone, full names and counts on desktop)
      ═══════════════════════════════════════════════ */}
      <div className="w-full flex justify-center">
        <div
          className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth max-w-full px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filterTabs.map((f) => {
            const isSelected = portfolioFilter === f.id;
            const Icon = f.icon;

            return (
              <button
                key={f.id}
                onClick={() => setPortfolioFilter(f.id)}
                type="button"
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${isSelected
                    ? 'text-black shadow-lg font-bold'
                    : 'bg-[#141418] border border-[#222228] text-neutral-400 hover:text-white hover:border-[#383842]'
                  }`}
                style={isSelected ? { backgroundColor: themeColor.hex } : undefined}
              >
                <Icon size={14} className="shrink-0" />
                {/* Short name on mobile, full label on md+ desktop */}
                <span className="md:hidden text-[11px] font-bold">{f.shortName}</span>
                <span className="hidden md:inline">{f.label}</span>

                {/* Number/count hidden on mobile phone, visible on md+ desktop */}
                <span
                  className={`hidden md:inline text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-black font-bold' : 'bg-[#1C1C24] text-neutral-400'
                    }`}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          PUBLICATIONS GRID (Responsive: 1-col on mobile, 2-col on sm, 3-col on lg)
      ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {filteredPublications.map((pub, idx) => {
          const doiLink = pub.doi
            ? pub.doi.startsWith('http')
              ? pub.doi
              : `https://doi.org/${pub.doi}`
            : undefined;

          return (
            <div
              key={pub.slug || idx}
              onClick={() => handleOpenDetail(pub, idx)}
              className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#141418] border border-[#222228] hover:border-[var(--theme-color)] active:scale-[0.99] transition-all duration-300 shadow-md cursor-pointer flex flex-col justify-between hover:-translate-y-0.5"
            >
              {/* Card Visual Header */}
              <div className="relative w-full h-36 xs:h-40 sm:h-44 bg-[#101014] overflow-hidden">
                <OptimizedImage
                  src={`/contact-sheet/img${idx % 7}.webp`}
                  alt={pub.title}
                  fill
                  quality={78}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                {/* Year Badge */}
                {pub.year && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/85 border border-white/10 shadow-md text-white">
                    {pub.year}
                  </div>
                )}

                {/* Category Pill */}
                <div
                  className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-black/85 border truncate max-w-[70%]"
                  style={{ color: themeColor.hex, borderColor: `${themeColor.hex}40` }}
                >
                  {pub.category || 'Peer-Reviewed'}
                </div>

                {/* Citations badge if any */}
                {pub.citationCount !== undefined && pub.citationCount > 0 && (
                  <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/85 text-neutral-300 border border-white/10">
                    {pub.citationCount} cites
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-3.5 sm:p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-medium text-neutral-400 line-clamp-1">
                    {pub.journalOrPublisher || 'Academic Journal / Conference'}
                  </p>

                  <h3 className="text-sm font-bold text-white group-hover:text-[var(--theme-color)] transition-colors line-clamp-2 mt-1 leading-snug">
                    {pub.title}
                  </h3>

                  {pub.authors && pub.authors.length > 0 && (
                    <p className="text-xs text-neutral-500 line-clamp-1 mt-1.5">
                      By {pub.authors.join(', ')}
                    </p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2.5 border-t border-[#1C1C22] flex items-center justify-between text-xs text-neutral-400">
                  <span
                    className="font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]"
                    style={{ color: themeColor.hex }}
                  >
                    <span>Read Overview</span>
                    <ChevronRight size={13} />
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setCitePublication(pub)}
                      title="Cite this paper (BibTeX, APA, IEEE)"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1A1A22] hover:bg-[#252530] text-neutral-300 hover:text-white border border-[#2B2B36] text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                    >
                      <Quote size={10} style={{ color: themeColor.hex }} />
                      <span>Cite</span>
                    </button>

                    {doiLink && (
                      <a
                        href={doiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open DOI Publication Record"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1C1C24] hover:bg-[var(--theme-color)] hover:text-black text-neutral-400 transition-colors text-[10px] font-mono border border-[#2B2B33]"
                      >
                        <span>DOI</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1-Click BibTeX / APA Citation Modal */}
      {citePublication && (
        <CitationModal
          publication={citePublication}
          onClose={() => setCitePublication(null)}
        />
      )}
    </div>
  );
}
