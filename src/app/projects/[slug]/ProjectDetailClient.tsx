'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ExternalLink,
  Code2,
  Sparkles,
  Layers,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { usePortfolio } from '@/components/home/PortfolioShell';

interface ProjectDetailClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: any;
}

export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const { themeColor } = usePortfolio();
  const [lightboxImg, setLightboxImg] = useState<{ url: string; index: number } | null>(null);

  if (!project) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Project Not Found</h2>
        <p className="text-sm text-neutral-400">The requested special project could not be found.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-black font-bold text-xs uppercase"
          style={{ backgroundColor: themeColor.hex }}
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const galleryImages = (project.gallery || []).filter((g: any) => Boolean(g?.url));

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxImg && galleryImages.length > 0) {
      const nextIdx = (lightboxImg.index - 1 + galleryImages.length) % galleryImages.length;
      setLightboxImg({ url: galleryImages[nextIdx].url, index: nextIdx });
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxImg && galleryImages.length > 0) {
      const nextIdx = (lightboxImg.index + 1) % galleryImages.length;
      setLightboxImg({ url: galleryImages[nextIdx].url, index: nextIdx });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#222228] pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {project.subtitle && (
          <span
            className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-black shadow-sm"
            style={{ backgroundColor: themeColor.hex }}
          >
            {project.subtitle}
          </span>
        )}
      </div>

      {/* Title & Metadata */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span
            className="p-1 rounded-md text-black"
            style={{ backgroundColor: themeColor.hex }}
          >
            <Sparkles size={14} />
          </span>
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Special Featured Project
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
          {project.title}
        </h1>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {project.tags.map((tag: string, idx: number) => (
              <span
                key={idx}
                className="text-xs font-mono px-3 py-1 rounded-lg bg-[#181820] border border-[#262632] text-neutral-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Hero Thumbnail */}
      <div className="relative w-full h-64 sm:h-96 md:h-[440px] rounded-2xl sm:rounded-3xl bg-[#0D0D10] border border-[#24242E] overflow-hidden shadow-2xl">
        <Image
          src={project.thumbnail?.url || '/prof-portrait.png'}
          alt={project.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      {/* Action Links Bar */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {project.projectUrl && (
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-black font-bold text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: themeColor.hex }}
          >
            <span>Explore Live Project</span>
            <ExternalLink size={14} />
          </a>
        )}

        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#181820] hover:bg-[#22222A] border border-[#2E2E3C] text-white font-bold text-xs uppercase tracking-wider transition-colors active:scale-95"
          >
            <Code2 size={15} />
            <span>View Source Code</span>
          </a>
        )}
      </div>

      {/* Comprehensive Project Description */}
      <div className="space-y-4 pt-4 border-t border-[#222228]">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Project Overview &amp; Architecture</span>
        </h2>
        <div className="prose prose-invert max-w-none text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4">
          <p className="whitespace-pre-line">{project.description}</p>
        </div>
      </div>

      {/* The 4-Image Project Gallery Moments */}
      {galleryImages.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#222228]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} style={{ color: themeColor.hex }} />
                <span>Visual Gallery &amp; Milestones (4 Images)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Click any image to enlarge in full-screen lightbox preview.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
              {galleryImages.length} Images
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            {galleryImages.map((img: any, idx: number) => (
              <div
                key={idx}
                onClick={() => setLightboxImg({ url: img.url, index: idx })}
                className="relative h-40 sm:h-48 rounded-xl bg-[#0D0D10] border border-[#262632] hover:border-[#444455] overflow-hidden group cursor-pointer shadow-md transition-all active:scale-[0.98]"
              >
                <Image
                  src={img.url}
                  alt={`${project.title} gallery photo ${idx + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/45 backdrop-blur-[2px]">
                  <span className="p-2.5 rounded-full bg-white/20 text-white backdrop-blur-md shadow-xl border border-white/20">
                    <ZoomIn size={18} />
                  </span>
                </div>
                <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 border border-white/10 text-white">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Back Button */}
      <div className="pt-8 border-t border-[#222228] flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#181820] hover:bg-[#202028] border border-[#282834] text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return to Home</span>
        </Link>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#121217] border border-[#262632] shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-3.5 bg-[#16161D] border-b border-[#22222C] flex items-center justify-between shrink-0">
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase text-black"
                style={{ backgroundColor: themeColor.hex }}
              >
                Gallery Photo {lightboxImg.index + 1} of {galleryImages.length}
              </span>
              <button
                onClick={() => setLightboxImg(null)}
                type="button"
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative flex-1 min-h-[300px] sm:min-h-[440px] max-h-[64vh] bg-[#0A0A0D] flex items-center justify-center p-3 sm:p-5 overflow-hidden">
              {galleryImages.length > 1 && (
                <button
                  onClick={handlePrev}
                  type="button"
                  className="absolute left-3 sm:left-4 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black/95 text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-xl"
                  aria-label="Previous"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              <img
                src={lightboxImg.url}
                alt="Enlarged snapshot"
                className="max-h-[58vh] max-w-full w-auto object-contain rounded-xl shadow-2xl border border-white/10 select-none"
              />

              {galleryImages.length > 1 && (
                <button
                  onClick={handleNext}
                  type="button"
                  className="absolute right-3 sm:right-4 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black/95 text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-xl"
                  aria-label="Next"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            <div className="px-5 py-3 bg-[#14141A] border-t border-[#22222C] flex items-center justify-between text-xs text-neutral-400 shrink-0">
              <span className="truncate max-w-md">{project.title}</span>
              <span className="font-mono">
                {lightboxImg.index + 1} / {galleryImages.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

