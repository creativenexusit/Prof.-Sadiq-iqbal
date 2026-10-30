'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Award,
  Users,
  Mic,
  Search,
  ExternalLink,
  Edit3,
  X,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataItem = Record<string, any>;

interface AdminDashboardCenterProps {
  publications: DataItem[];
  grants: DataItem[];
  teamMembers: DataItem[];
  talks: DataItem[];
  pubCount: number;
  grantCount: number;
  memberCount: number;
  talkCount: number;
}

export default function AdminDashboardCenter({
  publications,
  grants,
  teamMembers,
  talks,
  pubCount,
  grantCount,
  memberCount,
  talkCount,
}: AdminDashboardCenterProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'publications' | 'grants' | 'team' | 'talks'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const query = searchQuery.toLowerCase().trim();

  const filteredPublications = useMemo(() => {
    return publications.filter(
      (p) =>
        !query ||
        p.title?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.journalOrPublisher?.toLowerCase().includes(query) ||
        String(p.year)?.includes(query)
    );
  }, [publications, query]);

  const filteredGrants = useMemo(() => {
    return grants.filter(
      (g) =>
        !query ||
        g.title?.toLowerCase().includes(query) ||
        g.metaDetails?.fundingAgency?.toLowerCase().includes(query) ||
        g.description?.toLowerCase().includes(query)
    );
  }, [grants, query]);

  const filteredTeam = useMemo(() => {
    return teamMembers.filter(
      (m) =>
        !query ||
        m.title?.toLowerCase().includes(query) ||
        m.metaDetails?.memberRole?.toLowerCase().includes(query)
    );
  }, [teamMembers, query]);

  const filteredTalks = useMemo(() => {
    return talks.filter(
      (t) =>
        !query ||
        t.title?.toLowerCase().includes(query) ||
        t.metaDetails?.eventVenue?.toLowerCase().includes(query)
    );
  }, [talks, query]);

  const tabs = [
    { id: 'all', label: 'All', count: pubCount + grantCount + memberCount + talkCount },
    { id: 'publications', label: 'Publications', count: pubCount },
    { id: 'grants', label: 'Projects', count: grantCount },
    { id: 'talks', label: 'Talks', count: talkCount },
    { id: 'team', label: 'Lab Team', count: memberCount },
  ];

  return (
    <div className="space-y-3">
      {/* Controls Container */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Recent Academic Activity
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter recent activity..."
              className="w-full bg-[#1A1A20] border border-[#2B2B33] focus:border-[var(--theme-color,#FFA800)] text-xs text-white placeholder-neutral-500 rounded-lg pl-8 pr-7 py-1.5 outline-none transition min-h-[34px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-0.5"
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-[#1F1F24] pt-2.5">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'text-black font-bold shadow-sm'
                    : 'bg-[#1A1A20] text-neutral-400 hover:text-white hover:bg-[#222228]'
                }`}
                style={isSelected ? { backgroundColor: 'var(--theme-color, #FFA800)' } : undefined}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-black/20 text-black font-mono font-bold' : 'bg-[#222228] text-neutral-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Records List Container */}
      <div className="rounded-xl sm:rounded-2xl border border-[#222226] bg-[#141418] overflow-hidden divide-y divide-[#1F1F24]">
        {/* Publications Row */}
        {(activeTab === 'all' || activeTab === 'publications') &&
          filteredPublications.slice(0, 4).map((pub, idx) => (
            <div
              key={pub._id ? String(pub._id) : `pub-${idx}`}
              className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-[#16161B] transition-colors group"
            >
              <div className="min-w-0 flex items-center gap-2.5 sm:gap-3 flex-1">
                <span className="w-8 h-8 rounded-lg bg-[#1C1C22] text-[var(--theme-color,#FFA800)] border border-[#26262E] flex items-center justify-center shrink-0">
                  <BookOpen size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/publications/${pub._id || pub.slug}`}
                    className="text-xs sm:text-sm font-semibold text-white group-hover:text-[var(--theme-color,#FFA800)] transition truncate block"
                  >
                    {pub.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 font-mono">
                    <span className="uppercase text-[9px] px-1 rounded bg-[#1A1A20] border border-[#282830]">
                      {pub.category || 'Paper'}
                    </span>
                    <span>&bull;</span>
                    <span>{pub.year}</span>
                    {pub.citationCount > 0 && (
                      <>
                        <span>&bull;</span>
                        <span className="text-[var(--theme-color,#FFA800)]">{pub.citationCount} citations</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href={`/admin/publications/${pub._id || pub.slug}`}
                  className="p-1.5 rounded-lg border border-[#2A2A32] text-neutral-400 hover:text-white bg-[#1A1A20] transition cursor-pointer min-h-[30px] flex items-center justify-center"
                  title="Edit Paper"
                >
                  <Edit3 size={12} />
                </Link>
                {pub.doi && (
                  <a
                    href={`https://doi.org/${pub.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg border border-[#2A2A32] text-neutral-400 hover:text-white bg-[#1A1A20] transition min-h-[30px] flex items-center justify-center"
                    title="View DOI Link"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}

        {/* Grants / Projects */}
        {(activeTab === 'all' || activeTab === 'grants') &&
          filteredGrants.slice(0, 3).map((grant, idx) => (
            <div
              key={grant._id ? String(grant._id) : `grant-${idx}`}
              className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-[#16161B] transition-colors group"
            >
              <div className="min-w-0 flex items-center gap-2.5 sm:gap-3 flex-1">
                <span className="w-8 h-8 rounded-lg bg-[#1C1C22] text-emerald-400 border border-[#26262E] flex items-center justify-center shrink-0">
                  <Award size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/items/${grant._id || grant.slug}`}
                    className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-400 transition truncate block"
                  >
                    {grant.title}
                  </Link>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 font-mono">
                    <span className="uppercase text-[9px] px-1 rounded bg-[#1A1A20] border border-[#282830]">Project</span>
                    <span>&bull;</span>
                    <span className="truncate">{grant.metaDetails?.fundingAgency || grant.dateOrPeriod || 'Research Project'}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/admin/items/${grant._id || grant.slug}`}
                className="p-1.5 rounded-lg border border-[#2A2A32] text-neutral-400 hover:text-white bg-[#1A1A20] transition shrink-0 min-h-[30px] flex items-center justify-center"
                title="Edit Item"
              >
                <Edit3 size={12} />
              </Link>
            </div>
          ))}

        {/* Team Members */}
        {(activeTab === 'all' || activeTab === 'team') &&
          filteredTeam.slice(0, 3).map((member, idx) => (
            <div
              key={member._id ? String(member._id) : `mem-${idx}`}
              className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-[#16161B] transition-colors group"
            >
              <div className="min-w-0 flex items-center gap-2.5 sm:gap-3 flex-1">
                <span className="w-8 h-8 rounded-lg bg-[#1C1C22] text-indigo-400 border border-[#26262E] flex items-center justify-center shrink-0">
                  <Users size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/items/${member._id || member.slug}`}
                    className="text-xs sm:text-sm font-semibold text-white group-hover:text-indigo-400 transition truncate block"
                  >
                    {member.title}
                  </Link>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 font-mono">
                    <span className="uppercase text-[9px] px-1 rounded bg-[#1A1A20] border border-[#282830]">Member</span>
                    <span>&bull;</span>
                    <span className="truncate">{member.metaDetails?.memberRole || 'Research Scholar'}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/admin/items/${member._id || member.slug}`}
                className="p-1.5 rounded-lg border border-[#2A2A32] text-neutral-400 hover:text-white bg-[#1A1A20] transition shrink-0 min-h-[30px] flex items-center justify-center"
                title="Edit Item"
              >
                <Edit3 size={12} />
              </Link>
            </div>
          ))}

        {/* Talks */}
        {(activeTab === 'all' || activeTab === 'talks') &&
          filteredTalks.slice(0, 3).map((talk, idx) => (
            <div
              key={talk._id ? String(talk._id) : `talk-${idx}`}
              className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-[#16161B] transition-colors group"
            >
              <div className="min-w-0 flex items-center gap-2.5 sm:gap-3 flex-1">
                <span className="w-8 h-8 rounded-lg bg-[#1C1C22] text-amber-400 border border-[#26262E] flex items-center justify-center shrink-0">
                  <Mic size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/items/${talk._id || talk.slug}`}
                    className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-400 transition truncate block"
                  >
                    {talk.title}
                  </Link>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 font-mono">
                    <span className="uppercase text-[9px] px-1 rounded bg-[#1A1A20] border border-[#282830]">Talk</span>
                    <span>&bull;</span>
                    <span className="truncate">{talk.metaDetails?.eventVenue || 'Invited Talk'}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/admin/items/${talk._id || talk.slug}`}
                className="p-1.5 rounded-lg border border-[#2A2A32] text-neutral-400 hover:text-white bg-[#1A1A20] transition shrink-0 min-h-[30px] flex items-center justify-center"
                title="Edit Item"
              >
                <Edit3 size={12} />
              </Link>
            </div>
          ))}
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 pt-1 text-xs text-neutral-400">
        <span className="font-mono text-[11px]">
          Showing recent active records
        </span>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/publications"
            className="hover:text-[var(--theme-color,#FFA800)] transition flex items-center gap-1 font-semibold"
          >
            <span>All Publications ({pubCount})</span>
            <ArrowRight size={11} />
          </Link>
          <span>&bull;</span>
          <Link
            href="/admin/items"
            className="hover:text-[var(--theme-color,#FFA800)] transition flex items-center gap-1 font-semibold"
          >
            <span>All Items</span>
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
