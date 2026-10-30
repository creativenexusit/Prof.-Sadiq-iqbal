'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Cpu,
  Eye,
  ShieldCheck,
  Activity,
  Cloud,
  Briefcase,
  Award,
  ArrowRight,
  Calendar,
  Building,
  Mic,
  Coins,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { usePortfolio } from '@/components/home/PortfolioShell';
import { IAcademicItem } from '@/models/AcademicItem';

interface ResearchClientProps {
  projects?: IAcademicItem[];
  patents?: IAcademicItem[];
  talks?: IAcademicItem[];
}

function getImageUrl(image: any): string | null {
  if (!image) return null;
  if (typeof image === 'string') return image.trim() || null;
  if (typeof image === 'object' && image.url) return image.url.trim() || null;
  return null;
}

function SafeResearchImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-[#16161C] flex items-center justify-center text-neutral-600">
        <Layers size={22} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setError(true)}
    />
  );
}

export default function ResearchClient({
  projects = [],
  patents = [],
  talks = [],
}: ResearchClientProps) {
  const { themeColor } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'all' | 'themes' | 'projects' | 'patents' | 'talks'>('all');

  const researchThemes = [
    {
      id: 'machine-learning',
      title: 'Machine Learning',
      icon: Cpu,
      overview:
        'Algorithms and statistical models identifying intricate data patterns to support clinical predictive systems and decision-making.',
      focus: [
        'Predictive modelling & classification',
        'Feature optimization & dimensionality reduction',
        'Machine learning in healthcare informatics',
        'Model robustness & generalization',
      ],
    },
    {
      id: 'xai',
      title: 'Explainable AI (XAI)',
      icon: Eye,
      overview:
        'Interpretable neural frameworks bridging the black-box dilemma in clinical decision support and transparent algorithmic reasoning.',
      focus: [
        'Interpretable-by-design architectures',
        'Attribution maps & counterfactual explanations',
        'Transparent clinical decision systems',
        'Biomarker alignment & validation',
      ],
    },
    {
      id: 'network-security',
      title: 'Network Security',
      icon: ShieldCheck,
      overview:
        'Cryptographic telemetry and machine learning models safeguarding communications, IoT networks, and enterprise infrastructure.',
      focus: [
        'Polymorphic zero-day malware detection',
        'IoT sensor defense & firmware security',
        'Cryptographic network telemetry',
        'Intrusion detection & behavioral analysis',
      ],
    },
    {
      id: 'telemedicine',
      title: 'Telemedicine & Health',
      icon: Activity,
      overview:
        'Decentralized healthcare delivery networks and resilient edge telemetry protocols for low-resource regional hospitals.',
      focus: [
        'Federated edge diagnostic telemetry',
        'Conflict-free offline data sync (CRDTs)',
        'Remote electronic patient health records',
        'IoT diagnostic sensor networks',
      ],
    },
    {
      id: 'cloud-computing',
      title: 'Cloud & Distributed Systems',
      icon: Cloud,
      overview:
        'High-concurrency distributed databases, scalable edge gateways, and containerized microservice architectures.',
      focus: [
        'Distributed replication protocols',
        'Edge computing gateways',
        'Scalable cloud microservices',
        'Latency reduction in data streams',
      ],
    },
  ];

  const tabItems = [
    {
      id: 'all',
      shortName: 'All',
      fullName: 'All Overview',
      count: undefined,
      icon: Layers,
    },
    {
      id: 'themes',
      shortName: 'Domains',
      fullName: 'Research Domains',
      count: 5,
      icon: Cpu,
    },
    {
      id: 'projects',
      shortName: 'Projects',
      fullName: 'Funded Projects',
      count: projects.length,
      icon: Briefcase,
    },
    {
      id: 'patents',
      shortName: 'Patents',
      fullName: 'Patents & IP',
      count: patents.length,
      icon: Award,
    },
    {
      id: 'talks',
      shortName: 'Talks',
      fullName: 'Keynotes & Talks',
      count: talks.length,
      icon: Mic,
    },
  ];

  return (
    <div className="animate-slide-right w-full space-y-7 sm:space-y-9 max-w-full overflow-hidden">
      {/* ═══════════════════════════════════════════════
          HEADER (Clean & Professional)
      ═══════════════════════════════════════════════ */}
      <div className="text-center space-y-2 px-1">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
          RESEARCH &amp;{' '}
          <span style={{ color: themeColor.hex }} className="transition-colors duration-300">
            INNOVATION
          </span>
        </h1>
        <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#888888]">
          <span className="hidden sm:inline-block w-6 sm:w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
          <span className="text-center leading-normal">
            SCIENTIFIC INQUIRY, FUNDED INITIATIVES &amp; COMPUTATIONAL PARADIGMS
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
          {tabItems.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                type="button"
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'text-black shadow-lg font-bold'
                    : 'bg-[#141418] border border-[#222228] text-neutral-400 hover:text-white hover:border-[#383842]'
                }`}
                style={isSelected ? { backgroundColor: themeColor.hex } : undefined}
              >
                <Icon size={14} className="shrink-0" />
                {/* Short name on mobile, full name on md+ desktop */}
                <span className="md:hidden text-[11px] font-bold">{tab.shortName}</span>
                <span className="hidden md:inline">{tab.fullName}</span>

                {typeof tab.count === 'number' && (
                  <span
                    className={`hidden md:inline text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-black/20 text-black font-bold' : 'bg-[#1C1C24] text-neutral-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          1. FUNDED & COLLABORATIVE RESEARCH PROJECTS
      ═══════════════════════════════════════════════ */}
      {(activeTab === 'all' || activeTab === 'projects') && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#222228] pb-2 px-0.5">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Briefcase size={14} style={{ color: themeColor.hex }} />
              <span className="md:hidden">Projects</span>
              <span className="hidden md:inline">Funded &amp; Collaborative Projects ({projects.length})</span>
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-[#141418] border border-[#202026] text-xs text-neutral-500">
              No research projects currently published.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
              {projects.map((proj, idx) => {
                const agency = proj.metaDetails?.fundingAgency;
                const status = proj.metaDetails?.projectStatus || 'Ongoing';
                const detailUrl = `/research/${proj.slug}`;
                const projImg = getImageUrl(proj.image);

                return (
                  <Link
                    key={proj.slug || (proj._id ? String(proj._id) : idx)}
                    href={detailUrl}
                    className="group flex flex-col justify-between rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-[#141418] border border-[#222228] hover:border-[var(--theme-color)] active:scale-[0.99] transition-all duration-300 shadow-md hover:-translate-y-0.5 space-y-3"
                  >
                    <div className="space-y-2.5">
                      {/* Optional Image Banner */}
                      {projImg && (
                        <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-[#101014] mb-1">
                          <SafeResearchImage src={projImg} alt={proj.title} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div
                            className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-black/85 backdrop-blur-md border shadow"
                            style={{ borderColor: `${themeColor.hex}50`, color: themeColor.hex }}
                          >
                            {status}
                          </div>
                        </div>
                      )}

                      {/* Top Row if no image */}
                      <div className="flex items-center justify-between gap-2">
                        {!projImg && (
                          <span
                            className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border"
                            style={{
                              color: themeColor.hex,
                              borderColor: `${themeColor.hex}40`,
                              backgroundColor: `${themeColor.hex}15`,
                            }}
                          >
                            {status}
                          </span>
                        )}
                        {proj.dateOrPeriod && (
                          <span className="text-[11px] font-mono text-neutral-400 inline-flex items-center gap-1 ml-auto">
                            <Calendar size={11} />
                            <span>{proj.dateOrPeriod}</span>
                          </span>
                        )}
                      </div>

                      {/* Project Title */}
                      <h3 className="text-sm sm:text-[15px] font-bold text-white group-hover:text-[var(--theme-color)] transition-colors leading-snug line-clamp-2">
                        {proj.title}
                      </h3>

                      {/* Brief Overview */}
                      {proj.description && (
                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                          {proj.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Row */}
                    <div className="pt-2.5 border-t border-[#1C1C22] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-neutral-400 truncate max-w-[65%]">
                        {agency || 'SI Research Lab'}
                      </span>

                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform shrink-0"
                        style={{ color: themeColor.hex }}
                      >
                        <span>Details</span>
                        <ArrowRight size={11} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          2. CORE RESEARCH DOMAINS / THEMES
      ═══════════════════════════════════════════════ */}
      {(activeTab === 'all' || activeTab === 'themes') && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#222228] pb-2 px-0.5">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Cpu size={14} style={{ color: themeColor.hex }} />
              <span className="md:hidden">Domains</span>
              <span className="hidden md:inline">Research Domains &amp; Focus Areas (5)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
            {researchThemes.map((theme) => {
              const Icon = theme.icon;
              return (
                <div
                  key={theme.id}
                  className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222228] shadow-md space-y-3.5 hover:border-[var(--theme-color)] transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#1A1A22] border border-[#2C2C36] shrink-0"
                        style={{ color: themeColor.hex }}
                      >
                        <Icon size={18} />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                        {theme.title}
                      </h3>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {theme.overview}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-[#1C1C22] space-y-1">
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider block"
                      style={{ color: themeColor.hex }}
                    >
                      Focus Tracks:
                    </span>
                    <ul className="space-y-1 text-xs text-neutral-300">
                      {theme.focus.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: themeColor.hex }}
                          />
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          3. PATENTS & INTELLECTUAL PROPERTY
      ═══════════════════════════════════════════════ */}
      {(activeTab === 'patents' || (activeTab === 'all' && patents.length > 0)) && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#222228] pb-2 px-0.5">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Award size={14} style={{ color: themeColor.hex }} />
              <span className="md:hidden">Patents</span>
              <span className="hidden md:inline">Patents &amp; Intellectual Property ({patents.length})</span>
            </h2>
          </div>

          {patents.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-[#141418] border border-[#202026] text-xs text-neutral-500">
              No patents currently listed. New filings can be added in the Admin Panel (Items &gt; Patents).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {patents.map((pat, idx) => {
                const patImg = getImageUrl(pat.image);

                return (
                  <Link
                    key={pat.slug || (pat._id ? String(pat._id) : idx)}
                    href={`/research/${pat.slug}`}
                    className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222228] hover:border-[var(--theme-color)] active:scale-[0.99] transition-all space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {patImg && (
                        <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-[#101014] mb-1">
                          <SafeResearchImage src={patImg} alt={pat.title} />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold" style={{ color: themeColor.hex }}>
                          {pat.metaDetails?.patentNumber || 'Patent Filing'}
                        </span>
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[#1C1C24] text-neutral-300 border border-[#2C2C36]">
                          {pat.metaDetails?.patentStatus || 'Granted'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[var(--theme-color)] transition-colors leading-snug">
                        {pat.title}
                      </h3>
                      {pat.description && (
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {pat.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#1C1C22] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {pat.dateOrPeriod || 'Official IP'}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 font-bold text-[11px] uppercase group-hover:translate-x-1 transition-transform"
                        style={{ color: themeColor.hex }}
                      >
                        <span>Details</span>
                        <ArrowRight size={11} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          4. KEYNOTES & INVITED TALKS
      ═══════════════════════════════════════════════ */}
      {(activeTab === 'all' || activeTab === 'talks') && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#222228] pb-2 px-0.5">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Mic size={14} style={{ color: themeColor.hex }} />
              <span className="md:hidden">Talks</span>
              <span className="hidden md:inline">Keynotes &amp; Invited Talks ({talks.length})</span>
            </h2>
          </div>

          {talks.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-[#141418] border border-[#202026] text-xs text-neutral-500">
              No talks or keynotes currently published.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {talks.map((talk, idx) => {
                const talkImg = getImageUrl(talk.image);

                return (
                  <Link
                    key={talk.slug || (talk._id ? String(talk._id) : idx)}
                    href={`/research/${talk.slug}`}
                    className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222228] hover:border-[var(--theme-color)] active:scale-[0.99] transition-all space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {talkImg && (
                        <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-[#101014] mb-1">
                          <SafeResearchImage src={talkImg} alt={talk.title} />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span
                          className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#1C1C24] border border-[#2B2B36]"
                          style={{ color: themeColor.hex }}
                        >
                          {talk.metaDetails?.talkType || 'Keynote'}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {talk.dateOrPeriod}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-[var(--theme-color)] transition-colors leading-snug">
                        {talk.title}
                      </h3>

                      {talk.metaDetails?.eventVenue && (
                        <p className="text-xs text-neutral-400 truncate">
                          📍 {talk.metaDetails.eventVenue}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#1C1C22] flex items-center justify-end text-xs">
                      <span
                        className="inline-flex items-center gap-1 font-bold text-[11px] uppercase group-hover:translate-x-1 transition-transform"
                        style={{ color: themeColor.hex }}
                      >
                        <span>Details</span>
                        <ArrowRight size={11} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
