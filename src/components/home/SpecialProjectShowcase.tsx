'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { usePortfolio } from '@/components/home/PortfolioShell';

export interface SpecialProjectData {
  _id?: string;
  slug?: string;
  title: string;
  subtitle?: string;
  description: string;
  thumbnail?: {
    url: string;
    publicId?: string;
  };
  gallery?: Array<{
    url: string;
    publicId?: string;
  }>;
  tags?: string[];
  projectUrl?: string;
  githubUrl?: string;
  isFeatured?: boolean;
  status?: 'published' | 'draft';
  order?: number;
}

interface SpecialProjectShowcaseProps {
  projects: SpecialProjectData[];
}

export default function SpecialProjectShowcase({
  projects = [],
}: SpecialProjectShowcaseProps) {
  const { themeColor } = usePortfolio();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setScrolledPast(true);
      } else {
        setScrolledPast(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const total = projects.length;
  const currentProject = projects[currentIndex] || projects[0];

  const handleNext = () => {
    if (total > 0) {
      setCurrentIndex((prev) => (prev + 1) % total);
    }
  };

  const handlePrev = () => {
    if (total > 0) {
      setCurrentIndex((prev) => (prev - 1 + total) % total);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => {
        const el = document.getElementById('special-projects-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        setIsOpen(false);
      }, 350);
    }
  };

  const handleClose = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setIsOpen(false);
    }, 350);
  };

  if (!currentProject || total === 0) return null;

  const projectHref = `/projects/${currentProject.slug || currentProject._id}`;
  const galleryImages = (currentProject.gallery || []).filter((g) => Boolean(g?.url));

  return (
    <>
      {/* ═══════════════════════════════════════════════
          FLOATING TRIGGER BADGE (Home View Center)
          - Desktop: "Special Project ↓"
          - Mobile: "Special ↓"
      ═══════════════════════════════════════════════ */}
      <div
        className={`fixed bottom-24 lg:bottom-7 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 pointer-events-auto ${
          isOpen && scrolledPast ? 'opacity-40 hover:opacity-100 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <button
          onClick={handleToggle}
          type="button"
          aria-label={isOpen ? 'Close Special Project' : 'Open Special Project'}
          className={`group relative flex items-center gap-1.5 sm:gap-2.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-[#141418]/95 hover:bg-[#1A1A22] border backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-white transition-all duration-300 cursor-pointer active:scale-95 ${
            isOpen
              ? 'border-red-500/30 hover:border-red-500/60'
              : 'border-[#2B2B36] hover:border-[#444455] animate-bounce hover:animate-none'
          }`}
        >
          {isOpen ? (
            <>
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center bg-red-500/20 text-red-400 shrink-0">
                <X size={11} strokeWidth={2.5} className="sm:hidden" />
                <X size={13} strokeWidth={2.5} className="hidden sm:inline" />
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300 group-hover:text-white">
                <span className="sm:hidden">Close</span>
                <span className="hidden sm:inline">Close Project</span>
              </span>
              <ChevronUp size={11} className="text-neutral-400 group-hover:-translate-y-0.5 transition-transform sm:hidden" />
              <ChevronUp size={13} className="text-neutral-400 group-hover:-translate-y-0.5 transition-transform hidden sm:inline" />
            </>
          ) : (
            <>
              {/* Pulsing indicator */}
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: themeColor.hex }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5"
                  style={{ backgroundColor: themeColor.hex }}
                />
              </span>

              <Sparkles size={13} style={{ color: themeColor.hex }} className="shrink-0 sm:hidden" />
              <Sparkles size={15} style={{ color: themeColor.hex }} className="shrink-0 hidden sm:inline" />

              <div className="flex items-center">
                <span
                  className="sm:hidden text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: themeColor.hex }}
                >
                  Special
                </span>
                <span
                  className="hidden sm:inline text-xs font-bold uppercase tracking-wider"
                  style={{ color: themeColor.hex }}
                >
                  Special Project
                </span>
              </div>

              <span
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-black text-[9px] sm:text-[10px] font-black shrink-0 transition-transform group-hover:translate-y-0.5"
                style={{ backgroundColor: themeColor.hex }}
              >
                <ChevronDown size={11} strokeWidth={3} className="sm:hidden" />
                <ChevronDown size={13} strokeWidth={3} className="hidden sm:inline" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════
          SPECIAL PROJECT SHOWCASE (CLEAN TEXT-DRIVEN SLIDER)
          "alada dev diye section asbe na normal text er moto kore asbe ar make sure multiple hobe slider hobe click korle new page s description asbe"
      ═══════════════════════════════════════════════ */}
      {isOpen && (
        <section
          id="special-projects-section"
          className="w-full pt-14 sm:pt-20 pb-20 scroll-mt-6 animate-in fade-in slide-in-from-bottom-6 duration-400"
        >
          {/* Top Editorial Bar: Label, Counter & Slider Navigation Controls */}
          <div className="flex items-center justify-between border-b border-[#222228] pb-3 mb-6">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: themeColor.hex }}
              />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400">
                Special Projects Showcase
              </span>
              <span className="text-xs font-mono text-neutral-500 font-semibold ml-1">
                ({String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Slider Arrows */}
              {total > 1 && (
                <div className="flex items-center gap-1 bg-[#16161C] border border-[#262630] rounded-full p-0.5">
                  <button
                    onClick={handlePrev}
                    type="button"
                    aria-label="Previous Project"
                    className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-[11px] font-mono text-neutral-400 px-1 font-semibold">
                    {currentIndex + 1} of {total}
                  </span>
                  <button
                    onClick={handleNext}
                    type="button"
                    aria-label="Next Project"
                    className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={handleClose}
                type="button"
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ml-1"
                title="Close"
              >
                <X size={13} />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </div>

          {/* Editorial Content Flow (No heavy nested card containers) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Typography & Story */}
            <div className="lg:col-span-7 space-y-4">
              {/* Subtitle / Sub */}
              {currentProject.subtitle && (
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-black shadow-sm"
                    style={{ backgroundColor: themeColor.hex }}
                  >
                    {currentProject.subtitle}
                  </span>
                </div>
              )}

              {/* Title (Clickable link to dedicated page) */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight hover:opacity-90 transition-opacity">
                <Link href={projectHref} className="hover:underline decoration-neutral-600 underline-offset-4">
                  {currentProject.title}
                </Link>
              </h2>

              {/* Clean flowing description */}
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
                {currentProject.description}
              </p>

              {/* Tags inline */}
              {currentProject.tags && currentProject.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {currentProject.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono text-neutral-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA: Click to open new page with description */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href={projectHref}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-black font-bold text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: themeColor.hex }}
                >
                  <span>View Project Details</span>
                  <ArrowRight size={14} />
                </Link>

                {currentProject.projectUrl && (
                  <a
                    href={currentProject.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors uppercase tracking-wider"
                  >
                    <span>Live Demo</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            {/* Right: Media Showcase (Thumbnail + 4 Gallery previews) */}
            <div className="lg:col-span-5 space-y-3">
              {/* Primary Thumbnail (Clickable to go to new page) */}
              <Link href={projectHref} className="block group">
                <div className="relative w-full h-56 sm:h-72 rounded-2xl bg-[#0D0D10] border border-[#24242E] group-hover:border-[#383848] overflow-hidden transition-all shadow-xl">
                  <Image
                    src={currentProject.thumbnail?.url || '/prof-portrait.png'}
                    alt={currentProject.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-[11px] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Read Details</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </Link>

              {/* 4 Gallery Previews */}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.slice(0, 4).map((img, idx) => (
                    <Link
                      key={idx}
                      href={projectHref}
                      className="relative h-16 sm:h-20 rounded-xl bg-[#0D0D10] border border-[#22222A] hover:border-[#3A3A48] overflow-hidden group cursor-pointer transition-all"
                    >
                      <Image
                        src={img.url}
                        alt={`Snapshot ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Slider Dots Indicator at Bottom */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              {projects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  type="button"
                  aria-label={`Go to project ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx ? 'w-8' : 'w-2 bg-neutral-700 hover:bg-neutral-500'
                  }`}
                  style={currentIndex === idx ? { backgroundColor: themeColor.hex } : undefined}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
