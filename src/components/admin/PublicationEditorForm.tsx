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
  Link as LinkIcon,
  Quote,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Upload,
  Copy,
  Check,
  ImageIcon,
  X,
} from 'lucide-react';
import Image from 'next/image';
import {
  savePublicationAdmin,
  deletePublicationAdmin,
  uploadMediaAdmin,
} from '@/app/actions/adminCrud';
import { PublicationCategory } from '@/models/Publication';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PublicationFormData = Record<string, any>;

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

interface PublicationEditorFormProps {
  initialData?: PublicationFormData;
  isNew?: boolean;
}

const CATEGORY_OPTIONS: { id: PublicationCategory; label: string }[] = [
  { id: 'journal', label: 'Journal Article' },
  { id: 'conference', label: 'Conference Paper' },
  { id: 'book', label: 'Scholarly Book' },
  { id: 'book_chapter', label: 'Book Chapter' },
  { id: 'preprint', label: 'Preprint' },
];

export default function PublicationEditorForm({
  initialData,
  isNew = false,
}: PublicationEditorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [bibtexCopied, setBibtexCopied] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<PublicationFormData>(() => ({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    category: initialData?.category || 'journal',
    authors:
      initialData?.authors && initialData.authors.length > 0
        ? initialData.authors
        : ['Prof. Sadiq Iqbal'],
    journalOrPublisher: initialData?.journalOrPublisher || '',
    year: initialData?.year || new Date().getFullYear(),
    volume: initialData?.volume || '',
    issue: initialData?.issue || '',
    pages: initialData?.pages || '',
    doi: initialData?.doi || '',
    doiUrl: initialData?.doiUrl || '',
    publisherUrl: initialData?.publisherUrl || '',
    openAccessPdfUrl: initialData?.openAccessPdfUrl || '',
    codeRepositoryUrl: initialData?.codeRepositoryUrl || '',
    datasetUrl: initialData?.datasetUrl || '',
    abstract: initialData?.abstract || '',
    bibtex: initialData?.bibtex || '',
    citationCount: initialData?.citationCount ?? 0,
    coverImage: initialData?.coverImage || { url: '', publicId: '' },
    pdfFile: initialData?.pdfFile || { url: '', publicId: '' },
    isFeatured: Boolean(initialData?.isFeatured),
    status: initialData?.status || 'published',
  }));

  const [newAuthorInput, setNewAuthorInput] = useState('');

  // Auto-slug creation
  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: isNew || !prev.slug ? slug : prev.slug,
    }));
  };

  const handleAddAuthor = () => {
    if (!newAuthorInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      authors: [...(prev.authors || []), newAuthorInput.trim()],
    }));
    setNewAuthorInput('');
  };

  const handleRemoveAuthor = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      authors: (prev.authors || []).filter((_: unknown, i: number) => i !== idx),
    }));
  };

  // Cover Image Upload Handler
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setImageLoadError(false);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'academic_portfolio/publications');

    try {
      const res = await uploadMediaAdmin(fd);
      if (res.success && res.url) {
        setFormData((prev) => ({
          ...prev,
          coverImage: {
            url: res.url,
            publicId: res.publicId || '',
          },
        }));
        setStatus({ type: 'success', message: 'Cover image uploaded!' });
      } else {
        setStatus({ type: 'error', message: res.error || 'Failed to upload image.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Image upload error.' });
    } finally {
      setUploadingCover(false);
    }
  }

  // PDF Document Upload Handler
  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'academic_portfolio/documents');

    try {
      const res = await uploadMediaAdmin(fd);
      if (res.success && res.url) {
        setFormData((prev) => ({
          ...prev,
          pdfFile: {
            url: res.url,
            publicId: res.publicId || '',
          },
          openAccessPdfUrl: res.url, // also populate URL field
        }));
        setStatus({ type: 'success', message: 'PDF document uploaded!' });
      } else {
        setStatus({ type: 'error', message: res.error || 'Failed to upload PDF.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'PDF upload error.' });
    } finally {
      setUploadingPdf(false);
    }
  }

  // BibTeX Template Generator
  const generateBibtexTemplate = () => {
    const cleanKey = (formData.slug || 'publication')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
    const authorsStr = (formData.authors || []).join(' and ');
    const bib = `@article{${cleanKey}${formData.year || '2025'},
  title = {${formData.title || 'Untitled'}},
  author = {${authorsStr}},
  journal = {${formData.journalOrPublisher || 'Journal / Venue'}},
  year = {${formData.year || 2025}},
  volume = {${formData.volume || ''}},
  number = {${formData.issue || ''}},
  pages = {${formData.pages || ''}},
  doi = {${formData.doi || formData.doiUrl || ''}}
}`;
    setFormData((prev) => ({ ...prev, bibtex: bib }));
  };

  // Copy BibTeX to clipboard
  const copyBibtex = () => {
    if (!formData.bibtex) return;
    navigator.clipboard.writeText(formData.bibtex);
    setBibtexCopied(true);
    setTimeout(() => setBibtexCopied(false), 2000);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const pubId = initialData?._id ? String(initialData._id) : undefined;
      await savePublicationAdmin(formData as Record<string, unknown>, pubId);

      setStatus({ type: 'success', message: 'Publication successfully saved!' });
      setTimeout(() => {
        router.push('/admin/publications');
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save publication.';
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!initialData?._id) return;
    if (!confirm('Are you sure you want to permanently delete this publication?')) return;

    setDeleting(true);
    try {
      await deletePublicationAdmin(String(initialData._id));
      router.push('/admin/publications');
      router.refresh();
    } catch {
      setStatus({ type: 'error', message: 'Failed to delete publication.' });
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto pb-6">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#1F1F24]">
        <Link
          href="/admin/publications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Publications</span>
        </Link>

        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono truncate max-w-[180px] sm:max-w-md">
          {isNew ? 'New Publication' : formData.title || 'Edit Paper'}
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
          SECTION 1: TITLE & CATEGORY
      ═══════════════════════════════════════════════ */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#1F1F24]">
            <BookOpen size={14} className="text-[var(--theme-color,#FFA800)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              1. Title &amp; Category
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Publication Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Deep Learning Approaches for Autonomous UAV Routing"
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
                  placeholder="deep-learning-autonomous-uav"
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs font-mono placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Publication Year <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1990}
                  max={2035}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>
            </div>

            {/* Category Selector Buttons */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = formData.category === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer ${isSelected
                          ? 'bg-[var(--theme-color,#FFA800)]/15 border-[var(--theme-color,#FFA800)] text-white font-bold shadow-sm'
                          : 'bg-[#1A1A20] border-[#282830] text-neutral-400 hover:border-neutral-600 hover:text-white'
                        }`}
                    >
                      <span className="text-[11px] font-semibold block truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
          SECTION 2: AUTHORS & VENUE
      ═══════════════════════════════════════════════ */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#1F1F24]">
            <Users size={14} className="text-[var(--theme-color,#FFA800)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              2. Authors &amp; Academic Venue
            </h3>
          </div>

          <div className="space-y-3">
            {/* Authors List */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Authors List (In citation order)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {(formData.authors || []).map((author: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1A1A20] border border-[#282830] text-xs font-medium text-white"
                  >
                    <span>{author}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAuthor(idx)}
                      className="hover:text-rose-400 transition cursor-pointer text-neutral-400"
                      title="Remove author"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newAuthorInput}
                  onChange={(e) => setNewAuthorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAuthor();
                    }
                  }}
                  placeholder="Add author name and press Enter"
                  className="flex-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)] min-h-[34px]"
                />
                <button
                  type="button"
                  onClick={handleAddAuthor}
                  className="px-3 py-1.5 rounded-lg bg-[#1E1E24] hover:bg-[#25252E] border border-[#2B2B33] text-white text-xs font-semibold transition cursor-pointer min-h-[34px]"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Journal / Publisher / Conference Venue <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.journalOrPublisher}
                onChange={(e) => setFormData({ ...formData, journalOrPublisher: e.target.value })}
                placeholder="e.g. IEEE Transactions on Information Forensics and Security"
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 mb-0.5">Volume</label>
                <input
                  type="text"
                  value={formData.volume || ''}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  placeholder="19"
                  className="w-full px-2 py-1.5 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs focus:outline-none focus:border-[var(--theme-color,#FFA800)] text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 mb-0.5">Issue</label>
                <input
                  type="text"
                  value={formData.issue || ''}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  placeholder="4"
                  className="w-full px-2 py-1.5 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs focus:outline-none focus:border-[var(--theme-color,#FFA800)] text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 mb-0.5">Pages</label>
                <input
                  type="text"
                  value={formData.pages || ''}
                  onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                  placeholder="1120-1135"
                  className="w-full px-2 py-1.5 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs focus:outline-none focus:border-[var(--theme-color,#FFA800)] text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
          SECTION 3: DOI & ACCESS LINKS
      ═══════════════════════════════════════════════ */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#1F1F24]">
            <LinkIcon size={14} className="text-[var(--theme-color,#FFA800)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              3. Digital Identifiers &amp; Links
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                DOI Identifier / URL
              </label>
              <input
                type="text"
                value={formData.doiUrl || formData.doi || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    doiUrl: val,
                    doi: val.replace(/^https?:\/\/doi\.org\//, ''),
                  });
                }}
                placeholder="https://doi.org/10.1109/..."
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs font-mono placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Publisher Article URL
              </label>
              <input
                type="text"
                value={formData.publisherUrl || ''}
                onChange={(e) => setFormData({ ...formData, publisherUrl: e.target.value })}
                placeholder="https://ieeexplore.ieee.org/document/..."
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Code Repository URL
              </label>
              <input
                type="text"
                value={formData.codeRepositoryUrl || ''}
                onChange={(e) => setFormData({ ...formData, codeRepositoryUrl: e.target.value })}
                placeholder="https://github.com/lab/repo"
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Dataset / Benchmark URL
              </label>
              <input
                type="text"
                value={formData.datasetUrl || ''}
                onChange={(e) => setFormData({ ...formData, datasetUrl: e.target.value })}
                placeholder="https://zenodo.org/record/..."
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
          SECTION 4: COVER IMAGE & PDF DOCUMENT UPLOAD
      ═══════════════════════════════════════════════ */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#1F1F24]">
            <FileText size={14} className="text-[var(--theme-color,#FFA800)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              4. Cover Thumbnail &amp; PDF Upload
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Cover Image Upload */}
            <div className="p-3 rounded-xl border border-[#282830] bg-[#16161B] space-y-2">
              <label className="block text-[11px] font-semibold text-neutral-300">
                Cover Image / Thumbnail
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  {formData.coverImage?.url && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#282830] bg-[#101014] shrink-0 flex items-center justify-center">
                      {!imageLoadError ? (
                        <Image
                          src={formData.coverImage.url}
                          alt="cover"
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
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22222A] text-white text-xs font-semibold hover:bg-[#2A2A34] transition min-h-[32px]">
                    {uploadingCover ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Upload size={11} />
                    )}
                    <span>{uploadingCover ? 'Uploading' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                      disabled={uploadingCover}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.coverImage?.url || ''}
                  onChange={(e) => {
                    const cleaned = extractDirectImageUrl(e.target.value);
                    setImageLoadError(false);
                    setFormData({
                      ...formData,
                      coverImage: {
                        ...formData.coverImage,
                        url: cleaned,
                      },
                    });
                  }}
                  placeholder="Or paste cover URL..."
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#141418] border border-[#282830] text-white min-h-[32px] focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>
            </div>

            {/* PDF File Upload */}
            <div className="p-3 rounded-xl border border-[#282830] bg-[#16161B] space-y-2">
              <label className="block text-[11px] font-semibold text-neutral-300">
                Open Access PDF Document
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22222A] text-white text-xs font-semibold hover:bg-[#2A2A34] transition min-h-[32px] shrink-0">
                  {uploadingPdf ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Upload size={11} />
                  )}
                  <span>{uploadingPdf ? 'Uploading PDF' : 'Upload PDF'}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    disabled={uploadingPdf}
                  />
                </label>
                <input
                  type="text"
                  value={formData.openAccessPdfUrl || ''}
                  onChange={(e) => setFormData({ ...formData, openAccessPdfUrl: e.target.value })}
                  placeholder="Or direct PDF URL (e.g. arXiv)..."
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#141418] border border-[#282830] text-white min-h-[32px] focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>
              {formData.openAccessPdfUrl && (
                <a
                  href={formData.openAccessPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-1 pt-0.5"
                >
                  <span>View current PDF link</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
          SECTION 5: ABSTRACT & RESEARCH SUMMARY
      ═══════════════════════════════════════════════ */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F1F24]">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-[var(--theme-color,#FFA800)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                5. Abstract &amp; Summary
              </h3>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              {formData.abstract?.length || 0} chars
            </span>
          </div>

          <textarea
            rows={4}
            value={formData.abstract || ''}
            onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
            placeholder="Academic abstract detailing objectives, methodology, and key theoretical/empirical results..."
            className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#1A1A20] border border-[#282830] text-white text-xs sm:text-sm placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)] leading-relaxed transition resize-y"
          />
        </div>

        {/* ═══════════════════════════════════════════════
          SECTION 6: BIBTEX CITATION
      ═══════════════════════════════════════════════ */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F1F24]">
            <div className="flex items-center gap-2">
              <Quote size={14} className="text-[var(--theme-color,#FFA800)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                6. BibTeX Citation Code
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={generateBibtexTemplate}
                className="text-[10px] text-[var(--theme-color,#FFA800)] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                title="Auto-fill BibTeX from fields"
              >
                <Sparkles size={10} />
                <span>Generate</span>
              </button>
              {formData.bibtex && (
                <button
                  type="button"
                  onClick={copyBibtex}
                  className="text-[10px] text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded bg-[#1E1E24] border border-[#282830]"
                >
                  {bibtexCopied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  <span>{bibtexCopied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>

          <textarea
            rows={3}
            value={formData.bibtex || ''}
            onChange={(e) => setFormData({ ...formData, bibtex: e.target.value })}
            placeholder="@article{...}"
            className="w-full p-2.5 sm:p-3 rounded-lg bg-[#1A1A20] border border-[#282830] text-neutral-300 text-xs font-mono placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)] leading-relaxed transition"
          />
        </div>

        {/* ═══════════════════════════════════════════════
          SECTION 7: SPOTLIGHT & VISIBILITY
      ═══════════════════════════════════════════════ */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded accent-[var(--theme-color,#FFA800)] cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-white block">
                  Featured Publication
                </span>
                <span className="text-[10px] text-neutral-400">
                  Display on homepage spotlight and top of research portfolio
                </span>
              </div>
            </label>

            <div className="flex items-center gap-2 shrink-0">
              <label className="text-xs text-neutral-400 font-semibold">Citations:</label>
              <input
                type="number"
                min={0}
                value={formData.citationCount || 0}
                onChange={(e) => setFormData({ ...formData, citationCount: Number(e.target.value) })}
                className="w-20 px-2.5 py-1 rounded-lg bg-[#1A1A20] border border-[#282830] text-white text-xs font-mono text-center focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
          STICKY SAVE ACTION BAR (Mobile Responsive)
      ═══════════════════════════════════════════════ */}
        <div className="sticky bottom-4 z-20 pt-2">
          <div className="p-3 rounded-xl sm:rounded-2xl bg-[#141418]/95 backdrop-blur-md border border-[#2B2B33] shadow-2xl flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs text-neutral-400 font-mono truncate">
                {isNew ? 'Ready to publish' : 'Changes information'}
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
