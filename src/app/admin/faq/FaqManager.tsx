'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Upload,
  ExternalLink,
  Search,
  Check,
  Star,
  Eye,
  EyeOff,
  Loader2,
  HelpCircle,
  MessageCircleQuestion,
  GraduationCap,
  FlaskConical,
  BookOpen,
  Mail,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
  Filter,
} from 'lucide-react';
import { saveFaqAdmin, deleteFaqAdmin, uploadFaqPdfAdmin } from '@/app/actions/faqCrud';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FaqData = Record<string, any>;

export const FAQ_CATEGORIES = [
  { value: 'general', label: 'General', icon: HelpCircle, color: '#A855F7' },
  { value: 'admission', label: 'Admission', icon: GraduationCap, color: '#38BDF8' },
  { value: 'research', label: 'Research & Lab', icon: FlaskConical, color: '#34D399' },
  { value: 'supervision', label: 'Supervision', icon: Users, color: '#FBBF24' },
  { value: 'courses', label: 'Teaching & Courses', icon: BookOpen, color: '#F472B6' },
  { value: 'contact', label: 'Office Hours', icon: Mail, color: '#22D3EE' },
  { value: 'recommendation', label: 'Recommendation', icon: Award, color: '#F87171' },
  { value: 'publication', label: 'Publications', icon: MessageCircleQuestion, color: '#FFA800' },
];

function getCategoryMeta(val: string) {
  return FAQ_CATEGORIES.find((c) => c.value === val) || FAQ_CATEGORIES[0];
}

const EMPTY_FAQ: FaqData = {
  question: '',
  answer: '',
  category: 'general',
  pdfFile: { url: '', publicId: '', fileName: '' },
  isFeatured: false,
  status: 'published',
  order: 0,
};

// Sample academic starter FAQs if the database is initially empty
const STARTER_FAQS: FaqData[] = [
  {
    question: 'How can undergraduate students apply for a Letter of Recommendation (LOR)?',
    answer:
      'Students who have completed at least two courses with me and achieved a minimum grade of A- are eligible. Please submit your request at least 3 weeks prior to your application deadline, including your updated CV, unofficial transcript, and draft statement of purpose.',
    category: 'recommendation',
    isFeatured: true,
    status: 'published',
    order: 1,
  },
  {
    question: 'Are there open Research Assistant (RA) positions in the lab?',
    answer:
      'We regularly recruit enthusiastic MSc and PhD students interested in Artificial Intelligence, Computer Vision, and Cybersecurity. Interested candidates should review our recent publications and email their CV along with a concise 1-page research proposal.',
    category: 'research',
    isFeatured: true,
    status: 'published',
    order: 2,
  },
  {
    question: 'What are the consultation office hours for current course students?',
    answer:
      'Office hours are held every Monday and Wednesday from 2:00 PM to 4:00 PM in the Faculty Department Office. Online consultations can also be scheduled via the appointment link on the contact page.',
    category: 'contact',
    isFeatured: false,
    status: 'published',
    order: 3,
  },
];

