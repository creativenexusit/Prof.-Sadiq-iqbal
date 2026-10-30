'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import {
  Download,
  Award,
  GraduationCap,
  CheckCircle2,
  Camera,
  MapPin,
  Briefcase,
  ArrowRight,
  UserCheck,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import { IProfile } from '@/models/Profile';
import { IAcademicItem } from '@/models/AcademicItem';
import { usePortfolio } from '@/components/home/PortfolioShell';

interface AboutClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile?: IProfile | any;
  galleryItems?: IAcademicItem[];
}

export default function AboutClient({ profile, galleryItems = [] }: AboutClientProps) {
  const { themeColor } = usePortfolio();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation & body scroll lock for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + galleryItems.length) % galleryItems.length : null
        );
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % galleryItems.length : null
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxIndex, galleryItems.length]);

  const activeImage = lightboxIndex !== null ? galleryItems[lightboxIndex] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % galleryItems.length);
    }
  };

  const personalDetails = [
    {
      label: 'Designation',
      value: profile?.designation || 'Professor & Chairman',
    },
    {
      label: 'Department',
      value: profile?.department || 'Department of Computer Science & Engineering',
    },
    {
      label: 'Institution',
      value: profile?.institution
        ? (profile.institution.includes('Dhaka') ? profile.institution : `${profile.institution}, Dhaka, Bangladesh`)
        : 'Bangladesh University, Dhaka, Bangladesh',
      highlight: true,
    },
    {
      label: 'Experience',
      value: profile?.yearsExperience || profile?.stats?.yearsExperience || '22+ Years',
    },
    {
      label: 'Education',
      value: profile?.educationSummary || profile?.education?.[0]?.degree || 'Doctor of Philosophy (PhD)',
    },
    {
      label: 'Email',
      value: profile?.contact?.email || 'sadiq.iqbal@bu.edu.bd',
      isLink: true,
      href: `mailto:${profile?.contact?.email || 'sadiq.iqbal@bu.edu.bd'}`,
      highlight: true,
    },
    {
      label: 'Phone / WhatsApp',
      value: profile?.contact?.phone || profile?.contact?.whatsappNumber || '01755559312',
      isLink: true,
      href: `tel:${profile?.contact?.phone || profile?.contact?.whatsappNumber || '01755559312'}`,
    },
    {
      label: 'Location',
      value:
        profile?.contact?.officeLocation ||
        'Department of Computer Science & Engineering, Bangladesh University, Dhaka, Bangladesh',
    },
  ];

  const areasOfExpertise = [
    'Computer Science & Engineering',
    'Machine Learning',
    'Explainable Artificial Intelligence',
    'Network Security',
    'Telemedicine',
    'Cloud Computing',
    'Web Programming',
    'High-Performance Computing',
    'Networking and Database Technologies',
    'Software Development and Information Technology',
  ];

  return (
    <div className="animate-slide-right w-full space-y-10 sm:space-y-12">
      {/* Header with Highlight Word */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
          ABOUT{' '}
          <span style={{ color: themeColor.hex }} className="transition-colors duration-300">
            ME
          </span>
        </h1>
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#888888] flex items-center justify-center gap-2">
          <span className="w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
          <span>ACADEMIC LEADERSHIP, RESEARCH PHILOSOPHY &amp; MISSION</span>
          <span className="w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
        </p>
      </div>

      {/* ═══════════════════════════════════════════════
          TOP 2-COLUMN SECTION:
          LEFT: PORTRAIT IMAGE (Clean, styled with subtle accent border)
          RIGHT: PERSONAL DETAILS LIST & ACTION BUTTONS
      ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left: Portrait Image */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-64 h-80 sm:w-76 sm:h-[410px]">
            {/* Offset Accent Border */}
            <div
              className="absolute -inset-3 -bottom-3 -right-3 border-2 rounded-2xl pointer-events-none transition-colors duration-300"
              style={{ borderColor: themeColor.hex }}
            />
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#141418] border border-[#222228] shadow-2xl">
              <OptimizedImage
                src={profile?.avatar?.url || '/prof-portrait.png'}
                alt="Prof. Sadiq Iqbal — Professor & Chairman, Department of CSE"
                fill
                priority
                quality={80}
                sizes="(max-width: 640px) 256px, 320px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right: Personal Details Key-Value List (Simple, Plain & Clean) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3 text-xs sm:text-sm">
            {personalDetails.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"
              >
                <span className="text-[#888888] font-semibold text-xs uppercase tracking-wider shrink-0 w-36 sm:w-44">
                  {item.label}:
                </span>
                <span className="text-white font-medium break-words flex-1">
                  {item.isLink ? (
                    <a
                      href={item.href}
                      className="hover:underline transition-colors font-bold"
                      style={{ color: item.highlight ? themeColor.hex : undefined }}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span
                      className="font-bold"
                      style={item.highlight ? { color: themeColor.hex } : undefined}
                    >
                      {item.value}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons: Download CV + View Experience (Short names on mobile) */}
          <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <a
              href={profile?.cvFile?.url || '/sample-cv.pdf'}
              download
              style={{ backgroundColor: themeColor.hex }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-black font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all cursor-pointer active:scale-95 hover:opacity-90 shrink-0"
            >
              <Download size={14} className="shrink-0" />
              <span className="sm:hidden">GET CV</span>
              <span className="hidden sm:inline">DOWNLOAD CV</span>
            </a>

            <Link
              href="/experience"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer active:scale-95 bg-[#141418] border border-[#2A2A32] text-white hover:border-[#40404C] group shrink-0"
            >
              <Briefcase size={14} style={{ color: themeColor.hex }} className="shrink-0" />
              <span className="sm:hidden">EXPERIENCE</span>
              <span className="hidden sm:inline">VIEW EXPERIENCE</span>
              <ArrowRight size={13} className="text-neutral-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          FULL-WIDTH BIOGRAPHY SECTION (Simple, Plain & Clean)
      ═══════════════════════════════════════════════ */}
      <div className="w-full pt-4 border-t border-[#222228] space-y-3">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#888888] flex items-center gap-2">
          <UserCheck size={14} style={{ color: themeColor.hex }} />
          <span>BIOGRAPHY &amp; RESEARCH LEADERSHIP</span>
        </h2>
        <p className="text-xs sm:text-sm lg:text-[15px] leading-relaxed text-[#D6D6D6] whitespace-pre-line font-normal">
          {profile?.aboutContent ||
            profile?.bio ||
            'Prof. Sadiq Iqbal serves as Professor and Chairman of the Department of Computer Science & Engineering at Bangladesh University. With extensive academic teaching, institutional governance, and computing research leadership spanning over two decades, he spearheads advanced research in Machine Learning, Explainable Artificial Intelligence (XAI), Cloud Computing, and High-Assurance Network Architectures.'}
        </p>
      </div>

      {/* Academic Highlights Metric Strips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { number: profile?.stats?.yearsExperience || '22+', label: 'Years Leadership' },
          { number: profile?.stats?.totalPublications || '14+', label: 'Publications' },
          { number: profile?.stats?.researchAreasCount || '5', label: 'Research Areas' },
          { number: profile?.stats?.studentsMentored || '1,000+', label: 'Students Mentored' },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#181818] border border-[#2E2E2E] text-center space-y-1 transition-colors hover:border-[var(--theme-color)]"
          >
            <p
              className="text-2xl sm:text-4xl font-black font-sans transition-colors duration-300"
              style={{ color: themeColor.hex }}
            >
              {stat.number}
            </p>
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[#A5A5A5] font-bold">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Areas of Expertise */}
      <div className="space-y-4 pt-4 border-t border-[#222222]">
        <h3 className="text-xl font-bold uppercase tracking-wide text-white">
          Areas of Academic &amp; Technical Expertise
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {areasOfExpertise.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#181818] border border-[#262626] text-xs font-semibold text-[#DDD6C6]"
            >
              <CheckCircle2 size={15} style={{ color: themeColor.hex }} className="shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          ACADEMIC MOMENTS & PHOTO GALLERY
          (Populated dynamically from /admin/items with category: 'gallery')
      ═══════════════════════════════════════════════ */}
      {galleryItems && galleryItems.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-[#222228]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#222228] pb-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Camera size={20} style={{ color: themeColor.hex }} />
                <span>THROUGH THE LENS — ACADEMIC GALLERY</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Key conference assemblies, university ceremonies, and research laboratory moments
              </p>
            </div>
            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded-full border self-start sm:self-auto"
              style={{
                borderColor: `${themeColor.hex}40`,
                backgroundColor: `${themeColor.hex}15`,
                color: themeColor.hex,
              }}
            >
              {galleryItems.length} MOMENTS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {galleryItems.map((item, idx) => {
              const meta = item.metaDetails || {};
              const imgUrl = item.image?.url || '/prof-portrait.png';

              return (
                <div
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="rounded-2xl overflow-hidden bg-[#141418] border border-[#222228] hover:border-[#383842] transition-all duration-300 flex flex-row group cursor-pointer active:scale-[0.99] hover:shadow-xl"
                >
                  {/* Left Side: Text Content */}
                  <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between min-w-0 space-y-2.5">
                    <div>
                      {/* Category & Date badge */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {meta.galleryCategory && (
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-black shadow-sm"
                            style={{ backgroundColor: themeColor.hex }}
                          >
                            {meta.galleryCategory}
                          </span>
                        )}
                        {item.dateOrPeriod && (
                          <span className="font-mono text-[10px] sm:text-[11px] text-neutral-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                            {item.dateOrPeriod}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-white leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#1C1C24] flex items-center justify-between text-[11px] text-neutral-400">
                      {meta.galleryLocation ? (
                        <span className="flex items-center gap-1 text-neutral-400 truncate">
                          <MapPin size={11} style={{ color: themeColor.hex }} className="shrink-0" />
                          <span className="truncate">{meta.galleryLocation}</span>
                        </span>
                      ) : (
                        <span>Bangladesh</span>
                      )}

                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-neutral-400 group-hover:text-white transition-colors shrink-0">
                        <ZoomIn size={12} />
                        <span>View</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Image */}
                  <div className="relative w-28 sm:w-44 md:w-52 shrink-0 bg-[#0D0D10] overflow-hidden">
                    <OptimizedImage
                      src={imgUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#141418]/40" />

                    {/* Hover Zoom Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                      <span className="p-2 sm:p-2.5 rounded-full bg-white/20 text-white backdrop-blur-md shadow-xl border border-white/20">
                        <ZoomIn size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL DIALOG LIGHTBOX
          (Portaled to document.body for top z-index layer)
      ═══════════════════════════════════════════════ */}
      {mounted &&
        lightboxIndex !== null &&
        activeImage &&
        createPortal(
          <div
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200"
          >
            {/* Modal Dialog Card */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#121217] border border-[#252530] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden animate-in zoom-in-95 duration-200"
            >
              {/* Header */}
              <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-[#171720] border-b border-[#22222C] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  {activeImage.metaDetails?.galleryCategory && (
                    <span
                      className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-black shadow-sm shrink-0"
                      style={{ backgroundColor: themeColor.hex }}
                    >
                      {activeImage.metaDetails.galleryCategory}
                    </span>
                  )}
                  {activeImage.metaDetails?.galleryLocation && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-300 truncate">
                      <MapPin size={13} style={{ color: themeColor.hex }} className="shrink-0" />
                      <span className="truncate max-w-[140px] sm:max-w-none">
                        {activeImage.metaDetails.galleryLocation}
                      </span>
                    </span>
                  )}
                  <span className="text-[11px] sm:text-xs font-mono text-neutral-400 font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 shrink-0">
                    {lightboxIndex + 1} / {galleryItems.length}
                  </span>
                </div>

                <button
                  onClick={() => setLightboxIndex(null)}
                  type="button"
                  className="p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95 border border-white/10 shrink-0 ml-2"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Image Stage Container */}
              <div className="relative flex-1 min-h-[240px] sm:min-h-[360px] max-h-[56vh] bg-[#0A0A0E] flex items-center justify-center p-3 sm:p-5 overflow-hidden">
                {/* Prev Navigation Arrow */}
                {galleryItems.length > 1 && (
                  <button
                    onClick={handlePrev}
                    type="button"
                    className="absolute left-3 sm:left-4 z-20 p-2 sm:p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer active:scale-90 shadow-xl flex items-center justify-center group"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                )}

                {/* Hero Image */}
                <img
                  src={activeImage.image?.url || '/prof-portrait.png'}
                  alt={activeImage.title}
                  className="max-h-[50vh] max-w-full w-auto object-contain rounded-xl shadow-[0_15px_45px_rgba(0,0,0,0.8)] border border-[#202028]/80 select-none"
                />

                {/* Next Navigation Arrow */}
                {galleryItems.length > 1 && (
                  <button
                    onClick={handleNext}
                    type="button"
                    className="absolute right-3 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer active:scale-90 shadow-xl flex items-center justify-center group"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>

              {/* Footer Information */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[#14141A] border-t border-[#22222C] shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-wide leading-snug">
                      {activeImage.title}
                    </h3>
                    {activeImage.description && (
                      <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed line-clamp-2">
                        {activeImage.description}
                      </p>
                    )}
                  </div>
                  {activeImage.dateOrPeriod && (
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300 shrink-0 self-start">
                      {activeImage.dateOrPeriod}
                    </span>
                  )}
                </div>

                {/* Navigation hints & Mobile controls */}
                <div className="pt-2.5 mt-2.5 border-t border-[#1C1C24] flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="hidden sm:inline">Use ← / → arrow keys to navigate • ESC to close</span>
                  <div className="flex sm:hidden items-center gap-2 w-full justify-between">
                    <button
                      onClick={handlePrev}
                      className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 flex items-center gap-1 active:bg-white/10"
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <span className="font-mono text-neutral-400">
                      {lightboxIndex + 1} of {galleryItems.length}
                    </span>
                    <button
                      onClick={handleNext}
                      className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-neutral-300 flex items-center gap-1 active:bg-white/10"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
