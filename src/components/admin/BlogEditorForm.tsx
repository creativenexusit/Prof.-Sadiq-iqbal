'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  Loader2,
  ExternalLink,
  BookOpen,
  FileText,
  Upload,
  ArrowLeft,
  Calendar,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  ImageIcon,
  Sparkles,
  Clock,
  Tag,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { saveBlogPostAdmin, deleteBlogPostAdmin, uploadBlogImageAdmin } from '@/app/actions/blogCrud';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlogFormData = Record<string, any>;

/** Clean and extract direct image URLs if user pasted a Google Search result link */
function extractDirectImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  try {
    if (trimmed.includes('google.') && (trimmed.includes('imgurl=') || trimmed.includes('url='))) {
      const parsed = new URL(trimmed);
      const direct = parsed.searchParams.get('imgurl') || parsed.searchParams.get('url');
      if (direct) {
        return decodeURIComponent(direct);
      }
    }
  } catch {
    // ignore
  }
  return trimmed;
}

const COMMON_CATEGORIES = [
  'Artificial Intelligence',
  'Explainable AI',
  'Cybersecurity',
  'Machine Learning',
  'Cloud & Distributed Systems',
  'Higher Education',
  'Healthcare Informatics',
  'Academic Perspectives',
];

interface BlogEditorFormProps {
  initialData?: BlogFormData;
  isNew?: boolean;
}

