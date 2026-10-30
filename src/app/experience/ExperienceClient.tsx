'use client';

import { Calendar, BookOpen, GraduationCap } from 'lucide-react';
import { usePortfolio } from '@/components/home/PortfolioShell';
import { initialProfileData, initialAcademicItemsData } from '@/lib/seedData';
import { IAcademicItem } from '@/models/AcademicItem';

interface ExperienceClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile?: any;
  teachingItems?: IAcademicItem[];
}

export default function ExperienceClient({ profile, teachingItems = [] }: ExperienceClientProps) {
  const { themeColor } = usePortfolio();

  const rawExperience =
    profile?.experience && profile.experience.length > 0
      ? profile.experience
      : initialProfileData.experience;

  const rawEducation =
    profile?.education && profile.education.length > 0
      ? profile.education
      : initialProfileData.education;

  const rawTeaching =
    teachingItems && teachingItems.length > 0
      ? teachingItems
      : (initialAcademicItemsData.filter((i) => i.category === 'teaching') as unknown as IAcademicItem[]);

  const sortedTeaching = [...rawTeaching].sort((a: any, b: any) => {
    const orderA = typeof a.order === 'number' ? a.order : 0;
    const orderB = typeof b.order === 'number' ? b.order : 0;
    return orderA - orderB;
  });

  return (
    <div className="animate-slide-right w-full space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
          EXPERIENCE &amp;{' '}
          <span style={{ color: themeColor.hex }} className="transition-colors duration-300">
            EDUCATION
          </span>
        </h1>
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#888888] flex items-center justify-center gap-2">
          <span className="w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
          <span>OVER TWO DECADES OF UNIVERSITY TEACHING &amp; ACADEMIC LEADERSHIP</span>
          <span className="w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
        </p>
      </div>

      {/* Two Column Timeline Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left Column: EXPERIENCE */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
            EXPERIENCE
          </h2>

          <div className="relative pl-6 space-y-8 border-l border-[#333333]">
            {rawExperience.map((item: any, idx: number) => {
              const dateStr = item.startDate
                ? `${item.startDate} - ${item.isCurrent ? 'PRESENT' : item.endDate || 'PRESENT'}`
                : item.date || 'PRESENT';

              return (
                <div key={idx} className="relative">
                  {/* Node Marker in Active Theme Color */}
                  <div
                    className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-[#111111] transition-colors duration-300"
                    style={{ borderColor: themeColor.hex }}
                  />

                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#222222] border border-[#333333] mb-2 font-mono"
                    style={{ color: themeColor.hex }}
                  >
                    <Calendar size={11} />
                    <span className="uppercase">{dateStr}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold uppercase text-white tracking-wide">
                    {item.position || item.role}{' '}
                    <span style={{ color: themeColor.hex }}>— {item.institution || item.org}</span>
                  </h3>

                  <p className="text-xs sm:text-sm text-[#A5A5A5] leading-relaxed mt-1">
                    {item.description || item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: EDUCATION */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
            EDUCATION
          </h2>

          <div className="relative pl-6 space-y-8 border-l border-[#333333]">
            {rawEducation.map((item: any, idx: number) => {
              const yearStr = item.passingYear || item.date || 'GRADUATE';

              return (
                <div key={idx} className="relative">
                  {/* Node Marker in Active Theme Color */}
                  <div
                    className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-[#111111] transition-colors duration-300"
                    style={{ borderColor: themeColor.hex }}
                  />

                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#222222] border border-[#333333] mb-2 font-mono"
                    style={{ color: themeColor.hex }}
                  >
                    <Calendar size={11} />
                    <span className="uppercase">{yearStr}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold uppercase text-white tracking-wide">
                    {item.degree}{' '}
                    <span style={{ color: themeColor.hex }}>— {item.institution || item.school}</span>
                  </h3>

                  <p className="text-xs sm:text-sm text-[#A5A5A5] leading-relaxed mt-1">
                    {item.thesisTitle || item.field || item.description || item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          COURSES & TEACHING INSTRUCTION SECTION
          (Populated dynamically from /admin/items with category: 'teaching', sorted by order)
      ═══════════════════════════════════════════════ */}
      {sortedTeaching && sortedTeaching.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-[#222228]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#222228] pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                <BookOpen size={20} style={{ color: themeColor.hex }} />
                <span>COURSES &amp; ACADEMIC TEACHING</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Core undergraduate and graduate curriculum instructed by Prof. Sadiq Iqbal
              </p>
            </div>
            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded-full border self-start sm:self-auto"
              style={{
                borderColor: `${themeColor.hex}40`,
                backgroundColor: `${themeColor.hex}15`,
                color: themeColor.hex,
              }}
            >
              {sortedTeaching.length} ACTIVE COURSES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTeaching.map((course, idx) => {
              const meta = course.metaDetails || {};
              return (
                <div
                  key={idx}
                  className="rounded-2xl p-5 bg-[#141418] border border-[#222228] hover:border-[#383842] transition-all duration-300 flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[11px] font-mono font-black px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: `${themeColor.hex}20`,
                          borderColor: `${themeColor.hex}50`,
                          color: themeColor.hex,
                        }}
                      >
                        {meta.courseCode || 'CSE COURSE'}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                        <GraduationCap size={12} />
                        {meta.level || 'University'}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-white leading-snug">
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#1C1C24] flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="font-medium text-neutral-300">
                      {course.dateOrPeriod || meta.semester || 'Regular Curriculum'}
                    </span>
                    {meta.syllabusUrl && (
                      <a
                        href={meta.syllabusUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold underline hover:text-white"
                        style={{ color: themeColor.hex }}
                      >
                        Syllabus →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
