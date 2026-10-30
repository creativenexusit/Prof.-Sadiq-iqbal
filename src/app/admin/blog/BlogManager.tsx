'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  Edit3,
  Newspaper,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  X,
  Eye,
  EyeOff,
  Star,
  Clock,
  Calendar,
  Layers,
} from 'lucide-react';
import Image from 'next/image';
import { deleteBlogPostAdmin, saveBlogPostAdmin } from '@/app/actions/blogCrud';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BlogItem = Record<string, any>;

interface BlogManagerProps {
  initialPosts: BlogItem[];
}

function BlogThumbnail({ url, title }: { url?: string; title?: string }) {
  const [error, setError] = useState(false);

  if (!url || error) {
    return (
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl shrink-0 border border-[#282830] bg-[#18181F] flex items-center justify-center text-neutral-500 mt-0.5 sm:mt-0">
        <Newspaper size={16} />
      </div>
    );
  }

  return (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-[#282830] bg-[#0E0E10] mt-0.5 sm:mt-0">
      <Image
        src={url}
        alt={title || 'Thumbnail'}
        fill
        unoptimized
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

export default function BlogManager({ initialPosts }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogItem[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Derived categories with count
  const categories = useMemo(() => {
    const map: Record<string, number> = {};
    posts.forEach((p) => {
      const cat = p.category || 'General';
      map[cat] = (map[cat] || 0) + 1;
    });

    return [
      { id: 'all', label: 'All Categories', count: posts.length },
      ...Object.keys(map).map((cat) => ({
        id: cat,
        label: cat,
        count: map[cat],
      })),
    ];
  }, [posts]);

  // Filtered posts calculation
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.title || '').toLowerCase().includes(q) ||
        (p.excerpt || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.tags || []).some((t: string) => t.toLowerCase().includes(q));

      const matchesCat = activeCategory === 'all' || p.category === activeCategory;

      return matchesSearch && matchesCat;
    });
  }, [posts, searchQuery, activeCategory]);

  // Statistics
  const featuredCount = useMemo(() => posts.filter((p) => Boolean(p.isFeatured)).length, [posts]);
  const publishedCount = useMemo(
    () => posts.filter((p) => p.status === 'published' || !p.status).length,
    [posts]
  );
  const draftCount = useMemo(() => posts.filter((p) => p.status === 'draft').length, [posts]);

  // Delete Action
  const handleDelete = async (id?: string, slug?: string) => {
    if (!confirm('Are you sure you want to permanently delete this article?')) return;
    const targetKey = id || slug;
    if (!targetKey) return;

    setDeletingId(targetKey);
    try {
      if (id && !id.startsWith('seed-')) {
        await deleteBlogPostAdmin(id);
      }
      setPosts((prev) =>
        prev.filter((p) => ('_id' in p ? String(p._id) !== id : p.slug !== slug))
      );
    } catch {
      alert('Failed to delete blog article from database.');
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (post: BlogItem) => {
    const id = post._id ? String(post._id) : null;
    if (!id || id.startsWith('seed-')) return;

    const newFeatured = !post.isFeatured;
    setPosts((prev) =>
      prev.map((p) => (String(p._id) === id ? { ...p, isFeatured: newFeatured } : p))
    );

    try {
      await saveBlogPostAdmin({ ...post, isFeatured: newFeatured }, id);
    } catch {
      // rollback
      setPosts((prev) =>
        prev.map((p) => (String(p._id) === id ? { ...p, isFeatured: !newFeatured } : p))
      );
    }
  };

  // Toggle Status (Published / Draft)
  const handleToggleStatus = async (post: BlogItem) => {
    const id = post._id ? String(post._id) : null;
    if (!id || id.startsWith('seed-')) return;

    const newStatus = post.status === 'draft' ? 'published' : 'draft';
    setPosts((prev) =>
      prev.map((p) => (String(p._id) === id ? { ...p, status: newStatus } : p))
    );

    try {
      await saveBlogPostAdmin({ ...post, status: newStatus }, id);
    } catch {
      // rollback
      setPosts((prev) =>
        prev.map((p) => (String(p._id) === id ? { ...p, status: post.status } : p))
      );
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* ═══════════════════════════════════════════════
          HEADER: TITLE & ADD BUTTON
      ═══════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 sm:pb-3 border-b border-[#1F1F24]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Blog &amp; Scholarly Articles
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1A1A20] text-neutral-400 border border-[#282830]">
              {posts.length}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
            Publish academic essays, technical commentary, lab findings, and opinions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/blog"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#16161B] border border-[#2B2B32] text-xs font-semibold text-neutral-300 hover:text-white transition"
          >
            <span>Live Blog</span>
            <ExternalLink size={12} />
          </Link>

          <Link
            href="/admin/blog/new"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 shrink-0 hover:brightness-110 min-h-[36px]"
            style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
          >
            <Plus size={14} strokeWidth={3} />
            <span>Add Article</span>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          MINI METRICS STRIP (Mobile friendly)
      ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Total Articles</span>
          <span className="text-sm sm:text-base font-black text-white font-mono">{posts.length}</span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Published</span>
          <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
            {publishedCount}
          </span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Featured</span>
          <span className="text-sm sm:text-base font-black text-[var(--theme-color,#FFA800)] font-mono">
            {featuredCount}
          </span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Drafts</span>
          <span className="text-sm sm:text-base font-black text-neutral-400 font-mono">{draftCount}</span>
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
            placeholder="Search by title, category, tags, or content..."
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
        <div className="relative sm:w-64 shrink-0">
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
          BLOG ARTICLES LIST
      ═══════════════════════════════════════════════ */}
      <div className="rounded-xl sm:rounded-2xl border border-[#222226] bg-[#141418] overflow-hidden shadow-sm">
        {filteredPosts.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-2.5">
            <Newspaper size={30} className="mx-auto text-neutral-600" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              No matching articles found
            </h3>
            <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search keyword or category filter.'
                : 'No articles published in this category yet.'}
            </p>
            <div className="pt-2">
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--theme-color,#FFA800)] bg-[var(--theme-color,#FFA800)]/10 hover:bg-[var(--theme-color,#FFA800)]/20 transition cursor-pointer"
              >
                <Plus size={13} />
                <span>Write first article</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#1F1F24]">
            {filteredPosts.map((post, idx) => {
              const postId = post._id ? String(post._id) : post.slug;
              const isDeleting = deletingId === postId;
              const imageUrl =
                typeof post.image === 'string'
                  ? post.image
                  : post.image?.url || '';

              return (
                <div
                  key={postId || idx}
                  className="p-3 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#16161B] transition-colors"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
                    <BlogThumbnail url={imageUrl} title={post.title} />

                    <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--theme-color,#FFA800)]/15 text-[var(--theme-color,#FFA800)] border border-[var(--theme-color,#FFA800)]/30 shrink-0">
                          {post.category || 'Article'}
                        </span>

                        {post.date && (
                          <span className="text-[10px] sm:text-[11px] text-neutral-400 font-mono shrink-0">
                            {post.date}
                          </span>
                        )}

                        {post.readTime && (
                          <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 shrink-0">
                            <Clock size={10} />
                            {post.readTime}
                          </span>
                        )}

                        {post.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-[9px] text-[var(--theme-color,#FFA800)] font-semibold bg-[var(--theme-color,#FFA800)]/10 px-1.5 py-0.5 rounded border border-[var(--theme-color,#FFA800)]/30 shrink-0">
                            <Sparkles size={9} />
                            Featured
                          </span>
                        )}

                        {post.status === 'draft' && (
                          <span className="text-[9px] font-bold text-neutral-400 bg-[#1A1A20] px-1.5 py-0.2 rounded border border-[#282830]">
                            Draft
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <Link
                        href={`/admin/blog/${post._id || post.slug}`}
                        className="font-bold text-xs sm:text-sm text-white hover:text-[var(--theme-color,#FFA800)] transition-colors leading-snug line-clamp-2 block"
                      >
                        {post.title}
                      </Link>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {post.tags.slice(0, 4).map((tag: string, tIdx: number) => (
                            <span
                              key={tIdx}
                              className="text-[9px] text-neutral-400 font-mono px-1.5 py-0.2 rounded bg-[#18181F] border border-[#24242C]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center pt-1 sm:pt-0">
                    {/* Quick Toggle Featured */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(post)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer min-h-[30px] flex items-center justify-center ${
                        post.isFeatured
                          ? 'text-[var(--theme-color,#FFA800)] border-[var(--theme-color,#FFA800)]/40 bg-[var(--theme-color,#FFA800)]/10'
                          : 'text-neutral-500 border-[#282830] bg-[#1A1A20] hover:text-white'
                      }`}
                      title={post.isFeatured ? 'Featured spotlight' : 'Mark as featured'}
                    >
                      <Star size={12} className={post.isFeatured ? 'fill-current' : ''} />
                    </button>

                    {/* Quick Toggle Status */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(post)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer min-h-[30px] flex items-center justify-center ${
                        post.status === 'published' || !post.status
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                          : 'text-neutral-500 border-[#282830] bg-[#1A1A20] hover:text-white'
                      }`}
                      title={post.status === 'published' ? 'Live published' : 'Draft mode'}
                    >
                      {post.status === 'published' || !post.status ? (
                        <Eye size={12} />
                      ) : (
                        <EyeOff size={12} />
                      )}
                    </button>

                    {/* Edit Button */}
                    <Link
                      href={`/admin/blog/${post._id || post.slug}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1E1E24] hover:bg-[#25252E] text-white text-xs font-semibold border border-[#2B2B33] transition cursor-pointer min-h-[30px]"
                    >
                      <Edit3 size={11} className="text-[var(--theme-color,#FFA800)]" />
                      <span>Edit</span>
                    </Link>

                    {/* View Live Article */}
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-[#1A1A20] hover:bg-[#22222A] text-neutral-400 hover:text-white border border-[#282830] transition cursor-pointer min-h-[30px] flex items-center justify-center"
                      title="View live article"
                    >
                      <ExternalLink size={12} />
                    </Link>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete('_id' in post ? String(post._id) : undefined, post.slug)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg bg-[#1A1A20] hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-[#282830] hover:border-rose-900/60 transition cursor-pointer disabled:opacity-50 min-h-[30px] flex items-center justify-center"
                      title="Delete article"
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