export default function BlogEditorForm({ initialData, isNew = false }: BlogEditorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<BlogFormData>(() => {
    let initialContent = '';
    if (Array.isArray(initialData?.content)) {
      initialContent = initialData.content.join('\n\n');
    } else if (typeof initialData?.content === 'string') {
      initialContent = initialData.content;
    }

    const initialImageUrl =
      typeof initialData?.image === 'string'
        ? initialData.image
        : initialData?.image?.url || '';

    return {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      author: initialData?.author || 'Prof. Sadiq Iqbal',
      date:
        initialData?.date ||
        new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      category: initialData?.category || 'Artificial Intelligence',
      excerpt: initialData?.excerpt || '',
      readTime: initialData?.readTime || '5 min read',
      image: {
        url: initialImageUrl,
        publicId: initialData?.image?.publicId || '',
      },
      tags: Array.isArray(initialData?.tags) ? initialData.tags : ['Research', 'Technology'],
      rawContent: initialContent,
      isFeatured: Boolean(initialData?.isFeatured),
      status: initialData?.status || 'published',
      order: initialData?.order ?? 0,
    };
  });

  const [tagInput, setTagInput] = useState('');

  // Auto-slug creation
  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Estimate read time (avg 200 words per min)
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: isNew || !prev.slug ? slug : prev.slug,
    }));
  };

  // Add Tag
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setTagInput('');
  };

  // Remove Tag
  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_: unknown, i: number) => i !== index),
    }));
  };

  // Handle Image Upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setImageLoadError(false);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await uploadBlogImageAdmin(fd);
      if (res.success && res.url) {
        setFormData((prev) => ({
          ...prev,
          image: {
            url: res.url,
            publicId: res.publicId || '',
          },
        }));
        setStatus({ type: 'success', message: 'Article image uploaded!' });
      } else {
        setStatus({ type: 'error', message: res.error || 'Failed to upload image.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Image upload error.' });
    } finally {
      setUploadingImage(false);
    }
  }

  // Submit Handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Convert raw content into paragraphs array
    const paragraphs = formData.rawContent
      .split('\n\n')
      .map((p: string) => p.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title,
      slug: formData.slug,
      author: formData.author,
      date: formData.date,
      category: formData.category,
      excerpt: formData.excerpt,
      readTime: formData.readTime,
      image: formData.image,
      tags: formData.tags,
      content: paragraphs.length > 0 ? paragraphs : [formData.excerpt],
      isFeatured: formData.isFeatured,
      status: formData.status,
      order: Number(formData.order) || 0,
    };

    try {
      const postId = initialData?._id ? String(initialData._id) : undefined;
      await saveBlogPostAdmin(payload as Record<string, unknown>, postId);

      setStatus({ type: 'success', message: 'Article successfully saved!' });
      setTimeout(() => {
        router.push('/admin/blog');
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save blog post.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }

  // Delete Handler
  async function handleDelete() {
    if (!initialData?._id) return;
    if (!confirm('Are you sure you want to permanently delete this article?')) return;

    setDeleting(true);
    try {
      await deleteBlogPostAdmin(String(initialData._id));
      router.push('/admin/blog');
      router.refresh();
    } catch {
      setStatus({ type: 'error', message: 'Failed to delete article.' });
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto pb-6">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#1F1F24]">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Articles</span>
        </Link>

        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono truncate max-w-[180px] sm:max-w-md">
          {isNew ? 'New Article' : formData.title || 'Edit Article'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Notifications */}
        {status && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold animate-fade-in ${status.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            ) : (
              <X size={14} className="text-rose-400 shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            SECTION 1: TITLE, SLUG & CATEGORY
        ═══════════════════════════════════════════════ */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#1F1F24]">
            <BookOpen size={14} className="text-[var(--theme-color,#FFA800)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              1. Title &amp; Core Metadata
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Article Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Explainable AI in Clinical Healthcare: Bridging the Interpretability Gap"
                className="w-full px-3 py-2 rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white text-xs sm:text-sm placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)] transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  URL Slug <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="explainable-ai-clinical-healthcare"
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs font-mono placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Category <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Artificial Intelligence"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                  />
                  <datalist id="category-suggestions">
                    {COMMON_CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Prof. Sadiq Iqbal"
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Publication Date
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="January 2025"
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Estimated Read Time
                </label>
                <input
                  type="text"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  placeholder="6 min read"
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 2: FEATURED COVER PHOTO
        ═══════════════════════════════════════════════ */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#1F1F24]">
            <ImageIcon size={14} className="text-[var(--theme-color,#FFA800)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              2. Cover / Banner Image
            </h3>
          </div>

          <div className="p-3 rounded-xl border border-[#282830] bg-[#16161B] space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex items-center gap-2">
                {formData.image?.url && (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#282830] bg-[#101014] shrink-0 flex items-center justify-center">
                    {!imageLoadError ? (
                      <Image
                        src={formData.image.url}
                        alt="preview"
                        fill
                        unoptimized
                        className="object-cover"
                        onError={() => setImageLoadError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-amber-500/10 text-amber-400">
                        <ImageIcon size={13} />
                        <span className="text-[8px] leading-tight text-neutral-400">Broken</span>
                      </div>
                    )}
                  </div>
                )}
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22222A] text-white text-xs font-semibold hover:bg-[#2A2A34] transition min-h-[34px]">
                  {uploadingImage ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Upload size={12} />
                  )}
                  <span>{uploadingImage ? 'Uploading' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              <input
                type="text"
                value={formData.image?.url || ''}
                onChange={(e) => {
                  const cleaned = extractDirectImageUrl(e.target.value);
                  setImageLoadError(false);
                  setFormData({
                    ...formData,
                    image: {
                      ...formData.image,
                      url: cleaned,
                    },
                  });
                }}
                placeholder="Or paste direct image URL (Unsplash, Cloudinary, etc.)..."
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#141418] border border-[#282830] text-white min-h-[34px] focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 3: EXCERPT & TAGS
        ═══════════════════════════════════════════════ */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#1F1F24]">
            <Tag size={14} className="text-[var(--theme-color,#FFA800)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              3. Summary &amp; Tags
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Short Excerpt / Abstract <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Concise 2-3 sentence overview that appears on blog cards and search engine previews..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-lg bg-[#1A1A20] border border-[#282830] text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)] leading-relaxed resize-y"
              />
            </div>

            {/* Tags Adder */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Article Tags (Keywords)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {formData.tags.map((t: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1A1A20] border border-[#282830] text-xs font-medium text-white"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="hover:text-rose-400 transition cursor-pointer text-neutral-400"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type tag (e.g. DeepLearning) and press Enter"
                  className="flex-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)] min-h-[34px]"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1E1E24] hover:bg-[#25252E] border border-[#2B2B33] text-white text-xs font-semibold transition cursor-pointer min-h-[34px]"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 4: FULL ARTICLE CONTENT (Paragraphs)
        ═══════════════════════════════════════════════ */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1F1F24]">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-[var(--theme-color,#FFA800)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                4. Article Full Content
              </h3>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              Separate paragraphs with a blank line
            </span>
          </div>

          <textarea
            rows={12}
            required
            value={formData.rawContent}
            onChange={(e) => setFormData({ ...formData, rawContent: e.target.value })}
            placeholder="Write your in-depth scholarly article here. You can separate paragraphs by pressing Enter twice (leaving a blank line). Markdown formatting is also supported."
            className="w-full p-3 text-xs sm:text-sm rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)] leading-relaxed transition resize-y font-sans"
          />
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 5: VISIBILITY & STATUS
        ═══════════════════════════════════════════════ */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Featured */}
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#282830] bg-[#16161B] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded accent-[var(--theme-color,#FFA800)] cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-white block">Featured Article</span>
                <span className="text-[10px] text-neutral-400">Show in featured spotlight</span>
              </div>
            </label>

            {/* Status */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[#282830] bg-[#16161B]">
              <label className="text-xs font-semibold text-neutral-300">Status:</label>
              <select
                value={formData.status || 'published'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="flex-1 bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="published" className="bg-[#141418]">Published</option>
                <option value="draft" className="bg-[#141418]">Draft</option>
              </select>
            </div>

            {/* Order */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#282830] bg-[#16161B]">
              <label className="text-xs font-semibold text-neutral-300">Display Order:</label>
              <input
                type="number"
                min={0}
                value={formData.order ?? 0}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-16 px-2 py-1 rounded bg-[#101014] border border-[#282830] text-white text-xs font-mono text-center focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            STICKY ACTION BAR
        ═══════════════════════════════════════════════ */}
        <div className="sticky bottom-4 z-20 pt-2">
          <div className="p-3 rounded-xl sm:rounded-2xl bg-[#141418]/95 backdrop-blur-md border border-[#2B2B33] shadow-2xl flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs text-neutral-400 font-mono truncate">
                {isNew ? 'Ready to publish article' : 'Changes information'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isNew && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-2 rounded-xl border border-rose-900/40 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 text-xs font-semibold transition cursor-pointer min-h-[38px] flex items-center gap-1.5 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 size={13} className="animate-spin text-rose-400" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2 rounded-xl text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 hover:brightness-110 min-h-[38px]"
                style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-black" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

