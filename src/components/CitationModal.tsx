'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Download, Quote, BookOpen } from 'lucide-react';
import { IPublication } from '@/models/Publication';
import { usePortfolio } from '@/components/home/PortfolioShell';

interface CitationModalProps {
  publication: IPublication | null;
  onClose: () => void;
}

export function generateBibtex(pub: IPublication): string {
  const firstAuthor = pub.authors?.[0] || 'Iqbal';
  const cleanLastName = firstAuthor.split(' ').pop()?.toLowerCase().replace(/[^a-z]/g, '') || 'iqbal';
  const year = pub.year || '2024';
  const firstWord = pub.title.split(' ')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'article';
  const citeKey = `${cleanLastName}${year}${firstWord}`;

  const authorsFormatted = (pub.authors && pub.authors.length > 0)
    ? pub.authors.join(' and ')
    : 'Prof. Md. Sadiq Iqbal';

  const journal = pub.journalOrPublisher || 'Academic Journal / Conference Proceedings';
  const doi = pub.doi ? `,\n  doi       = {${pub.doi.replace(/^https?:\/\/doi\.org\//, '')}}` : '';

  return `@article{${citeKey},
  author    = {${authorsFormatted}},
  title     = {${pub.title}},
  journal   = {${journal}},
  year      = {${year}}${doi}
}`;
}

export function generateApa(pub: IPublication): string {
  const authorsStr = (pub.authors && pub.authors.length > 0)
    ? pub.authors.join(', ')
    : 'Iqbal, M. S.';
  const year = pub.year || '2024';
  const journal = pub.journalOrPublisher ? `*${pub.journalOrPublisher}*` : '';
  const doi = pub.doi ? ` https://doi.org/${pub.doi.replace(/^https?:\/\/doi\.org\//, '')}` : '';

  return `${authorsStr} (${year}). ${pub.title}. ${journal}.${doi}`;
}

export function generateIeee(pub: IPublication): string {
  const firstAuthor = pub.authors?.[0] || 'M. S. Iqbal';
  const authorsStr = pub.authors && pub.authors.length > 1 ? `${firstAuthor} et al.` : firstAuthor;
  const year = pub.year || '2024';
  const journal = pub.journalOrPublisher || 'Journal / Conf.';

  return `[1] ${authorsStr}, "${pub.title}," *${journal}*, ${year}.`;
}

export default function CitationModal({ publication, onClose }: CitationModalProps) {
  const { themeColor } = usePortfolio();
  const [activeFormat, setActiveFormat] = useState<'bibtex' | 'apa' | 'ieee'>('bibtex');
  const [copied, setCopied] = useState(false);

  if (!publication) return null;

  const bibtex = generateBibtex(publication);
  const apa = generateApa(publication);
  const ieee = generateIeee(publication);

  const currentCitation =
    activeFormat === 'bibtex' ? bibtex : activeFormat === 'apa' ? apa : ieee;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCitation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadBib = () => {
    const blob = new Blob([bibtex], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `citation-${publication.year || '2024'}.bib`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl flex flex-col rounded-2xl sm:rounded-3xl bg-[#121217] border border-[#24242E] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#16161D] border-b border-[#22222C] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className="p-1.5 rounded-lg text-black font-bold"
              style={{ backgroundColor: themeColor.hex }}
            >
              <Quote size={15} />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Cite this Publication</h3>
              <p className="text-[11px] text-neutral-400">Copy citation in standard academic formats</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Paper Title preview */}
          <div className="p-3 rounded-xl bg-[#0D0D10] border border-[#202028]">
            <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block mb-1">
              Publication
            </span>
            <p className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-2">
              {publication.title}
            </p>
          </div>

          {/* Format Tabs */}
          <div className="flex items-center gap-2 border-b border-[#202028] pb-3">
            {[
              { id: 'bibtex', label: 'BibTeX' },
              { id: 'apa', label: 'APA' },
              { id: 'ieee', label: 'IEEE' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFormat(tab.id as any)}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  activeFormat === tab.id
                    ? 'text-black shadow-md'
                    : 'bg-[#181820] text-neutral-400 hover:text-white border border-[#252530]'
                }`}
                style={activeFormat === tab.id ? { backgroundColor: themeColor.hex } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Citation Text Area */}
          <div className="relative">
            <pre className="w-full p-4 rounded-xl bg-[#0A0A0D] border border-[#202028] text-xs font-mono text-neutral-200 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all max-h-56">
              {currentCitation}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {activeFormat === 'bibtex' && (
              <button
                onClick={handleDownloadBib}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181820] hover:bg-[#202028] border border-[#262632] text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Download .bib</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ml-auto"
              style={{ backgroundColor: themeColor.hex }}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Citation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

