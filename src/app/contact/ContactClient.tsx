'use client';

import { useState } from 'react';
import { MapPin, Mail, Phone, ExternalLink, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { IProfile } from '@/models/Profile';
import { usePortfolio } from '@/components/home/PortfolioShell';
import { handleContactForm } from '@/app/actions/contact';

interface ContactClientProps {
  profile?: IProfile | any;
}

export default function ContactClient({ profile }: ContactClientProps) {
  const { themeColor } = usePortfolio();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
    errors?: Record<string, string>;
  } | null>(null);

  const officialEmail = profile?.contact?.email || 'sadiq.iqbal@bu.edu.bd';
  const officialPhone = profile?.contact?.phone || '01755559312';
  const officeLocation = profile?.contact?.officeLocation || 'Dept. of CSE, Bangladesh University, Dhaka';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await handleContactForm(null, formData);
      setFeedback(res);
      if (res.success) {
        form.reset();
      }
    } catch {
      setFeedback({
        success: false,
        message: 'Network error occurred. Please try again or email directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="animate-slide-right w-full space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
          GET IN{' '}
          <span style={{ color: themeColor.hex }} className="transition-colors duration-300">
            TOUCH
          </span>
        </h1>
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#888888] flex items-center justify-center gap-2">
          <span className="w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
          <span>ACADEMIC INQUIRIES, RESEARCH COLLABORATION &amp; MENTORSHIP</span>
          <span className="w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
        </p>
      </div>

      {/* Two-Column Contact Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wide text-white">
            CONTACT DETAILS
          </h2>
          <p className="text-xs sm:text-sm text-[#A5A5A5] leading-relaxed">
            For university academic matters, collaborative research projects, keynote addresses, or prospective thesis inquiries, feel free to reach out.
          </p>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center shrink-0 border border-[#333]"
                style={{ color: themeColor.hex }}
              >
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#888888]">OFFICE LOCATION</p>
                <p className="font-semibold text-white">{officeLocation}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center shrink-0 border border-[#333]"
                style={{ color: themeColor.hex }}
              >
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#888888]">OFFICIAL EMAIL</p>
                <a
                  href={`mailto:${officialEmail}`}
                  className="font-semibold hover:underline"
                  style={{ color: themeColor.hex }}
                >
                  {officialEmail}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center shrink-0 border border-[#333]"
                style={{ color: themeColor.hex }}
              >
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#888888]">PHONE / WHATSAPP</p>
                <a
                  href={`tel:${officialPhone}`}
                  className="font-semibold text-white hover:underline"
                >
                  {officialPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Academic Profile Links */}
          <div className="pt-4 border-t border-[#262626] space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#888888]">
              VERIFIED ACADEMIC PROFILES
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Google Scholar', url: profile?.socialLinks?.googleScholar || 'https://scholar.google.com/citations?user=fMPLMTwAAAAJ&hl=en' },
                { name: 'ResearchGate', url: profile?.socialLinks?.researchGate || 'https://www.researchgate.net/profile/Md-Iqbal' },
                { name: 'LinkedIn', url: profile?.socialLinks?.linkedin || 'https://www.linkedin.com/in/md-sadiq-iqbal-00867374/' },
              ].map(
                (item, i) =>
                  item.url && (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#1E1E1E] border border-[#333333] text-[#DDD6C6] hover:text-[var(--theme-color)] hover:border-[var(--theme-color)] transition-colors"
                    >
                      <span>{item.name}</span>
                      <ExternalLink size={11} />
                    </a>
                  )
              )}
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#181818] border border-[#2E2E2E] shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Feedback notification */}
            {feedback && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs ${
                  feedback.success
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/50 text-red-300'
                }`}
              >
                {feedback.success ? (
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="shrink-0 text-red-400 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#888888] block mb-1">
                  YOUR NAME <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl bg-[#222222] border border-[#333333] text-white text-xs sm:text-sm focus:border-[var(--theme-color)] focus:outline-none transition-colors"
                />
                {feedback?.errors?.name && (
                  <p className="text-[11px] text-red-400 mt-1">{feedback.errors.name}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#888888] block mb-1">
                  YOUR EMAIL <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl bg-[#222222] border border-[#333333] text-white text-xs sm:text-sm focus:border-[var(--theme-color)] focus:outline-none transition-colors"
                />
                {feedback?.errors?.email && (
                  <p className="text-[11px] text-red-400 mt-1">{feedback.errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#888888] block mb-1">
                SUBJECT <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="subject"
                required
                placeholder="Academic Inquiry / Research Collaboration"
                className="w-full px-4 py-3 rounded-xl bg-[#222222] border border-[#333333] text-white text-xs sm:text-sm focus:border-[var(--theme-color)] focus:outline-none transition-colors"
              />
              {feedback?.errors?.subject && (
                <p className="text-[11px] text-red-400 mt-1">{feedback.errors.subject}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#888888] block mb-1">
                MESSAGE <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                name="message"
                required
                placeholder="Write your message or collaboration inquiry..."
                className="w-full px-4 py-3 rounded-xl bg-[#222222] border border-[#333333] text-white text-xs sm:text-sm focus:border-[var(--theme-color)] focus:outline-none transition-colors resize-none"
              />
              {feedback?.errors?.message && (
                <p className="text-[11px] text-red-400 mt-1">{feedback.errors.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: themeColor.hex }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-black font-bold text-xs sm:text-sm uppercase tracking-wider shadow-xl transition-all cursor-pointer active:scale-95 hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>SENDING...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>SEND MESSAGE</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
