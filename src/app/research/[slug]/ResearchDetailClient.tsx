'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  Share2,
  Check,
  Briefcase,
  Award,
  Mic,
  ExternalLink,
  Users,
  Building,
  Coins,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { IAcademicItem } from '@/models/AcademicItem';
import { usePortfolio } from '@/components/home/PortfolioShell';

interface ResearchDetailClientProps {
  item: IAcademicItem;
  relatedItems: IAcademicItem[];
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
      <div className="w-full h-full bg-[#18181F] flex items-center justify-center text-neutral-600">
        <Layers size={24} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes="(max-width: 768px) 100vw, 900px"
      className="object-cover"
      onError={() => setError(true)}
    />
  );
}

export default function ResearchDetailClient({ item, relatedItems }: ResearchDetailClientProps) {
  const { themeColor } = usePortfolio();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isProject = item.category === 'project';
  const isPatent = item.category === 'patent';
  const isTalk = item.category === 'talk';

  const categoryLabel =
    isProject
      ? 'Research Project'
      : isPatent
      ? 'Patent & IP'
      : isTalk
      ? 'Invited Talk & Keynote'
      : 'Research Initiative';

  const statusLabel =
    item.metaDetails?.projectStatus ||
    item.metaDetails?.patentStatus ||
    item.metaDetails?.talkType ||
    'Active';

  const mainImageUrl = getImageUrl(item.image);
  const imageCaption = typeof item.image === 'object' ? item.image?.caption : undefined;

  return (
    <article className="animate-slide-right w-full max-w-4xl mx-auto space-y-8 sm:space-y-10">
      {/* ═══════════════════════════════════════════════
          1. TOP NAVIGATION / BACK BUTTON
      ═══════════════════════════════════════════════ */}
      <div className="flex items-center justify-between border-b border-[#24242A] pb-4">
        <Link
          href="/research"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A0A0A0] hover:text-white transition-colors group cursor-pointer"
        >
          <span
            className="flex items-center justify-center w-7 h-7 rounded-full bg-[#1A1A20] group-hover:bg-[var(--theme-color)] group-hover:text-black transition-all"
            style={{ color: themeColor.hex }}
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          </span>
          <span className="hidden xs:inline">BACK TO RESEARCH &amp; INNOVATION</span>
          <span className="xs:hidden">BACK</span>
        </Link>

        {/* Share Button */}
        <button
          onClick={handleShare}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#2B2B33] bg-[#17171C] text-xs font-semibold text-[#CCCCCC] hover:text-white hover:border-[var(--theme-color)] transition-all cursor-pointer active:scale-95"
          title="Copy research link"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Share2 size={13} style={{ color: themeColor.hex }} />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════
          2. RESEARCH HEADER & METADATA
      ═══════════════════════════════════════════════ */}
      <header className="space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className="px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[11px] border"
            style={{
              color: themeColor.hex,
              borderColor: `${themeColor.hex}40`,
              backgroundColor: `${themeColor.hex}15`,
            }}
          >
            {categoryLabel}
          </span>

          <span className="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] bg-[#1E1E26] text-neutral-300 border border-[#2E2E38]">
            {statusLabel}
          </span>

          {item.dateOrPeriod && (
            <span className="inline-flex items-center gap-1 text-neutral-400 text-xs font-mono ml-auto">
              <Calendar size={12} />
              <span>{item.dateOrPeriod}</span>
            </span>
          )}
        </div>

        {/* Main Title */}
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
          {item.title}
        </h1>
      </header>

      {/* ═══════════════════════════════════════════════
          3. KEY RESEARCH HIGHLIGHTS GRID
      ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 p-4 sm:p-5 rounded-2xl bg-[#141418] border border-[#24242A]">
        {/* Funding Agency / Sponsor */}
        {item.metaDetails?.fundingAgency && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <Building size={12} style={{ color: themeColor.hex }} />
              <span>Funding Agency</span>
            </span>
            <p className="text-xs sm:text-sm font-semibold text-white">
              {item.metaDetails.fundingAgency}
            </p>
          </div>
        )}

        {/* Grant Amount */}
        {item.metaDetails?.grantAmount && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <Coins size={12} style={{ color: themeColor.hex }} />
              <span>Grant / Support</span>
            </span>
            <p className="text-xs sm:text-sm font-semibold text-white font-mono">
              {item.metaDetails.grantAmount}
            </p>
          </div>
        )}

        {/* Patent Number */}
        {item.metaDetails?.patentNumber && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <Award size={12} style={{ color: themeColor.hex }} />
              <span>Patent Identification</span>
            </span>
            <p className="text-xs sm:text-sm font-semibold text-white font-mono">
              {item.metaDetails.patentNumber}
            </p>
          </div>
        )}

        {/* Event Venue */}
        {item.metaDetails?.eventVenue && (
          <div className="space-y-1 sm:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <Mic size={12} style={{ color: themeColor.hex }} />
              <span>Venue &amp; Location</span>
            </span>
            <p className="text-xs sm:text-sm font-semibold text-white">
              {item.metaDetails.eventVenue}
            </p>
          </div>
        )}

        {/* Collaborators */}
        {item.metaDetails?.collaborators && item.metaDetails.collaborators.length > 0 && (
          <div className="space-y-1 sm:col-span-2 md:col-span-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <Users size={12} style={{ color: themeColor.hex }} />
              <span>Key Investigators &amp; Collaborators</span>
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.metaDetails.collaborators.map((collab, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md text-xs bg-[#1C1C24] border border-[#2B2B36] text-neutral-300"
                >
                  {collab}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          4. FEATURED IMAGE / DIAGRAM (if available)
      ═══════════════════════════════════════════════ */}
      {mainImageUrl && (
        <div className="relative w-full h-56 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-[#101014] border border-[#282830] shadow-2xl">
          <SafeResearchImage src={mainImageUrl} alt={item.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {imageCaption && (
            <div className="absolute bottom-3 left-4 right-4 text-xs text-neutral-300 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              {imageCaption}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          5. EXECUTIVE OVERVIEW & ABSTRACT
      ═══════════════════════════════════════════════ */}
      {item.description && (
        <div
          className="p-5 sm:p-6 rounded-2xl bg-[#141418] border-l-4 shadow-xl"
          style={{ borderLeftColor: themeColor.hex }}
        >
          <span
            className="text-xs font-mono font-bold uppercase tracking-wider block mb-2"
            style={{ color: themeColor.hex }}
          >
            // EXECUTIVE OVERVIEW
          </span>
          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed italic">
            &ldquo;{item.description}&rdquo;
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          6. IN-DEPTH RESEARCH CONTENT
      ═══════════════════════════════════════════════ */}
      {item.content && (
        <div className="space-y-4 text-neutral-300 text-sm sm:text-base leading-relaxed sm:leading-8 font-sans">
          <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-[#24242A] pb-2">
            Methodology &amp; Impact
          </h3>
          <div className="whitespace-pre-line space-y-3">
            {item.content}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          7. EXTERNAL LINKS / ACCESS REPOSITORY
      ═══════════════════════════════════════════════ */}
      {item.externalLink && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141418] border border-[#24242A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-white">External Project Resource</h4>
            <p className="text-xs text-neutral-400">
              Access official repository, project code, or grant documentation.
            </p>
          </div>

          <a
            href={item.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-black transition-all active:scale-95 shrink-0 shadow-lg"
            style={{ backgroundColor: themeColor.hex }}
          >
            <span>Visit Resource</span>
            <ExternalLink size={13} />
          </a>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          8. BOTTOM RETURN NAVIGATION
      ═══════════════════════════════════════════════ */}
      <div className="pt-6 border-t border-[#24242A] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/research"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 shadow-xl"
          style={{ backgroundColor: themeColor.hex }}
        >
          <ArrowLeft size={14} />
          <span>BACK TO RESEARCH OVERVIEW</span>
        </Link>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-white transition-colors py-2 cursor-pointer"
        >
          ↑ RETURN TO TOP
        </button>
      </div>

      {/* ═══════════════════════════════════════════════
          9. RELATED RESEARCH RECOMMENDATIONS
      ═══════════════════════════════════════════════ */}
      {relatedItems.length > 0 && (
        <section className="pt-8 border-t border-[#24242A] space-y-5">
          <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor.hex }} />
            <span>MORE RESEARCH INITIATIVES &amp; PROJECTS</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedItems.map((rel, idx) => {
              const relImg = getImageUrl(rel.image);

              return (
                <Link
                  key={rel.slug || idx}
                  href={`/research/${rel.slug}`}
                  className="p-5 rounded-2xl bg-[#141418] border border-[#24242A] hover:border-[var(--theme-color)] transition-all group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    {relImg && (
                      <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-[#101014] mb-1">
                        <SafeResearchImage src={relImg} alt={rel.title} />
                      </div>
                    )}

                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#1C1C24] border border-[#2B2B36]"
                      style={{ color: themeColor.hex }}
                    >
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-[var(--theme-color)] transition-colors leading-snug line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-[#1F1F26] font-mono">
                    <span>{rel.dateOrPeriod || 'Active'}</span>
                    <span
                      className="font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      style={{ color: themeColor.hex }}
                    >
                      <span>View Details</span>
                      <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
