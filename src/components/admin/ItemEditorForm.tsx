'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AcademicItemCategory } from '@/models/AcademicItem';
import {
  saveAcademicItemAdmin,
  deleteAcademicItemAdmin,
  uploadMediaAdmin,
} from '@/app/actions/adminCrud';
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ImageIcon,
} from 'lucide-react';
import Image from 'next/image';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AcademicItemData = Record<string, any>;

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
    // ignore URL parsing error
  }
  return trimmed;
}

interface ItemEditorFormProps {
  initialData?: AcademicItemData;
  initialCategory?: string;
  isNew?: boolean;
}

export default function ItemEditorForm({
  initialData,
  initialCategory = 'gallery',
  isNew = false,
}: ItemEditorFormProps) {
  const router = useRouter();

  const defaultItem: AcademicItemData = {
    title: '',
    slug: '',
    category: (initialCategory !== 'all' ? initialCategory : 'gallery') as AcademicItemCategory,
    description: '',
    dateOrPeriod: '',
    externalLink: '',
    image: { url: '', publicId: '', caption: '' },
    metaDetails: {
      galleryCategory: 'Conference',
      galleryLocation: '',
      patentNumber: '',
      patentStatus: 'Granted',
      memberRole: 'PhD Candidate',
      currentAffiliation: '',
      courseCode: '',
      level: 'Graduate',
      fundingAgency: '',
      grantAmount: '',
      talkType: 'Keynote',
      eventVenue: '',
    },
    isFeatured: false,
    status: 'published',
    order: 0,
  };

  const [formData, setFormData] = useState<AcademicItemData>({
    ...defaultItem,
    ...(initialData || {}),
    metaDetails: {
      ...defaultItem.metaDetails,
      ...(initialData?.metaDetails || {}),
    },
    image: {
      ...defaultItem.image,
      ...(initialData?.image || {}),
    },
  });

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setImageLoadError(false);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', `academic_portfolio/${formData.category || 'gallery'}`);

    try {
      const res = await uploadMediaAdmin(fd);
      if (res.success && res.url) {
        setFormData((prev) => ({
          ...prev,
          image: {
            url: res.url,
            publicId: res.publicId || '',
            caption: prev.image?.caption || '',
          },
        }));
        setImageLoadError(false);
        setStatus({ type: 'success', message: 'Photo uploaded successfully!' });
      } else {
        setStatus({ type: 'error', message: res.error || 'Failed to upload photo.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Photo upload error. Please try again.' });
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const id = !isNew && '_id' in formData ? String(formData._id) : undefined;
      const res = await saveAcademicItemAdmin(formData as Record<string, unknown>, id);

      if (res?.success) {
        setStatus({ type: 'success', message: 'Item saved successfully!' });
        setTimeout(() => {
          router.push('/admin/items');
          router.refresh();
        }, 600);
      } else {
        setStatus({ type: 'error', message: 'Failed to save item.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to permanently delete this item?')) return;
    setDeleting(true);

    try {
      const id = '_id' in formData ? String(formData._id) : undefined;
      if (id) {
        await deleteAcademicItemAdmin(id);
      }
      router.push('/admin/items');
      router.refresh();
    } catch {
      setStatus({ type: 'error', message: 'Failed to delete item.' });
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto pb-6">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#1F1F24]">
        <Link
          href="/admin/items"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Items</span>
        </Link>

        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono truncate max-w-[180px] sm:max-w-md">
          {isNew ? 'New Item' : formData.title || 'Edit Item'}
        </span>
      </div>

      {/* Notifications */}
      {status && (
        <div
          className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl text-xs transition-all ${
            status.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/40 border border-red-500/40 text-red-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={15} className="text-red-400 shrink-0" />
          )}
          <span className="truncate">{status.message}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category || 'gallery'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as AcademicItemCategory,
                  })
                }
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
              >
                <option value="gallery">Gallery Photo (/about gallery)</option>
                <option value="project">Project (/research funded projects)</option>
                <option value="patent">Patent (/research patents)</option>
                <option value="lab_member">Lab Member / Alumni (/students)</option>
                <option value="teaching">Teaching Course (/experience courses)</option>
                <option value="talk">Event & Keynote (/events page)</option>
                <option value="news">News / Media</option>
              </select>
            </div>

            {/* Date or Period */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Timeline / Period
              </label>
              <input
                type="text"
                value={formData.dateOrPeriod || ''}
                onChange={(e) =>
                  setFormData({ ...formData, dateOrPeriod: e.target.value })
                }
                placeholder="e.g. 2024, Fall 2024, Ongoing"
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
              />
            </div>

            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Title / Name *
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => {
                  const title = e.target.value;
                  const slug = title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                  setFormData({
                    ...formData,
                    title,
                    slug: formData.slug || slug,
                  });
                }}
                placeholder="Enter title or headline"
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Description / Summary
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief summary or details about this item..."
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)] resize-y leading-relaxed"
              />
            </div>

            {/* External Link */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                External Link (Optional)
              </label>
              <input
                type="text"
                value={formData.externalLink || ''}
                onChange={(e) =>
                  setFormData({ ...formData, externalLink: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
              />
            </div>

            {/* Image Upload Box */}
            <div className="sm:col-span-2 p-3 rounded-xl border border-[#282830] bg-[#16161B] space-y-2">
              <label className="block text-[11px] font-semibold text-neutral-300">
                Item Photo / Image
              </label>
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
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22222A] text-white text-xs font-semibold hover:bg-[#2A2A34] transition min-h-[32px]">
                    {uploadingImage ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Upload size={11} />
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
                  placeholder="Or paste direct image URL (e.g. Unsplash, Cloudinary, etc.)..."
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#141418] border border-[#282830] text-white min-h-[32px] focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>
            </div>

            {/* Dynamic Category Specific Meta Details */}
            {formData.category === 'gallery' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Gallery Album
                  </label>
                  <select
                    value={formData.metaDetails?.galleryCategory || 'Conference'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDetails: {
                          ...formData.metaDetails,
                          galleryCategory: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                  >
                    <option value="Conference">Conference</option>
                    <option value="Award Ceremony">Award Ceremony</option>
                    <option value="Lab Life">Lab Life</option>
                    <option value="Campus">Campus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.metaDetails?.galleryLocation || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDetails: {
                          ...formData.metaDetails,
                          galleryLocation: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Dhaka, Bangladesh"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                  />
                </div>
              </>
            )}

            {formData.category === 'project' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Funding Agency
                  </label>
                  <input
                    type="text"
                    value={formData.metaDetails?.fundingAgency || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDetails: {
                          ...formData.metaDetails,
                          fundingAgency: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. CERET / BU Research Fund"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Grant Amount
                  </label>
                  <input
                    type="text"
                    value={formData.metaDetails?.grantAmount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDetails: {
                          ...formData.metaDetails,
                          grantAmount: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. $25,000"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                  />
                </div>
              </>
            )}

            {formData.category === 'patent' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Patent Number
                  </label>
                  <input
                    type="text"
                    value={formData.metaDetails?.patentNumber || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDetails: {
                          ...formData.metaDetails,
                          patentNumber: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. BD/US Patent #12345"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Patent Status
                  </label>
                  <select
                    value={formData.metaDetails?.patentStatus || 'Granted'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDetails: {
                          ...formData.metaDetails,
                          patentStatus: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                  >
                    <option value="Granted">Granted</option>
                    <option value="Pending">Pending</option>
                    <option value="Filed">Filed</option>
                  </select>
                </div>
              </>
            )}

            {formData.category === 'lab_member' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Member Role
                  </label>
                  <input
                    type="text"
                    value={formData.metaDetails?.memberRole || 'PhD Candidate'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDetails: {
                          ...formData.metaDetails,
                          memberRole: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. PhD Candidate, Postdoc, Alumni"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Current Affiliation
                  </label>
                  <input
                    type="text"
                    value={formData.metaDetails?.currentAffiliation || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDetails: {
                          ...formData.metaDetails,
                          currentAffiliation: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Researcher at Tech Corp"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                  />
                </div>
              </>
            )}

            {formData.category === 'teaching' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={formData.metaDetails?.courseCode || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDetails: {
                          ...formData.metaDetails,
                          courseCode: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. CSE-4101"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Course Level
                  </label>
                  <select
                    value={formData.metaDetails?.level || 'Graduate'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDetails: {
                          ...formData.metaDetails,
                          level: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </>
            )}

            {formData.category === 'talk' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Event / Talk Type
                  </label>
                  <select
                    value={formData.metaDetails?.talkType || 'Keynote'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDetails: {
                          ...formData.metaDetails,
                          talkType: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                  >
                    <option value="Keynote">Keynote</option>
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Invited Talk">Invited Talk</option>
                    <option value="Guest Lecture">Guest Lecture</option>
                    <option value="Conference Presentation">Conference Presentation</option>
                    <option value="Panel Discussion">Panel Discussion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    Event Venue
                  </label>
                  <input
                    type="text"
                    value={formData.metaDetails?.eventVenue || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDetails: {
                          ...formData.metaDetails,
                          eventVenue: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Auditorium / Conference Hall"
                    className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
                  />
                </div>
              </>
            )}

            {/* Display Order Sequence */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Display Order / Sequence
              </label>
              <input
                type="number"
                value={formData.order ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value, 10) || 0,
                  })
                }
                placeholder="0"
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs rounded-xl bg-[#1A1A20] border border-[#282830] text-white"
              />
              <span className="text-[10px] text-neutral-500 block mt-1">
                Smaller numbers (0, 1, 2...) appear first on the page.
              </span>
            </div>

            {/* Featured Checkbox */}
            <div className="sm:col-span-2 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isFeatured || false}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    formData.isFeatured
                      ? 'border-[var(--theme-color,#FFA800)] bg-[var(--theme-color,#FFA800)] text-black'
                      : 'border-[#444444] bg-[#1A1A20]'
                  }`}
                >
                  {formData.isFeatured && <span className="text-[10px] font-black">✓</span>}
                </span>
                <span className="text-xs text-neutral-300">
                  Feature this item on homepage / portfolio highlights
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Sticky / Fixed Bottom Actions Bar */}
        <div className="sticky bottom-2.5 sm:bottom-4 z-20 pt-1">
          <div className="px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#141418]/95 backdrop-blur-md border border-[#2B2B33] shadow-2xl flex flex-row items-center justify-between gap-2">
            {!isNew ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-950/60 bg-red-950/30 text-red-300 hover:bg-red-900/40 text-xs font-semibold transition min-h-[34px] cursor-pointer"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            ) : (
              <Link
                href="/admin/items"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2B2B33] bg-[#1A1A20] text-neutral-300 hover:text-white text-xs font-semibold transition min-h-[34px]"
              >
                Cancel
              </Link>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 hover:brightness-110 min-h-[34px] sm:min-h-[38px]"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin text-black shrink-0" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={13} className="shrink-0" />
                  <span>{isNew ? 'Create Item' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