export default function FaqManager({ initialFaqs }: { initialFaqs: FaqData[] }) {
  const [faqs, setFaqs] = useState<FaqData[]>(initialFaqs);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Editor modal/drawer state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqData>(EMPTY_FAQ);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Loading states
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [seedingStarters, setSeedingStarters] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Derived filtered list
  const filtered = useMemo(() => {
    return faqs.filter((f) => {
      const matchCat = activeCategory === 'all' || f.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        f.question?.toLowerCase().includes(q) ||
        f.answer?.toLowerCase().includes(q) ||
        f.category?.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [faqs, activeCategory, searchQuery]);

  // Counts helper
  const countFor = (cat: string) =>
    cat === 'all' ? faqs.length : faqs.filter((f) => f.category === cat).length;

  // Stats computation
  const featuredCount = useMemo(() => faqs.filter((f) => Boolean(f.isFeatured)).length, [faqs]);
  const pdfCount = useMemo(() => faqs.filter((f) => Boolean(f.pdfFile?.url)).length, [faqs]);
  const publishedCount = useMemo(
    () => faqs.filter((f) => f.status === 'published' || !f.status).length,
    [faqs]
  );

  /* ─── Modal Open / Close ─── */
  function openCreate() {
    setEditingFaq({
      ...EMPTY_FAQ,
      category: activeCategory !== 'all' ? activeCategory : 'general',
      order: faqs.length + 1,
    });
    setEditingId(null);
    setStatusMsg(null);
    setEditorOpen(true);
  }

  function openEdit(faq: FaqData) {
    setEditingFaq({ ...faq });
    setEditingId(faq._id ? String(faq._id) : null);
    setStatusMsg(null);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditingFaq(EMPTY_FAQ);
    setEditingId(null);
    setStatusMsg(null);
  }

  /* ─── PDF Upload ─── */
  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setStatusMsg({ type: 'error', text: 'Only PDF documents are supported.' });
      return;
    }

    setUploadingPdf(true);
    setStatusMsg(null);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await uploadFaqPdfAdmin(fd);
      if (res.success && res.url) {
        setEditingFaq((prev: FaqData) => ({
          ...prev,
          pdfFile: { url: res.url, publicId: res.publicId, fileName: res.fileName || file.name },
        }));
        setStatusMsg({ type: 'success', text: 'PDF attachment uploaded successfully!' });
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to upload PDF.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'PDF upload error.' });
    } finally {
      setUploadingPdf(false);
    }
  }

  /* ─── Save Action ─── */
  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (!editingFaq.question?.trim() || !editingFaq.answer?.trim()) {
      setStatusMsg({ type: 'error', text: 'Question and Answer are required.' });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await saveFaqAdmin(editingFaq, editingId || undefined);
      if (res.success) {
        if (editingId) {
          setFaqs((prev) =>
            prev.map((f) => (String(f._id) === editingId ? { ...f, ...editingFaq } : f))
          );
        } else {
          setFaqs((prev) => [{ ...editingFaq, _id: Date.now().toString() }, ...prev]);
        }
        setStatusMsg({ type: 'success', text: 'FAQ saved successfully!' });
        setTimeout(closeEditor, 600);
      } else {
        setStatusMsg({ type: 'error', text: 'Save failed. Please retry.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Server error while saving FAQ.' });
    } finally {
      setSaving(false);
    }
  }

  /* ─── Delete Action ─── */
  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to permanently delete this FAQ?')) return;
    setDeletingId(id);
    try {
      await deleteFaqAdmin(id);
      setFaqs((prev) => prev.filter((f) => String(f._id) !== id));
    } catch {
      alert('Failed to delete FAQ entry.');
    } finally {
      setDeletingId(null);
    }
  }

  /* ─── Quick Toggle Featured ─── */
  async function handleToggleFeatured(faq: FaqData) {
    const id = faq._id ? String(faq._id) : null;
    if (!id) return;

    const newFeatured = !faq.isFeatured;
    setFaqs((prev) =>
      prev.map((f) => (String(f._id) === id ? { ...f, isFeatured: newFeatured } : f))
    );

    try {
      await saveFaqAdmin({ ...faq, isFeatured: newFeatured }, id);
    } catch {
      // rollback
      setFaqs((prev) =>
        prev.map((f) => (String(f._id) === id ? { ...f, isFeatured: !newFeatured } : f))
      );
    }
  }

  /* ─── Quick Toggle Status (Published / Draft) ─── */
  async function handleToggleStatus(faq: FaqData) {
    const id = faq._id ? String(faq._id) : null;
    if (!id) return;

    const newStatus = faq.status === 'draft' ? 'published' : 'draft';
    setFaqs((prev) =>
      prev.map((f) => (String(f._id) === id ? { ...f, status: newStatus } : f))
    );

    try {
      await saveFaqAdmin({ ...faq, status: newStatus }, id);
    } catch {
      // rollback
      setFaqs((prev) =>
        prev.map((f) => (String(f._id) === id ? { ...f, status: faq.status } : f))
      );
    }
  }

  /* ─── Load Sample Academic FAQs ─── */
  async function handleLoadSampleFaqs() {
    if (!window.confirm('Add 3 standard academic Q&A samples to your FAQ list?')) return;
    setSeedingStarters(true);
    try {
      for (const starter of STARTER_FAQS) {
        await saveFaqAdmin(starter);
      }
      setFaqs((prev) => [...STARTER_FAQS.map((s, i) => ({ ...s, _id: `sample-${i}` })), ...prev]);
    } catch {
      alert('Could not add samples. Check database connection.');
    } finally {
      setSeedingStarters(false);
    }
  }

  /* ─── Expand / Collapse ─── */
  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* ═══════════════════════════════════════════════
          HEADER: TITLE, SUBTITLE & ADD BUTTON
      ═══════════════════════════════════════════════ */}
      <div className="flex flex-row sm:items-center justify-between gap-2.5 pb-2.5 sm:pb-3 border-b border-[#1F1F24]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base hidden sm:block sm:text-lg font-bold text-white tracking-tight">
              FAQ &amp; Student Guidance
            </h1>
            <h1 className="text-base sm:hidden block sm:text-lg font-bold text-white tracking-tight">
              FAQ &amp;
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1A1A20] text-neutral-400 border border-[#282830]">
              {faqs.length}
            </span>
          </div>
          {/* <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
            Manage inquiries regarding thesis supervision, recommendation letters, courses and lab admission
          </p> */}
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 shrink-0 hover:brightness-110 min-h-[36px]"
          style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
        >
          <Plus size={14} strokeWidth={3} />
          <span>Add Question</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════
          MINI METRICS STRIP (Mobile friendly)
      ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Total Questions</span>
          <span className="text-sm sm:text-base font-black text-white font-mono">{faqs.length}</span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Featured</span>
          <span className="text-sm sm:text-base font-black text-[var(--theme-color,#FFA800)] font-mono">
            {featuredCount}
          </span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">Published</span>
          <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
            {publishedCount}
          </span>
        </div>
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#141418] border border-[#222226]">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 block font-semibold">PDF Guides</span>
          <span className="text-sm sm:text-base font-black text-cyan-400 font-mono">{pdfCount}</span>
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
            placeholder="Search questions or answers..."
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
            <option value="all" className="bg-[#141418] text-white">
              All Questions ({countFor('all')})
            </option>
            {FAQ_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-[#141418] text-white">
                {cat.label} ({countFor(cat.value)})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
            <ChevronDown size={13} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          FAQ LIST (Accordion Cards)
      ═══════════════════════════════════════════════ */}
      {filtered.length === 0 ? (
        <div className="rounded-xl sm:rounded-2xl border border-[#222226] bg-[#141418] p-8 sm:p-12 text-center space-y-3">
          <MessageCircleQuestion size={32} className="mx-auto text-neutral-600" />
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            No matching questions found
          </h3>
          <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search keywords or reset category filters.'
              : 'You have not added any FAQs in this category yet.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-[var(--theme-color,#FFA800)] hover:brightness-110 transition cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Question</span>
            </button>
            {faqs.length === 0 && (
              <button
                onClick={handleLoadSampleFaqs}
                disabled={seedingStarters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-300 bg-[#1E1E24] hover:bg-[#25252E] border border-[#2B2B33] transition cursor-pointer disabled:opacity-50"
              >
                {seedingStarters ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} className="text-[var(--theme-color,#FFA800)]" />
                )}
                <span>Load Starter Q&amp;As</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-2.5">
          {filtered.map((faq, idx) => {
            const faqId = faq._id ? String(faq._id) : `faq-${idx}`;
            const catMeta = getCategoryMeta(faq.category);
            const CatIcon = catMeta.icon;
            const isExpanded = expanded.has(faqId);
            const isDeleting = deletingId === faqId;

            return (
              <div
                key={faqId}
                className="rounded-xl sm:rounded-2xl border border-[#222226] bg-[#141418] overflow-hidden transition-all hover:border-[#282830]"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(faqId)}
                  className="p-3 sm:p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-[#16161B] transition select-none"
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <span
                      className="mt-1 w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: catMeta.color }}
                    />

                    <div className="space-y-1 min-w-0 flex-1">
                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border"
                          style={{
                            color: catMeta.color,
                            borderColor: `${catMeta.color}40`,
                            backgroundColor: `${catMeta.color}15`,
                          }}
                        >
                          <CatIcon size={9} className="inline mr-1" />
                          {catMeta.label}
                        </span>

                        {faq.isFeatured && (
                          <span className="text-[9px] font-bold text-[var(--theme-color,#FFA800)] bg-[var(--theme-color,#FFA800)]/10 border border-[var(--theme-color,#FFA800)]/30 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Star size={8} className="fill-current" />
                            Featured
                          </span>
                        )}

                        {faq.status === 'draft' && (
                          <span className="text-[9px] font-bold text-neutral-400 bg-[#1A1A20] px-1.5 py-0.2 rounded border border-[#282830]">
                            Draft
                          </span>
                        )}

                        {faq.pdfFile?.url && (
                          <span className="text-[9px] font-mono text-cyan-400 flex items-center gap-1">
                            <FileText size={9} />
                            PDF
                          </span>
                        )}
                      </div>

                      {/* Question */}
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                        {faq.question}
                      </h4>
                    </div>
                  </div>

                  {/* Expand Chevron Icon */}
                  <div className="p-1 rounded-lg bg-[#1A1A20] text-neutral-400 shrink-0 mt-0.5">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {/* Expanded Answer & Actions */}
                {isExpanded && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-[#1F1F24] space-y-3 bg-[#111115]">
                    <div className="pl-4 sm:pl-5 border-l-2 border-[var(--theme-color,#FFA800)]/40 space-y-2">
                      <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed whitespace-pre-wrap">
                        {faq.answer}
                      </p>

                      {/* Attached PDF document */}
                      {faq.pdfFile?.url && (
                        <div className="pt-1">
                          <a
                            href={faq.pdfFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#282830] bg-[#16161B] text-xs font-semibold text-neutral-300 hover:text-white hover:border-[var(--theme-color,#FFA800)] transition"
                          >
                            <FileText size={12} className="text-cyan-400 shrink-0" />
                            <span className="truncate max-w-[200px] sm:max-w-md">
                              {faq.pdfFile.fileName || 'Attached Reference PDF'}
                            </span>
                            <ExternalLink size={10} className="text-neutral-500 shrink-0" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1A1A20]">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(faq)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${faq.isFeatured
                            ? 'text-[var(--theme-color,#FFA800)] border-[var(--theme-color,#FFA800)]/40 bg-[var(--theme-color,#FFA800)]/10'
                            : 'text-neutral-400 border-[#282830] bg-[#16161B] hover:text-white'
                            }`}
                          title="Toggle featured spotlight"
                        >
                          <Star size={10} className={faq.isFeatured ? 'fill-current' : ''} />
                          <span>{faq.isFeatured ? 'Featured' : 'Mark Featured'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(faq)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${faq.status === 'published' || !faq.status
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : 'text-neutral-400 border-[#282830] bg-[#16161B] hover:text-white'
                            }`}
                          title="Toggle publication status"
                        >
                          {faq.status === 'published' || !faq.status ? (
                            <Eye size={10} />
                          ) : (
                            <EyeOff size={10} />
                          )}
                          <span>{faq.status === 'published' || !faq.status ? 'Published' : 'Draft'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(faq)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1E1E24] hover:bg-[#25252E] text-white text-xs font-semibold border border-[#2B2B33] transition cursor-pointer min-h-[28px]"
                        >
                          <Edit3 size={11} className="text-[var(--theme-color,#FFA800)]" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(faqId)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg bg-[#16161B] hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-[#282830] hover:border-rose-900/50 transition cursor-pointer disabled:opacity-50 min-h-[28px] flex items-center justify-center"
                          title="Delete FAQ"
                        >
                          {isDeleting ? (
                            <Loader2 size={11} className="animate-spin text-rose-400" />
                          ) : (
                            <Trash2 size={11} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          EDITOR MODAL (Mobile-First Sheet / Dialog)
      ═══════════════════════════════════════════════ */}
      {editorOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2.5 sm:p-4 animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity cursor-pointer"
            onClick={closeEditor}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-2xl bg-[#141418] border border-[#282830] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Top Header */}
            <div className="p-3.5 sm:p-4.5 border-b border-[#1F1F24] bg-[#16161B] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-black font-black shrink-0"
                  style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
                >
                  <MessageCircleQuestion size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    {editingId ? 'Edit Question & Answer' : 'New Question & Answer'}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400">
                    Category, question, detailed answer and reference PDF
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#202026] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5">
              {/* Status Banner */}
              {statusMsg && (
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${statusMsg.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                >
                  {statusMsg.type === 'success' ? (
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  ) : (
                    <X size={13} className="text-rose-400 shrink-0" />
                  )}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              {/* Category Picker */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-neutral-300">
                  Select Category <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {FAQ_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = editingFaq.category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setEditingFaq((p: FaqData) => ({ ...p, category: cat.value }))}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-left text-xs transition cursor-pointer ${isSelected
                          ? 'text-white font-bold shadow-sm'
                          : 'bg-[#1A1A20] text-neutral-400 hover:text-white border-[#282830]'
                          }`}
                        style={isSelected ? { backgroundColor: cat.color, borderColor: cat.color } : undefined}
                      >
                        <Icon size={12} className="shrink-0" />
                        <span className="truncate text-[11px]">{cat.label}</span>
                        {isSelected && <Check size={11} className="ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-neutral-300">
                  Question Text <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingFaq.question || ''}
                  onChange={(e) => setEditingFaq((p: FaqData) => ({ ...p, question: e.target.value }))}
                  placeholder="e.g. How do I request a thesis supervision meeting?"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[#1A1A20] border border-[#282830] text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                />
              </div>

              {/* Answer */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-neutral-300">
                  Detailed Answer <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={editingFaq.answer || ''}
                  onChange={(e) => setEditingFaq((p: FaqData) => ({ ...p, answer: e.target.value }))}
                  placeholder="Write a clear, helpful response explaining requirements, policies, office hours, or steps..."
                  className="w-full p-3 text-xs sm:text-sm rounded-lg bg-[#1A1A20] border border-[#282830] text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-color,#FFA800)] leading-relaxed resize-y"
                />
              </div>

              {/* PDF Document Attachment */}
              <div className="p-3 rounded-xl border border-[#282830] bg-[#16161B] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                    <FileText size={12} className="text-cyan-400" />
                    <span>Reference PDF Document (Optional)</span>
                  </label>
                  <span className="text-[10px] text-neutral-400">e.g. Policy guide, application form</span>
                </div>

                {editingFaq.pdfFile?.url ? (
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#1A1A20] border border-[#282830]">
                    <FileText size={14} className="text-cyan-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {editingFaq.pdfFile.fileName || 'Attached Document.pdf'}
                      </p>
                      <a
                        href={editingFaq.pdfFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[var(--theme-color,#FFA800)] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Preview PDF</span>
                        <ExternalLink size={9} />
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingFaq((p: FaqData) => ({
                          ...p,
                          pdfFile: { url: '', publicId: '', fileName: '' },
                        }))
                      }
                      className="p-1 text-neutral-400 hover:text-rose-400 transition cursor-pointer"
                      title="Remove PDF"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={uploadingPdf}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22222A] hover:bg-[#2A2A34] text-white text-xs font-semibold transition cursor-pointer min-h-[34px] shrink-0 disabled:opacity-50"
                    >
                      {uploadingPdf ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Upload size={12} />
                      )}
                      <span>{uploadingPdf ? 'Uploading...' : 'Upload PDF'}</span>
                    </button>
                    <input
                      type="text"
                      value={editingFaq.pdfFile?.url || ''}
                      onChange={(e) =>
                        setEditingFaq((p: FaqData) => ({
                          ...p,
                          pdfFile: {
                            url: e.target.value,
                            publicId: '',
                            fileName: 'External Document',
                          },
                        }))
                      }
                      placeholder="Or paste direct document link..."
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#141418] border border-[#282830] text-white min-h-[34px] focus:outline-none focus:border-[var(--theme-color,#FFA800)]"
                    />
                  </div>
                )}

                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handlePdfUpload}
                />
              </div>

              {/* Toggles & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* Featured */}
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[#282830] bg-[#16161B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingFaq.isFeatured}
                    onChange={(e) => setEditingFaq((p: FaqData) => ({ ...p, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[var(--theme-color,#FFA800)] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-white">Mark Featured</span>
                </label>

                {/* Status */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[#282830] bg-[#16161B]">
                  <label className="text-xs font-semibold text-neutral-300">Status:</label>
                  <select
                    value={editingFaq.status || 'published'}
                    onChange={(e) => setEditingFaq((p: FaqData) => ({ ...p, status: e.target.value }))}
                    className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                  >
                    <option value="published" className="bg-[#141418]">Published</option>
                    <option value="draft" className="bg-[#141418]">Draft</option>
                  </select>
                </div>

                {/* Order */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[#282830] bg-[#16161B]">
                  <label className="text-xs font-semibold text-neutral-300">Order:</label>
                  <input
                    type="number"
                    min={0}
                    value={editingFaq.order ?? 0}
                    onChange={(e) => setEditingFaq((p: FaqData) => ({ ...p, order: Number(e.target.value) }))}
                    className="w-16 px-2 py-0.5 rounded bg-[#101014] border border-[#282830] text-white text-xs font-mono text-center focus:outline-none"
                  />
                </div>
              </div>
            </form>

            {/* Modal Bottom Actions */}
            <div className="p-3 sm:p-4 border-t border-[#1F1F24] bg-[#16161B] flex items-center justify-between gap-2.5 shrink-0">
              <button
                type="button"
                onClick={closeEditor}
                className="px-4 py-2 rounded-xl border border-[#282830] text-xs font-semibold text-neutral-400 hover:text-white hover:bg-[#202026] transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-2 rounded-xl text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 hover:brightness-110 min-h-[38px]"
                style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
              >
                {saving ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-black" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    <span>{editingId ? 'Update FAQ' : 'Save FAQ'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
