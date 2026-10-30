'use client';

import React, { useState } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import Link from 'next/link';
import {
  X,
  BookOpen,
  User,
  Briefcase,
  Calendar,
  MapPin,
  ExternalLink,
  ArrowRight,
  Maximize2,
  Quote,
  Check,
} from 'lucide-react';

export interface DrawerItem {
  type: 'publication' | 'event' | 'blog' | 'project';
  title: string;
  category?: string;
  date?: string;
  authors?: string[];
  journal?: string;
  venue?: string;
  doi?: string;
  doiUrl?: string;
  description: string;
  image?: string;
  linkText?: string;
  linkUrl?: string;
}

interface SlideOverDrawerProps {
  drawerItem: DrawerItem | null;
  onClose: () => void;
  themeColor: { hex: string; hoverHex: string };
}

export default function SlideOverDrawer({
  drawerItem,
  onClose,
  themeColor,
}: SlideOverDrawerProps) {
  const [copiedBib, setCopiedBib] = useState(false);

  if (!drawerItem) return null;

  const isInternalLink = drawerItem.linkUrl?.startsWith('/');

  const handleCopyBibtex = () => {
    const citeKey = (drawerItem.title.split(' ')[0] || 'Paper').replace(/[^a-zA-Z0-9]/g, '') +
      (drawerItem.date?.match(/\d{4}/)?.[0] || new Date().getFullYear());
    const bibtex = `@article{${citeKey},
  title={${drawerItem.title}},
  author={${drawerItem.authors && drawerItem.authors.length > 0 ? drawerItem.authors.join(' and ') : 'Md Sadik Iqbal'}},
  journal={${drawerItem.journal || 'Academic Research Archive'}},
  year={${drawerItem.date?.match(/\d{4}/)?.[0] || new Date().getFullYear()}}${drawerItem.doi ? `,\n  doi={${drawerItem.doi}}` : ''}${drawerItem.linkUrl ? `,\n  url={${drawerItem.linkUrl}}` : ''}
}`;
    navigator.clipboard.writeText(bibtex).then(() => {
      setCopiedBib(true);
      setTimeout(() => setCopiedBib(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Darkened backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity cursor-pointer"
        aria-label="Close modal overlay"
      />

      {/* Drawer Panel Sliding in from Right */}
      <div
        data-lenis-prevent
        className="relative z-10 w-full sm:max-w-xl h-full h-[100dvh] max-h-[100dvh] bg-[#181818] border-l border-[#2E2E2E] shadow-2xl flex flex-col animate-drawer-right"
      >
        {/* 1. STICKY TOP HEADER */}
        <div className="flex-none flex items-center justify-between px-5 sm:px-8 py-4 border-b border-[#2A2A2A] bg-[#1F1F1F]/95 backdrop-blur-md">
          <span
            className="text-[11px] font-mono font-bold uppercase tracking-widest flex items-center gap-2"
            style={{ color: themeColor.hex }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: themeColor.hex }}
            />
            // {drawerItem.type.toUpperCase()} DETAIL
          </span>

          <button
            onClick={onClose}
            className="btn-theme-outline inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase transition-all cursor-pointer active:scale-95 shadow-sm"
            aria-label="Close drawer"
          >
            <X size={14} />
            <span>CLOSE</span>
          </button>
        </div>

        {/* 2. DEDICATED SMOOTH SCROLLABLE CONTENT BODY */}
        <div
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-5 sm:px-8 py-6 space-y-6"
        >
          {/* Large Visual */}
          {drawerItem.image && (
            <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden bg-black border border-[#2E2E2E] shadow-xl">
              <OptimizedImage
                src={drawerItem.image}
                alt={drawerItem.title}
                fill
                quality={75}
                sizes="(max-width: 640px) 100vw, 550px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}

          {/* Title in Active Theme Color */}
          <h3
            className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-snug"
            style={{ color: themeColor.hex }}
          >
            {drawerItem.title}
          </h3>

          {/* Key-Value Details List with Icons */}
          <div className="space-y-3 text-xs sm:text-sm border-y border-[#262626] py-4 bg-[#141414]/50 rounded-xl px-4">
            {drawerItem.category && (
              <div className="flex items-center gap-2">
                <BookOpen size={14} style={{ color: themeColor.hex }} className="shrink-0" />
                <span className="text-[#888888] w-24 shrink-0">Category:</span>
                <span className="font-bold text-white uppercase text-xs">{drawerItem.category}</span>
              </div>
            )}

            {drawerItem.authors && drawerItem.authors.length > 0 && (
              <div className="flex items-start gap-2">
                <User size={14} style={{ color: themeColor.hex }} className="mt-0.5 shrink-0" />
                <span className="text-[#888888] w-24 shrink-0">Authors:</span>
                <span className="font-semibold text-white">{drawerItem.authors.join(', ')}</span>
              </div>
            )}

            {drawerItem.journal && (
              <div className="flex items-start gap-2">
                <Briefcase size={14} style={{ color: themeColor.hex }} className="mt-0.5 shrink-0" />
                <span className="text-[#888888] w-24 shrink-0">Venue/Journal:</span>
                <span className="font-semibold text-white">{drawerItem.journal}</span>
              </div>
            )}

            {drawerItem.date && (
              <div className="flex items-center gap-2">
                <Calendar size={14} style={{ color: themeColor.hex }} className="shrink-0" />
                <span className="text-[#888888] w-24 shrink-0">Timeline:</span>
                <span className="font-semibold text-white">{drawerItem.date}</span>
              </div>
            )}

            {drawerItem.venue && (
              <div className="flex items-center gap-2">
                <MapPin size={14} style={{ color: themeColor.hex }} className="shrink-0" />
                <span className="text-[#888888] w-24 shrink-0">Location:</span>
                <span className="font-semibold text-white">{drawerItem.venue}</span>
              </div>
            )}

            {drawerItem.doi && (
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#2A2A2A] shrink-0"
                  style={{ color: themeColor.hex }}
                >
                  DOI
                </span>
                <span className="text-[#888888] w-20 shrink-0">Persistent ID:</span>
                <span className="font-mono text-white break-all text-xs">
                  {drawerItem.doi}
                </span>
              </div>
            )}
          </div>

          {/* Description Paragraph */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#888888] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor.hex }} />
              ABSTRACT / OVERVIEW
            </span>
            <p className="text-xs sm:text-sm leading-relaxed text-[#D6D6D6] whitespace-pre-line bg-[#161616] p-4 rounded-xl border border-[#242424]">
              {drawerItem.description}
            </p>
          </div>

          {/* BibTeX Quick Citation if publication */}
          {drawerItem.type === 'publication' && (
            <div className="p-3.5 rounded-xl bg-[#141418] border border-[#2A2A32] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-neutral-300">
                <Quote size={14} style={{ color: themeColor.hex }} />
                <span>Cite this paper (BibTeX)</span>
              </div>
              <button
                type="button"
                onClick={handleCopyBibtex}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#222228] text-white hover:bg-white hover:text-black transition-all active:scale-95 cursor-pointer border border-[#33333E]"
              >
                {copiedBib ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Quote size={12} />
                    <span>Copy BibTeX</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 3. STICKY BOTTOM ACTION FOOTER */}
        <div className="flex-none px-5 sm:px-8 py-4 border-t border-[#2A2A2A] bg-[#1F1F1F]/95 backdrop-blur-md flex items-center justify-between gap-3">
          {drawerItem.linkUrl ? (
            <div className="flex items-center gap-2">
              {isInternalLink ? (
                <Link
                  href={drawerItem.linkUrl}
                  onClick={onClose}
                  style={{ backgroundColor: themeColor.hex }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 shadow-lg"
                >
                  <span>{drawerItem.linkText || 'READ FULL ARTICLE'}</span>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <a
                  href={drawerItem.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: themeColor.hex }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 shadow-lg"
                >
                  <span>{drawerItem.linkText || 'EXPLORE RECORD'}</span>
                  <ExternalLink size={13} />
                </a>
              )}

              {/* Extra button: Open in New Tab if wanted */}
              {isInternalLink && (
                <a
                  href={drawerItem.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open article in a new tab"
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-[#333333] text-[#AAAAAA] hover:text-white hover:border-white transition-colors"
                >
                  <Maximize2 size={14} />
                </a>
              )}
            </div>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-wider text-[#888888] hover:text-white transition-colors cursor-pointer px-3 py-2"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
