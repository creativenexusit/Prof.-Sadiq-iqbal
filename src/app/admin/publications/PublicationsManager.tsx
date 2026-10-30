'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  Edit3,
  BookOpen,
  Sparkles,
  ExternalLink,
  Search,
  FileText,
  Calendar,
  Layers,
  Quote,
  Loader2,
  X,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { deletePublicationAdmin } from '@/app/actions/adminCrud';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PubItem = Record<string, any>;

interface PublicationsManagerProps {
  initialPublications: PubItem[];
}

export default function PublicationsManager({ initialPublications }: PublicationsManagerProps) {
  const [publications, setPublications] = useState<PubItem[]>(initialPublications);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Delete Action
  const handleDelete = async (id?: string, slug?: string) => {
    if (!confirm('Are you sure you want to permanently delete this publication?')) return;
    const targetKey = id || slug;
    if (!targetKey) return;

    setDeletingId(targetKey);
    try {
      if (id) {
        await deletePublicationAdmin(id);
      }
      setPublications((prev) =>
        prev.filter((p) => ('_id' in p ? String(p._id) !== id : p.slug !== slug))
      );
    } catch {
      alert('Failed to delete publication from database.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered Publications calculation
  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      const matchesSearch =
        !searchQuery ||
        (pub.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pub.journalOrPublisher || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pub.authors || []).some((a: string) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(pub.year || '').includes(searchQuery) ||
        (pub.doi || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        activeCategory === 'all'
          ? true
          : activeCategory === 'book'
            ? pub.category === 'book' || pub.category === 'book_chapter'
            : pub.category === activeCategory;

      return matchesSearch && matchesCat;
    });
  }, [publications, searchQuery, activeCategory]);

  const categories = [
    { id: 'all', label: 'All', count: publications.length },
    { id: 'journal', label: 'Journals', count: publications.filter((p) => p.category === 'journal').length },
    { id: 'conference', label: 'Conferences', count: publications.filter((p) => p.category === 'conference').length },
    { id: 'book', label: 'Books & Chapters', count: publications.filter((p) => p.category === 'book' || p.category === 'book_chapter').length },
    { id: 'preprint', label: 'Preprints', count: publications.filter((p) => p.category === 'preprint').length },
  ];

  // Stats computation
  const totalCitations = useMemo(() => {
    return publications.reduce((acc, p) => acc + (Number(p.citationCount) || 0), 0);
  }, [publications]);

  const featuredCount = useMemo(() => {
    return publications.filter((p) => Boolean(p.isFeatured)).length;
  }, [publications]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* ═══════════════════════════════════════════════
          HEADER: TITLE, STATS & ADD BUTTON
      ═══════════════════════════════════════════════ */}
      <div className="flex flex-row sm:items-center justify-between gap-2.5 pb-2.5 sm:pb-3 border-b border-[#1F1F24]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Research Publications
            </h1>
            <span className="text-[11px] hidden sm:block font-mono px-2 py-0.5 rounded-full bg-[#1A1A20] text-neutral-400 border border-[#282830]">
              {publications.length}
            </span>
          </div>
          {/* <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
            Manage your peer-reviewed journals, conference papers, books and citations
          </p> */}
        </div>

        <Link
          href="/admin/publications/new"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 shrink-0 hover:brightness-110 min-h-[36px]"
          style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
        >
          <Plus size={14} strokeWidth={3} />
          <span className='hidden sm:block'>Add Publication</span>
          <span className='block sm:hidden'>Add</span>
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════
          MINI METRICS STRIP (Mobile friendly)
      ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Total Papers</span>
          <span className="text-sm sm:text-base font-black text-white font-mono">{publications.length}</span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Journals</span>
          <span className="text-sm sm:text-base font-black text-[var(--theme-color,#FFA800)] font-mono">
            {publications.filter((p) => p.category === 'journal').length}
          </span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Total Citations</span>
          <span className="text-sm sm:text-base font-black text-white font-mono">{totalCitations}</span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Featured</span>
          <span className="text-sm sm:text-base font-black text-amber-400 font-mono">{featuredCount}</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SEARCH & CATEGORY DROPDOWN
      ═══════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, journal, year, or DOI..."
            className="w-full pl-8 pr-7 py-2 rounded-xl bg-[#141418] border border-[#222226] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)] transition min-h-[38px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative sm:w-60 shrink-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
            <Filter size={13} />
          </div>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="w-full appearance-none pl-8 pr-8 py-2 rounded-xl bg-[#141418] border border-[#222226] text-white text-xs font-semibold focus:outline-none focus:border-[var(--theme-color,#FFA800)] transition min-h-[38px] cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-[#141418] text-white">
                {cat.label} ({cat.count})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
            <ChevronDown size={13} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          PUBLICATIONS LIST
      ═══════════════════════════════════════════════ */}
      <div className="rounded-xl sm:rounded-2xl border border-[#222226] bg-[#141418] overflow-hidden shadow-sm">
        {filteredPublications.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-2.5">
            <BookOpen size={30} className="mx-auto text-neutral-600" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              No matching publications
            </h3>
            <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search keyword or category filter.'
                : 'No publications recorded in this category yet.'}
            </p>
            <div className="pt-2">
              <Link
                href="/admin/publications/new"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--theme-color,#FFA800)] bg-[var(--theme-color,#FFA800)]/10 hover:bg-[var(--theme-color,#FFA800)]/20 transition cursor-pointer"
              >
                <Plus size={13} />
                <span>Add first publication</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#1F1F24]">
            {filteredPublications.map((pub, idx) => {
              const pubId = pub._id ? String(pub._id) : pub.slug;
              const isDeleting = deletingId === pubId;

              return (
                <div
                  key={pubId || idx}
                  className="p-3 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#16161B] transition-colors"
                >
                  {/* Left: Meta details & Title */}
                  <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                    {/* Top Row: Category, Year, Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--theme-color,#FFA800)]/15 text-[var(--theme-color,#FFA800)] border border-[var(--theme-color,#FFA800)]/30 shrink-0">
                        {pub.category || 'Paper'}
                      </span>

                      {pub.year && (
                        <span className="text-[11px] text-neutral-400 font-mono font-bold shrink-0">
                          {pub.year}
                        </span>
                      )}

                      {pub.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-[9px] text-[var(--theme-color,#FFA800)] font-semibold bg-[var(--theme-color,#FFA800)]/10 px-1.5 py-0.5 rounded border border-[var(--theme-color,#FFA800)]/30 shrink-0">
                          <Sparkles size={9} />
                          Featured
                        </span>
                      )}

                      {Number(pub.citationCount) > 0 && (
                        <span className="text-[10px] text-neutral-400 font-mono px-1.5 py-0.2 rounded bg-[#18181F] border border-[#24242C] shrink-0">
                          {pub.citationCount} citations
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link
                      href={`/admin/publications/${pub._id || pub.slug}`}
                      className="font-bold text-xs sm:text-sm text-white hover:text-[var(--theme-color,#FFA800)] transition-colors leading-snug line-clamp-2 block"
                    >
                      {pub.title}
                    </Link>

                    {/* Journal / Venue */}
                    <p className="text-[11px] sm:text-xs text-neutral-300 line-clamp-1">
                      {pub.journalOrPublisher || 'Academic Journal / Conference Venue'}
                    </p>

                    {/* Authors */}
                    {pub.authors && pub.authors.length > 0 && (
                      <p className="text-[10px] sm:text-[11px] text-neutral-400 line-clamp-1 font-mono">
                        {pub.authors.join(', ')}
                      </p>
                    )}

                    {/* Extra Badges: DOI / PDF link preview */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {pub.doi && (
                        <span className="text-[9px] text-neutral-400 font-mono">
                          DOI: {pub.doi}
                        </span>
                      )}
                      {pub.openAccessPdfUrl && (
                        <span className="text-[9px] text-emerald-400 font-mono">
                          • PDF Available
                        </span>
                      )}
                      {pub.codeRepositoryUrl && (
                        <span className="text-[9px] text-cyan-400 font-mono">
                          • Code Repo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Edit, View Link, Delete */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center pt-1 sm:pt-0">
                    <Link
                      href={`/admin/publications/${pub._id || pub.slug}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1E1E24] hover:bg-[#25252E] text-white text-xs font-semibold border border-[#2B2B33] transition cursor-pointer min-h-[30px]"
                    >
                      <Edit3 size={11} className="text-[var(--theme-color,#FFA800)]" />
                      <span>Edit</span>
                    </Link>

                    {(pub.doiUrl || pub.publisherUrl || pub.openAccessPdfUrl) && (
                      <a
                        href={pub.doiUrl || pub.openAccessPdfUrl || pub.publisherUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-[#1A1A20] hover:bg-[#22222A] text-neutral-400 hover:text-white border border-[#282830] transition cursor-pointer min-h-[30px] flex items-center justify-center"
                        title="View Published Paper"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete('_id' in pub ? String(pub._id) : undefined, pub.slug)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg bg-[#1A1A20] hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-[#282830] hover:border-rose-900/60 transition cursor-pointer disabled:opacity-50 min-h-[30px] flex items-center justify-center"
                      title="Delete publication"
                    >
                      {isDeleting ? (
                        <Loader2 size={12} className="animate-spin text-rose-400" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
