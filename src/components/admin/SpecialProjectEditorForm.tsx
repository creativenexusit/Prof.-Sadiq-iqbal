'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  Loader2,
  X,
} from 'lucide-react';
import {
  saveSpecialProjectAdmin,
  deleteSpecialProjectAdmin,
} from '@/app/actions/specialProjectCrud';
import { uploadMediaAdmin } from '@/app/actions/adminCrud';

export interface SpecialProjectFormData {
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

interface SpecialProjectEditorFormProps {
  initialData?: SpecialProjectFormData;
  isNew?: boolean;
}

export default function SpecialProjectEditorForm({
  initialData,
  isNew = false,
}: SpecialProjectEditorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | 'thumbnail' | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<SpecialProjectFormData>(() => {
    const rawGallery = initialData?.gallery || [];
    const gallerySlots = [0, 1, 2, 3].map((idx) => rawGallery[idx] || { url: '', publicId: '' });

    return {
      _id: initialData?._id,
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      subtitle: initialData?.subtitle || '',
      description: initialData?.description || '',
      thumbnail: initialData?.thumbnail || { url: '', publicId: '' },
      gallery: gallerySlots,
      tags: initialData?.tags || [],
      projectUrl: initialData?.projectUrl || '',
      githubUrl: initialData?.githubUrl || '',
      isFeatured: initialData?.isFeatured ?? true,
      status: initialData?.status || 'published',
      order: initialData?.order ?? 0,
    };
  });

  const [tagsInput, setTagsInput] = useState(() => (formData.tags || []).join(', '));

  // Auto-slug generator on title edit if new
  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const updated = { ...prev, title: val };
      if (isNew && !prev.slug) {
        updated.slug = val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  const handleFileUpload = async (file: File, slot: number | 'thumbnail') => {
    setUploadingSlot(slot);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('folder', 'special-projects');

      const res = await uploadMediaAdmin(data);
      if (!res.success || !res.url) {
        throw new Error(res.error || 'Upload failed');
      }

      if (slot === 'thumbnail') {
        setFormData((prev) => ({
          ...prev,
          thumbnail: { url: res.url, publicId: res.publicId || '' },
        }));
      } else {
        setFormData((prev) => {
          const nextG = [...prev.gallery];
          nextG[slot] = { url: res.url, publicId: res.publicId || '' };
          return { ...prev, gallery: nextG };
        });
      }
      setStatusMsg({ type: 'success', text: 'Image uploaded successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Image upload failed' });
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setStatusMsg({ type: 'error', text: 'Project title is required' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        tags: parsedTags,
        gallery: formData.gallery.filter((g) => Boolean(g?.url)),
      };

      const res = await saveSpecialProjectAdmin(payload, isNew ? undefined : formData._id);
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Special project saved successfully!' });
        setTimeout(() => {
          router.push('/admin/special-projects');
          router.refresh();
        }, 600);
      } else {
        throw new Error(res.message || 'Save failed');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to save special project.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData._id) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${formData.title}"?`)) return;

    setDeleting(true);
    try {
      const res = await deleteSpecialProjectAdmin(formData._id);
      if (res.success) {
        router.push('/admin/special-projects');
        router.refresh();
      } else {
        throw new Error(res.message || 'Delete failed');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to delete special project.' });
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* ═══════════════════════════════════════════════
          STICKY TOP BAR: BACK, TITLE & SAVE ACTION
      ═══════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#141418]/95 backdrop-blur-md border border-[#222226] shadow-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/admin/special-projects"
            className="p-2 rounded-xl bg-[#1C1C22] hover:bg-[#282830] text-neutral-300 hover:text-white border border-[#282830] transition-colors shrink-0"
            title="Back to Special Projects"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
              {isNew ? 'New Special Project' : `Edit: ${formData.title || 'Untitled'}`}
            </h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Dedicated showcase item with up to 4-image gallery and floating trigger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isNew && formData._id && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Delete Project"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || deleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-black text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} strokeWidth={2.5} />}
            <span>{loading ? 'Saving...' : isNew ? 'Create Project' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMsg && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-xs transition-all ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/40 border border-red-500/40 text-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* FORM BODY */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ═══════════════════════════════════════════════
            SECTION 1: CORE INFORMATION
        ═══════════════════════════════════════════════ */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141418] border border-[#222226] space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#1F1F24]">
            <Sparkles size={15} className="text-[var(--theme-color,#FFA800)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              1. Project Identification
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Project Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Deep Clinical Vision & Telemedicine Diagnostic Platform"
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A20] border border-[#282830] text-white text-xs sm:text-sm placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)] transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  URL Slug <span className="text-neutral-500">(Auto-generated or custom)</span>
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="deep-clinical-vision-telemedicine"
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A20] border border-[#282830] text-white text-xs font-mono placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Subtitle / Badge Text (&quot;Sub&quot;)
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Flagship Research Project & Clinical AI Framework"
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A20] border border-[#282830] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Project Description &amp; Overview <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A detailed explanation of the project, research objectives, methodologies, and technological breakthroughs..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#1A1A20] border border-[#282830] text-white text-xs sm:text-sm placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)] resize-y"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 2: PRIMARY THUMBNAIL
        ═══════════════════════════════════════════════ */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141418] border border-[#222226] space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1F1F24]">
            <div className="flex items-center gap-2">
              <ImageIcon size={15} className="text-[var(--theme-color,#FFA800)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                2. Primary Project Thumbnail
              </h2>
            </div>
            {formData.thumbnail?.url && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, thumbnail: { url: '', publicId: '' } })}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear Image
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-[#0D0D10] border border-[#282830] overflow-hidden shrink-0 flex items-center justify-center">
              {formData.thumbnail?.url ? (
                <Image
                  src={formData.thumbnail.url}
                  alt="Thumbnail Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <ImageIcon size={28} className="text-neutral-600" />
              )}
            </div>

            <div className="flex-1 w-full space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Thumbnail Image URL
                </label>
                <input
                  type="text"
                  value={formData.thumbnail?.url || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      thumbnail: { ...formData.thumbnail, url: e.target.value },
                    })
                  }
                  placeholder="https://... or upload below"
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A20] border border-[#282830] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1C1C22] hover:bg-[#282830] text-neutral-200 text-xs font-semibold cursor-pointer border border-[#2E2E38] transition-colors">
                  {uploadingSlot === 'thumbnail' ? (
                    <Loader2 size={13} className="animate-spin text-[var(--theme-color,#FFA800)]" />
                  ) : (
                    <Upload size={13} />
                  )}
                  <span>{uploadingSlot === 'thumbnail' ? 'Uploading...' : 'Upload Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingSlot === 'thumbnail'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'thumbnail');
                    }}
                  />
                </label>
                <span className="text-[11px] text-neutral-500">
                  PNG, JPG or WebP recommended
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 3: 4-IMAGE GALLERY SHOWCASE
        ═══════════════════════════════════════════════ */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141418] border border-[#222226] space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1F1F24]">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-[var(--theme-color,#FFA800)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                3. Project Gallery (4 Images)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-[#1A1A20] border border-[#282830]">
              4 Slots Available
            </span>
          </div>

          <p className="text-[11px] text-neutral-400">
            These four images appear in the interactive visual documentation and modal carousel.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[0, 1, 2, 3].map((slot) => {
              const img = formData.gallery[slot] || { url: '', publicId: '' };
              return (
                <div
                  key={slot}
                  className="p-3.5 rounded-xl bg-[#17171C] border border-[#24242C] flex items-center gap-3.5"
                >
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-[#0D0D10] border border-[#282830] overflow-hidden shrink-0 flex items-center justify-center">
                    {img.url ? (
                      <Image
                        src={img.url}
                        alt={`Gallery Image #${slot + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-mono text-xs font-bold text-neutral-600">
                        #{slot + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      type="text"
                      value={img.url}
                      onChange={(e) => {
                        const nextG = [...formData.gallery];
                        nextG[slot] = { ...nextG[slot], url: e.target.value };
                        setFormData({ ...formData, gallery: nextG });
                      }}
                      placeholder={`Image #${slot + 1} URL`}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#121216] border border-[#262630] text-white text-xs truncate focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                    />

                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1F1F26] hover:bg-[#282832] text-neutral-300 text-[11px] font-medium cursor-pointer border border-[#2C2C38] transition-colors">
                        {uploadingSlot === slot ? (
                          <Loader2 size={11} className="animate-spin text-[var(--theme-color,#FFA800)]" />
                        ) : (
                          <Upload size={11} />
                        )}
                        <span>{uploadingSlot === slot ? '...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingSlot === slot}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, slot);
                          }}
                        />
                      </label>

                      {img.url && (
                        <button
                          type="button"
                          onClick={() => {
                            const nextG = [...formData.gallery];
                            nextG[slot] = { url: '', publicId: '' };
                            setFormData({ ...formData, gallery: nextG });
                          }}
                          className="text-[11px] text-red-400 hover:text-red-300 font-medium px-1.5 py-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 4: METADATA, LINKS & VISIBILITY
        ═══════════════════════════════════════════════ */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141418] border border-[#222226] space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#1F1F24]">
            <ExternalLink size={15} className="text-[var(--theme-color,#FFA800)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              4. External Links, Tags &amp; Visibility
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Domain &amp; Tech Stack Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Machine Learning, Explainable AI, Healthcare, Distributed Systems"
                className="w-full px-3 py-2 rounded-xl bg-[#1A1A20] border border-[#282830] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Live Project / Deployment Link
                </label>
                <div className="relative">
                  <ExternalLink size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="url"
                    value={formData.projectUrl || ''}
                    onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                    placeholder="https://example.com/project"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#1A1A20] border border-[#282830] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Source Code / GitHub Link
                </label>
                <div className="relative">
                  <Code2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="url"
                    value={formData.githubUrl || ''}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username/project"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#1A1A20] border border-[#282830] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A20] border border-[#282830] text-white text-xs focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'published' | 'draft',
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A20] border border-[#282830] text-white text-xs focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                >
                  <option value="published">Published (Visible)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Featured Showcase
                </label>
                <select
                  value={formData.isFeatured ? 'true' : 'false'}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.value === 'true' })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1A20] border border-[#282830] text-white text-xs focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                >
                  <option value="true">Featured (Show in Center Floating Pill)</option>
                  <option value="false">Standard Project</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/special-projects"
            className="px-4 py-2.5 rounded-xl bg-[#1C1C22] hover:bg-[#282830] text-neutral-300 hover:text-white text-xs font-semibold border border-[#282830] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || deleting}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-black text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} strokeWidth={2.5} />}
            <span>{loading ? 'Saving...' : isNew ? 'Create Special Project' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

