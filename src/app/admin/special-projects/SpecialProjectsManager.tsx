'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Layers,
  Image as ImageIcon,
  Search,
  X,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  saveSpecialProjectAdmin,
  deleteSpecialProjectAdmin,
} from '@/app/actions/specialProjectCrud';

export interface SpecialProjectItem {
  _id?: string;
  title: string;
  slug?: string;
  subtitle: string;
  description: string;
  thumbnail: {
    url: string;
    publicId?: string;
  };
  gallery: Array<{
    url: string;
    publicId?: string;
  }>;
  tags?: string[];
  projectUrl?: string;
  githubUrl?: string;
  isFeatured: boolean;
  status: 'published' | 'draft';
  order: number;
}

interface SpecialProjectsManagerProps {
  initialProjects: SpecialProjectItem[];
}

export default function SpecialProjectsManager({
  initialProjects = [],
}: SpecialProjectsManagerProps) {
  const [projects, setProjects] = useState<SpecialProjectItem[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search filtering
  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return projects;
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.subtitle?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some((t) => t.toLowerCase().includes(query))
    );
  }, [projects, searchQuery]);

  // Stats calculation
  const totalPublished = useMemo(
    () => projects.filter((p) => p.status === 'published').length,
    [projects]
  );
  const totalFeatured = useMemo(
    () => projects.filter((p) => p.isFeatured).length,
    [projects]
  );
  const totalGalleryImages = useMemo(
    () => projects.reduce((acc, p) => acc + (p.gallery?.filter((g) => g?.url).length || 0), 0),
    [projects]
  );

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    setDeletingId(id);
    try {
      const res = await deleteSpecialProjectAdmin(id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
        setStatusMsg({ type: 'success', text: `"${title}" was deleted.` });
      } else {
        throw new Error(res.message || 'Failed to delete');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to delete project.' });
    } finally {
      setDeletingId(null);
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const copy = [...projects];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // re-assign order numbers
    copy.forEach((item, idx) => {
      item.order = idx;
    });

    setProjects(copy);

    try {
      await Promise.all([
        saveSpecialProjectAdmin({ order: copy[index].order }, copy[index]._id),
        saveSpecialProjectAdmin({ order: copy[targetIndex].order }, copy[targetIndex]._id),
      ]);
    } catch (err) {
      console.warn('Order sync error:', err);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 max-w-6xl mx-auto pb-10">
      {/* ═══════════════════════════════════════════════
          HEADER: TITLE & NEW SPECIAL PROJECT BUTTON
      ═══════════════════════════════════════════════ */}
      <div className="flex items-center justify-between gap-3 pb-2.5 sm:pb-3 border-b border-[#1F1F24]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Special Projects
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1A1A20] text-neutral-400 border border-[#282830]">
              {projects.length}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5 hidden sm:block">
            Flagship research initiatives featured with floating pill and 4-image showcase
          </p>
        </div>

        <Link
          href="/admin/special-projects/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-black text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer shrink-0 min-h-[36px] hover:brightness-110"
          style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
        >
          <Plus size={14} strokeWidth={3} />
          <span className="hidden sm:inline">Add Special Project</span>
          <span className="sm:hidden inline">Add</span>
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════
          MINI METRICS STRIP (Matches Publications/Items)
      ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Total Projects</span>
          <span className="text-sm sm:text-base font-black text-white font-mono">{projects.length}</span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Published</span>
          <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">{totalPublished}</span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Featured</span>
          <span className="text-sm sm:text-base font-black text-[var(--theme-color,#FFA800)] font-mono">{totalFeatured}</span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Gallery Photos</span>
          <span className="text-sm sm:text-base font-black text-white font-mono">{totalGalleryImages}</span>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMsg && (
        <div
          className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl text-xs transition-all ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/40 border border-red-500/40 text-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={15} className="text-red-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search special projects by title, subtitle, or tags..."
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

      {/* Projects List */}
      <div className="space-y-2.5">
        {filteredProjects.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-[#141418] border border-[#222226]">
            <Layers size={32} className="mx-auto text-neutral-600 mb-2" />
            <p className="text-xs sm:text-sm text-neutral-300 font-medium">
              {searchQuery ? 'No matching special projects found.' : 'No special projects created yet.'}
            </p>
            <Link
              href="/admin/special-projects/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-3 rounded-lg text-black text-xs font-bold transition-all shadow-sm hover:brightness-110"
              style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
            >
              <Plus size={13} strokeWidth={3} />
              <span>Create First Special Project</span>
            </Link>
          </div>
        ) : (
          filteredProjects.map((proj, idx) => {
            const editTargetId = proj._id || proj.slug || String(idx);
            return (
              <div
                key={proj._id || idx}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] hover:border-[#303038] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5"
              >
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Order Reorder */}
                  <div className="flex flex-col items-center justify-center gap-0.5 shrink-0 pt-0.5">
                    <button
                      onClick={() => moveOrder(idx, 'up')}
                      disabled={idx === 0}
                      type="button"
                      title="Move Up"
                      className="p-1 rounded bg-[#1C1C22] hover:bg-[#282830] text-neutral-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <span className="font-mono text-[10px] text-neutral-500">{idx + 1}</span>
                    <button
                      onClick={() => moveOrder(idx, 'down')}
                      disabled={idx === filteredProjects.length - 1}
                      type="button"
                      title="Move Down"
                      className="p-1 rounded bg-[#1C1C22] hover:bg-[#282830] text-neutral-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#0D0D10] border border-[#24242C] overflow-hidden shrink-0 flex items-center justify-center">
                    {proj.thumbnail?.url ? (
                      <Image
                        src={proj.thumbnail.url}
                        alt={proj.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon size={22} className="text-neutral-600" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {proj.subtitle && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1A1A20] text-neutral-300 border border-[#282830]">
                          {proj.subtitle}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                          proj.status === 'published'
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                            : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {proj.status}
                      </span>
                      {proj.isFeatured && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-[var(--theme-color,#FFA800)]/40 bg-[var(--theme-color,#FFA800)]/10 text-[var(--theme-color,#FFA800)]">
                          Featured
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-neutral-500">
                        Gallery: {proj.gallery?.filter((g) => g?.url).length || 0}/4
                      </span>
                    </div>

                    <h2 className="text-sm sm:text-base font-bold text-white truncate">
                      {proj.title}
                    </h2>

                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Tags */}
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {proj.tags.slice(0, 4).map((t, tidx) => (
                          <span
                            key={tidx}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions: Edit Link & Delete */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {proj.slug && (
                    <Link
                      href={`/projects/${proj.slug}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-[#1C1C22] hover:bg-[#282830] text-neutral-400 hover:text-white border border-[#282830] text-xs transition-colors"
                      title="View Public Page"
                    >
                      <Eye size={13} />
                    </Link>
                  )}

                  {/* EDIT BUTTON: GOES TO NEW EDIT PAGE (NOT POPUP) */}
                  <Link
                    href={`/admin/special-projects/${editTargetId}`}
                    className="px-3 py-1.5 rounded-xl bg-[#1C1C22] hover:bg-[#282830] text-neutral-200 hover:text-white border border-[#282830] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </Link>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => proj._id && handleDelete(proj._id, proj.title)}
                    disabled={deletingId === proj._id}
                    type="button"
                    className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === proj._id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
