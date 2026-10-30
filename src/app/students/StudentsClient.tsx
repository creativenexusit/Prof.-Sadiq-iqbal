'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { usePortfolio } from '@/components/home/PortfolioShell';
import {
  Users,
  GraduationCap,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  FileDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { IAcademicItem } from '@/models/AcademicItem';
import { IFaq } from '@/models/Faq';

interface StudentsClientProps {
  labMembers: IAcademicItem[];
  supervisions: IAcademicItem[];
  faqs: IFaq[];
}

export default function StudentsClient({
  labMembers,
  supervisions,
  faqs,
}: StudentsClientProps) {
  const { themeColor } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'all' | 'members' | 'supervision' | 'faq'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const tabItems = [
    {
      id: 'all',
      shortName: 'All',
      fullName: 'All Overview',
      count: undefined,
      icon: Layers,
    },
    {
      id: 'members',
      shortName: 'Members',
      fullName: 'Lab Members',
      count: labMembers.length,
      icon: Users,
    },
    {
      id: 'supervision',
      shortName: 'Supervision',
      fullName: 'Supervised Theses',
      count: supervisions.length,
      icon: GraduationCap,
    },
    {
      id: 'faq',
      shortName: 'FAQ',
      fullName: 'Student Guidelines',
      count: faqs.length,
      icon: HelpCircle,
    },
  ];

  return (
    <div className="animate-slide-right w-full space-y-7 sm:space-y-9 max-w-full overflow-hidden">
      {/* ═══════════════════════════════════════════════
          HEADER (Clean & Professional)
      ═══════════════════════════════════════════════ */}
      <div className="text-center space-y-2 px-1">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">

          <span style={{ color: themeColor.hex }} className="transition-colors duration-300">
            RESEARCH TEAM
          </span>
        </h1>
        <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#888888]">
          <span className="hidden sm:inline-block w-6 sm:w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
          <span className="text-center leading-normal">
            SUPERVISION, LAB SCHOLARS &amp; PROSPECTIVE STUDENT GUIDELINES
          </span>
          <span className="hidden sm:inline-block w-6 sm:w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          MOBILE-OPTIMIZED ICON & SHORT NAME TABS BAR
          (Centered, no numbers on phone, full names and counts on desktop)
      ═══════════════════════════════════════════════ */}
      <div className="w-full flex justify-center">
        <div
          className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth max-w-full px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabItems.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                type="button"
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'text-black shadow-lg font-bold'
                    : 'bg-[#141418] border border-[#222228] text-neutral-400 hover:text-white hover:border-[#383842]'
                }`}
                style={isSelected ? { backgroundColor: themeColor.hex } : undefined}
              >
                <Icon size={14} className="shrink-0" />
                {/* Short name on mobile, full label on md+ desktop */}
                <span className="md:hidden text-[11px] font-bold">{tab.shortName}</span>
                <span className="hidden md:inline">{tab.fullName}</span>

                {/* Number/count strictly hidden on phone/mobile */}
                {typeof tab.count === 'number' && (
                  <span
                    className={`hidden md:inline text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-black/20 text-black font-bold' : 'bg-[#1C1C24] text-neutral-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          1. LAB MEMBERS & RESEARCH TEAM SECTION
      ═══════════════════════════════════════════════ */}
      {(activeTab === 'all' || activeTab === 'members') && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#222228] pb-2 px-0.5">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Users size={14} style={{ color: themeColor.hex }} />
              <span className="md:hidden">Members</span>
              <span className="hidden md:inline">Lab Members &amp; Research Scholars ({labMembers.length})</span>
            </h2>
          </div>

          {labMembers.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-[#141418] border border-[#202026] text-xs text-neutral-500">
              No lab members currently listed. Updates can be added through the Admin Panel.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
              {labMembers.map((member, idx) => {
                const role = member.metaDetails?.memberRole || 'Researcher';
                const affiliation = member.metaDetails?.currentAffiliation;
                const link = member.metaDetails?.socialProfileUrl;
                const memberImg = typeof member.image === 'string' ? member.image : member.image?.url;

                return (
                  <div
                    key={member.slug || (member._id ? String(member._id) : idx)}
                    className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222228] hover:border-[var(--theme-color)] transition-all duration-300 shadow-md flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        {memberImg ? (
                          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-[#1A1A22] border border-[#2C2C36] shrink-0">
                            <Image
                              src={memberImg}
                              alt={member.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-sm bg-[#1A1A22] border border-[#2C2C36] shrink-0"
                            style={{ color: themeColor.hex }}
                          >
                            {member.title.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <span
                          className="text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border"
                          style={{
                            color: themeColor.hex,
                            borderColor: `${themeColor.hex}40`,
                            backgroundColor: `${themeColor.hex}15`,
                          }}
                        >
                          {role}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-[15px] font-bold text-white group-hover:text-[var(--theme-color)] transition-colors leading-snug">
                          {member.title}
                        </h3>
                        {affiliation && (
                          <p className="text-xs text-neutral-400 mt-0.5 leading-snug">
                            {affiliation}
                          </p>
                        )}
                      </div>

                      {member.description && (
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {member.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2.5 border-t border-[#1C1C22] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {member.dateOrPeriod || 'Active'}
                      </span>

                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold group-hover:translate-x-0.5 transition-transform"
                          style={{ color: themeColor.hex }}
                        >
                          <span>Profile</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          2. SUPERVISION & THESIS SECTION
      ═══════════════════════════════════════════════ */}
      {(activeTab === 'all' || activeTab === 'supervision') && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#222228] pb-2 px-0.5">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <GraduationCap size={14} style={{ color: themeColor.hex }} />
              <span className="md:hidden">Supervision</span>
              <span className="hidden md:inline">Student Supervision &amp; Theses ({supervisions.length})</span>
            </h2>
          </div>

          {supervisions.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-[#141418] border border-[#202026] text-xs text-neutral-500">
              Supervision records can be managed directly in the Admin Panel (Items &gt; Supervision).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {supervisions.map((sup, idx) => {
                const degree = sup.metaDetails?.degreeType || 'Thesis';
                const studentName = sup.metaDetails?.studentName || sup.title;
                const thesisTopic = sup.metaDetails?.thesisTopic || sup.description;
                const year = sup.metaDetails?.completionYear || sup.dateOrPeriod;

                return (
                  <div
                    key={sup.slug || (sup._id ? String(sup._id) : idx)}
                    className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222228] hover:border-[var(--theme-color)] transition-all space-y-2.5 shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#1C1C24] border border-[#2C2C36]"
                        style={{ color: themeColor.hex }}
                      >
                        {degree}
                      </span>
                      {year && (
                        <span className="text-[11px] font-mono text-neutral-400">
                          {year}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {studentName}
                      </h3>
                      {thesisTopic && (
                        <p className="text-xs text-neutral-400 mt-1 italic leading-relaxed line-clamp-2">
                          &ldquo;{thesisTopic}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          3. STUDENT FAQ & POLICIES SECTION
      ═══════════════════════════════════════════════ */}
      {(activeTab === 'all' || activeTab === 'faq') && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#222228] pb-2 px-0.5">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <HelpCircle size={14} style={{ color: themeColor.hex }} />
              <span className="md:hidden">FAQ</span>
              <span className="hidden md:inline">Prospective Student Guidelines &amp; FAQs ({faqs.length})</span>
            </h2>
          </div>

          {faqs.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-[#141418] border border-[#202026] text-xs text-neutral-500">
              No FAQs published yet. Add guidelines and policies in the Admin Panel (Student FAQ).
            </div>
          ) : (
            <div className="space-y-2.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;

                return (
                  <div
                    key={faq._id ? String(faq._id) : idx}
                    className="rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222228] overflow-hidden transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-3.5 sm:p-5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-[#18181E] transition-colors"
                    >
                      <div className="space-y-1 pr-2">
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1C1C24]"
                          style={{ color: themeColor.hex }}
                        >
                          {faq.category}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-white leading-snug pt-0.5">
                          {faq.question}
                        </h3>
                      </div>

                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 border border-[#2F2F38] text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''
                          }`}
                      >
                        <ChevronDown size={13} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-neutral-300 border-t border-[#1C1C22] space-y-3 leading-relaxed">
                        <p className="whitespace-pre-line">{faq.answer}</p>

                        {faq.pdfFile?.url && (
                          <div className="pt-1.5">
                            <a
                              href={faq.pdfFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1C1C24] border border-[#2B2B36] text-white hover:border-[var(--theme-color)] transition-all"
                            >
                              <FileDown size={13} style={{ color: themeColor.hex }} />
                              <span>Download Policy PDF</span>
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
