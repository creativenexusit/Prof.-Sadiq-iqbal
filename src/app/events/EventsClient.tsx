'use client';

import { useState, useMemo } from 'react';
import { IAcademicEvent } from '@/lib/data';
import { IAcademicItem } from '@/models/AcademicItem';
import { usePortfolio } from '@/components/home/PortfolioShell';
import OptimizedImage from '@/components/OptimizedImage';
import {
  Calendar,
  MapPin,
  Mic,
  Globe,
  Cpu,
  BookOpen,
  Layers,
  ArrowRight,
  ExternalLink,
  Search,
  Sparkles,
  Presentation,
  GraduationCap,
  Users,
} from 'lucide-react';

interface UnifiedEvent {
  id: string;
  title: string;
  type: string; // Exact Category name matching Admin (e.g. 'Keynote', 'Conference', 'Workshop', 'Seminar', 'Invited Talk', 'Guest Lecture')
  date: string;
  day: string;
  month: string;
  year: string;
  venue: string;
  organizer?: string;
  description: string;
  image: string;
  slidesUrl?: string;
  videoUrl?: string;
  externalLink?: string;
  isFeatured?: boolean;
}

interface EventsClientProps {
  talks?: IAcademicItem[];
  fallbackEvents?: IAcademicEvent[];
}

function parseDateComponents(dateStr?: string, fallbackIdx = 0): { day: string; month: string; year: string } {
  if (!dateStr) {
    return { day: '15', month: 'OCT', year: '2025' };
  }
  const match = dateStr.match(/([a-zA-Z]+)\s+(\d{1,2}),?\s*(\d{4})?/);
  if (match) {
    const month = match[1].slice(0, 3).toUpperCase();
    const day = match[2].padStart(2, '0');
    const year = match[3] || '2025';
    return { day, month, year };
  }
  if (/^\d{4}$/.test(dateStr.trim())) {
    return { day: '01', month: 'JAN', year: dateStr.trim() };
  }
  return { day: String(10 + (fallbackIdx % 20)), month: 'OCT', year: '2025' };
}

/** Returns the exact category name as configured in Admin */
function getEventCategory(title: string, rawType?: string): string {
  const t = (rawType || '').trim();
  if (!t) return 'Keynote';
  if (/^invited\s*(speaker|talk)$/i.test(t)) return 'Invited Talk';
  if (/^guest\s*lecture$/i.test(t)) return 'Guest Lecture';
  if (/^conference\s*presentation$/i.test(t)) return 'Conference Presentation';
  if (/^conference$/i.test(t)) return 'Conference';
  if (/^workshop$/i.test(t)) return 'Workshop';
  if (/^seminar$/i.test(t)) return 'Seminar';
  if (/^keynote$/i.test(t)) return 'Keynote';
  if (/^panel\s*discussion$/i.test(t)) return 'Panel Discussion';
  return t;
}

export default function EventsClient({ talks = [], fallbackEvents = [] }: EventsClientProps) {
  const { themeColor, openDrawer } = usePortfolio();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize talks and fallbackEvents into a rich list with exact Admin category names
  const allEvents = useMemo<UnifiedEvent[]>(() => {
    const list: UnifiedEvent[] = [];

    // 1. Process talks from AcademicItem (database/seedData)
    talks.forEach((talk, idx) => {
      const meta = talk.metaDetails || {};
      const { day, month, year } = parseDateComponents(talk.dateOrPeriod, idx);
      const exactCategory = getEventCategory(talk.title, meta.talkType);

      list.push({
        id: String(talk._id || talk.slug || `talk-${idx}`),
        title: talk.title,
        type: exactCategory,
        date: talk.dateOrPeriod || `${month} ${day}, ${year}`,
        day,
        month,
        year,
        venue: meta.eventVenue || 'Dhaka, Bangladesh',
        organizer: 'Academic Consortium & Department of CSE',
        description:
          talk.description ||
          'Scholarly discourse presenting computational frameworks, algorithmic benchmarks, and machine learning architectures.',
        image: talk.image?.url || `/contact-sheet/img${idx % 7}.jpg`,
        slidesUrl: meta.slidesUrl,
        videoUrl: meta.videoUrl,
        externalLink: talk.externalLink,
        isFeatured: talk.isFeatured || idx === 0,
      });
    });

    // 2. If no talks, fallback to academic events
    if (list.length === 0) {
      fallbackEvents.forEach((evt, idx) => {
        const exactCategory = getEventCategory(evt.title, evt.type);
        list.push({
          id: evt.id || `evt-${idx}`,
          title: evt.title,
          type: exactCategory,
          date: evt.date,
          day: evt.day,
          month: evt.month,
          year: evt.year,
          venue: evt.venue,
          organizer: evt.organizer || 'Department of Computer Science & Engineering',
          description: evt.description,
          image: `/contact-sheet/img${idx % 7}.jpg`,
          isFeatured: idx === 0,
        });
      });
    }

    return list;
  }, [talks, fallbackEvents]);

  // Distinct category list dynamically generated from events data
  const distinctCategories = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((e) => {
      if (e.type) set.add(e.type);
    });

    // Clean preferred ordering matching Admin dropdown options
    const preferredOrder = [
      'Keynote',
      'Conference',
      'Workshop',
      'Seminar',
      'Invited Talk',
      'Guest Lecture',
      'Conference Presentation',
      'Panel Discussion',
    ];

    const ordered: string[] = [];
    preferredOrder.forEach((cat) => {
      if (set.has(cat)) {
        ordered.push(cat);
        set.delete(cat);
      }
    });

    // Append any extra custom categories
    set.forEach((cat) => ordered.push(cat));
    return ordered;
  }, [allEvents]);

  // Icon mapping for exact category names
  const categoryIconMap: Record<string, any> = {
    Keynote: Mic,
    Conference: Globe,
    Workshop: Cpu,
    Seminar: BookOpen,
    'Invited Talk': Presentation,
    'Guest Lecture': GraduationCap,
    'Conference Presentation': Globe,
    'Panel Discussion': Users,
  };

  // Generate tabs with the EXACT same category names from Admin
  const tabs = useMemo(() => {
    const tabList = [
      {
        id: 'all',
        shortName: 'All',
        fullName: 'All Events',
        icon: Layers,
        count: allEvents.length,
      },
    ];

    distinctCategories.forEach((cat) => {
      const count = allEvents.filter((e) => e.type.toLowerCase() === cat.toLowerCase()).length;
      tabList.push({
        id: cat,
        shortName: cat.length > 12 ? cat.split(' ')[0] : cat,
        fullName: cat, // EXACT name matching Admin
        icon: categoryIconMap[cat] || Presentation,
        count,
      });
    });

    return tabList;
  }, [allEvents, distinctCategories]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt) => {
      const matchesTab =
        activeTab === 'all' || evt.type.toLowerCase() === activeTab.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        evt.title.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [allEvents, activeTab, searchQuery]);

  // Featured Keynote for Spotlight Banner
  const featuredKeynote = useMemo(() => {
    return (
      allEvents.find((e) => e.isFeatured && e.type === 'Keynote') ||
      allEvents.find((e) => e.type === 'Keynote') ||
      allEvents[0]
    );
  }, [allEvents]);

  const handleOpenDetail = (evt: UnifiedEvent) => {
    openDrawer({
      type: 'event',
      title: evt.title,
      category: evt.type,
      date: evt.date,
      venue: evt.venue,
      description: evt.description,
      image: evt.image,
      linkText: evt.slidesUrl ? 'VIEW EVENT SLIDES' : 'EXPLORE EVENT ARCHIVE',
      linkUrl: evt.slidesUrl || evt.videoUrl || evt.externalLink || '/events',
    });
  };

  return (
    <div className="animate-slide-right w-full space-y-8 sm:space-y-10 max-w-full overflow-hidden">
      {/* ═══════════════════════════════════════════════
          HEADER (Professional & Symmetrical)
      ═══════════════════════════════════════════════ */}
      <div className="text-center space-y-2 px-1">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
          ACADEMIC{' '}
          <span style={{ color: themeColor.hex }} className="transition-colors duration-300">
            EVENTS
          </span>
        </h1>
        <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#888888]">
          <span className="hidden sm:inline-block w-6 sm:w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
          <span className="text-center leading-normal">
            KEYNOTES, CONFERENCES, WORKSHOPS, SEMINARS &amp; ACADEMIC FORUMS
          </span>
          <span className="hidden sm:inline-block w-6 sm:w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
        </div>
      </div>



      {/* ═══════════════════════════════════════════════
          CENTERED FILTER TABS BAR (Exact Category Names matching Admin)
      ═══════════════════════════════════════════════ */}
      <div className="w-full flex justify-center">
        <div
          className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth max-w-full px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => {
            const isSelected = activeTab.toLowerCase() === tab.id.toLowerCase();
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${isSelected
                  ? 'text-black shadow-lg font-bold'
                  : 'bg-[#141418] border border-[#222228] text-neutral-400 hover:text-white hover:border-[#383842]'
                  }`}
                style={isSelected ? { backgroundColor: themeColor.hex } : undefined}
              >
                <Icon size={14} className="shrink-0" />
                <span className="sm:hidden text-[11px] font-bold">{tab.shortName}</span>
                <span className="hidden sm:inline">{tab.fullName}</span>

                {typeof tab.count === 'number' && (
                  <span
                    className={`hidden md:inline text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-black font-bold' : 'bg-[#1C1C24] text-neutral-400'
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
          EVENTS GRID (Exact Category Names on Badges)
      ═══════════════════════════════════════════════ */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => handleOpenDetail(evt)}
              className="rounded-2xl overflow-hidden bg-[#141418] border border-[#222228] hover:border-[#3A3A46] transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
            >
              {/* Event Cover Image / Header Block */}
              <div className="relative w-full h-44 bg-[#0E0E12] overflow-hidden">
                <OptimizedImage
                  src={evt.image}
                  alt={evt.title}
                  fill
                  quality={78}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-black/40 to-transparent" />

                {/* Event Type Badge (Exact Name matching Admin) */}
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-black shadow-lg"
                    style={{ backgroundColor: themeColor.hex }}
                  >
                    {evt.type}
                  </span>
                </div>

                {/* Calendar Date Badge on Image */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
                  <div
                    className="w-11 h-11 rounded-xl flex flex-col items-center justify-center text-black font-black leading-none shadow-md shrink-0"
                    style={{ backgroundColor: themeColor.hex }}
                  >
                    <span className="text-sm font-black">{evt.day}</span>
                    <span className="text-[9px] font-mono uppercase font-bold">{evt.month}</span>
                  </div>
                  <span className="text-xs font-mono text-white font-bold drop-shadow">
                    {evt.year}
                  </span>
                </div>
              </div>

              {/* Event Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-white leading-snug line-clamp-2">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                    {evt.description}
                  </p>
                </div>

                {/* Venue and Action Footer */}
                <div className="pt-3 border-t border-[#1E1E24] space-y-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-400 truncate">
                    <MapPin size={12} style={{ color: themeColor.hex }} className="shrink-0" />
                    <span className="truncate text-[11px] font-medium">{evt.venue}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className="font-bold text-[11px] uppercase tracking-wider group-hover:underline flex items-center gap-1"
                      style={{ color: themeColor.hex }}
                    >
                      <span>VIEW DETAILS</span>
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </span>

                    {evt.slidesUrl && (
                      <span className="text-[10px] font-mono text-neutral-400 bg-[#1A1A22] px-2 py-0.5 rounded border border-[#282834]">
                        SLIDES
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-3xl bg-[#121216] border border-[#222228] max-w-xl mx-auto space-y-3">
          <Calendar size={36} className="mx-auto text-neutral-600" />
          <h3 className="text-base font-bold text-white">No Academic Events Found</h3>
          <p className="text-xs text-neutral-400">
            There are currently no events matching this category. Try switching tabs.
          </p>
          <button
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
            }}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all cursor-pointer"
            style={{ backgroundColor: themeColor.hex, color: '#000' }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
