import { getAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Publication } from '@/models/Publication';
import { AcademicItem } from '@/models/AcademicItem';
import { Faq } from '@/models/Faq';
import { BlogPost } from '@/models/BlogPost';
import { SpecialProject } from '@/models/SpecialProject';
import { getProfile, initialBlogPosts } from '@/lib/data';
import {
  initialPublicationsData,
  initialAcademicItemsData,
} from '@/lib/seedData';
import Link from 'next/link';
import {
  BookOpen,
  Layers,
  Quote,
  Plus,
  ExternalLink,
  MessageCircleQuestion,
  User,
  ArrowRight,
  Sparkles,
  Newspaper,
} from 'lucide-react';
import AdminDashboardCenter from '@/components/admin/AdminDashboardCenter';

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  const profile = await getProfile();

  let pubCount = 0;
  let totalCitations = 0;
  let totalItemsCount = 0;
  let faqCount = 0;
  let blogCount = 0;
  let specialProjectsCount = 0;
  let grantCount = 0;
  let memberCount = 0;
  let talkCount = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentPublications: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentGrants: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentMembers: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentTalks: any[] = [];

  try {
    await connectDB();

    pubCount = await Publication.countDocuments();
    totalItemsCount = await AcademicItem.countDocuments();
    faqCount = await Faq.countDocuments();
    blogCount = await BlogPost.countDocuments();
    specialProjectsCount = await SpecialProject.countDocuments();
    grantCount = await AcademicItem.countDocuments({ category: 'project' });
    memberCount = await AcademicItem.countDocuments({ category: 'lab_member' });
    talkCount = await AcademicItem.countDocuments({ category: 'talk' });

    const citationAgg = await Publication.aggregate([
      { $group: { _id: null, total: { $sum: '$citationCount' } } },
    ]);
    totalCitations = citationAgg[0]?.total || 0;

    const pubs = await Publication.find()
      .sort({ year: -1, createdAt: -1 })
      .limit(6)
      .lean();
    recentPublications = pubs ? JSON.parse(JSON.stringify(pubs)) : [];

    const grants = await AcademicItem.find({ category: 'project' })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
    recentGrants = grants ? JSON.parse(JSON.stringify(grants)) : [];

    const members = await AcademicItem.find({ category: 'lab_member' })
      .sort({ order: 1, createdAt: -1 })
      .limit(6)
      .lean();
    recentMembers = members ? JSON.parse(JSON.stringify(members)) : [];

    const talks = await AcademicItem.find({ category: 'talk' })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
    recentTalks = talks ? JSON.parse(JSON.stringify(talks)) : [];
  } catch (err) {
    console.warn('DB not reachable in Admin dashboard, using fallbacks:', err);
  }

  // Fallbacks if database is brand new
  if (!recentPublications || recentPublications.length === 0) {
    recentPublications = JSON.parse(JSON.stringify(initialPublicationsData.slice(0, 6)));
    pubCount = pubCount || initialPublicationsData.length;
    totalCitations =
      totalCitations ||
      initialPublicationsData.reduce((acc, p) => acc + (p.citationCount || 0), 0);
  }

  if (!recentGrants || recentGrants.length === 0) {
    const seedProjects = initialAcademicItemsData.filter((i) => i.category === 'project');
    recentGrants = JSON.parse(JSON.stringify(seedProjects.slice(0, 6)));
    grantCount = grantCount || seedProjects.length;
  }

  if (!recentMembers || recentMembers.length === 0) {
    const seedMembers = initialAcademicItemsData.filter((i) => i.category === 'lab_member');
    recentMembers = JSON.parse(JSON.stringify(seedMembers.slice(0, 6)));
    memberCount = memberCount || seedMembers.length;
  }

  if (!recentTalks || recentTalks.length === 0) {
    const seedTalks = initialAcademicItemsData.filter((i) => i.category === 'talk');
    recentTalks = JSON.parse(JSON.stringify(seedTalks.slice(0, 6)));
    talkCount = talkCount || seedTalks.length;
  }

  if (!totalItemsCount) {
    totalItemsCount = initialAcademicItemsData.length;
  }

  if (!blogCount) {
    blogCount = initialBlogPosts.length;
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-6">
      {/* ═══════════════════════════════════════════════
          EXECUTIVE WELCOME BANNER
      ═══════════════════════════════════════════════ */}
      <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl font-bold text-white tracking-tight">
              Faculty Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-xs text-neutral-400 truncate">
            {profile.fullName || 'Prof. Sadiq Iqbal'} &bull; {profile.designation || 'Professor & Chairman'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-[#1A1A20] hover:bg-[#222228] border border-[#2B2B33] text-xs font-semibold text-neutral-300 hover:text-white transition cursor-pointer min-h-[34px] sm:min-h-[38px]"
          >
            <span>View Site</span>
            <ExternalLink size={12} />
          </Link>

          <Link
            href="/admin/publications/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:brightness-110 active:scale-95 min-h-[34px] sm:min-h-[38px]"
            style={{ backgroundColor: 'var(--theme-color, #FFA800)' }}
          >
            <Plus size={14} strokeWidth={3} />
            <span>New Paper</span>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          CORE METRIC CARDS (4 Columns)
      ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Metric 1: Publications */}
        <Link
          href="/admin/publications"
          className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] hover:border-[var(--theme-color,#FFA800)]/40 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Publications
            </span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#1A1A20] text-[var(--theme-color,#FFA800)] flex items-center justify-center shrink-0">
              <BookOpen size={14} />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {pubCount}
            </span>
            <span className="text-[10px] text-neutral-500 group-hover:text-white transition flex items-center gap-0.5">
              <span>Manage</span>
              <ArrowRight size={10} />
            </span>
          </div>
        </Link>

        {/* Metric 2: Citations */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Total Citations
            </span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#1A1A20] text-amber-400 flex items-center justify-center shrink-0">
              <Quote size={14} />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {totalCitations}+
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Scholar
            </span>
          </div>
        </div>

        {/* Metric 3: Portfolio Items */}
        <Link
          href="/admin/items"
          className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] hover:border-[var(--theme-color,#FFA800)]/40 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Portfolio Items
            </span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#1A1A20] text-emerald-400 flex items-center justify-center shrink-0">
              <Layers size={14} />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {totalItemsCount}
            </span>
            <span className="text-[10px] text-neutral-500 group-hover:text-white transition flex items-center gap-0.5">
              <span>Manage</span>
              <ArrowRight size={10} />
            </span>
          </div>
        </Link>

        {/* Metric 4: FAQs */}
        <Link
          href="/admin/faq"
          className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] hover:border-[var(--theme-color,#FFA800)]/40 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Student Q&amp;A
            </span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#1A1A20] text-cyan-400 flex items-center justify-center shrink-0">
              <MessageCircleQuestion size={14} />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {faqCount}
            </span>
            <span className="text-[10px] text-neutral-500 group-hover:text-white transition flex items-center gap-0.5">
              <span>Manage</span>
              <ArrowRight size={10} />
            </span>
          </div>
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════
          QUICK ACTIONS HUB
      ═══════════════════════════════════════════════ */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#141418] border border-[#222226] space-y-2.5">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
          Quick Management Actions
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          <Link
            href="/admin/special-projects"
            className="p-2.5 sm:p-3 rounded-xl bg-[#16161B] hover:bg-[#1E1E24] border border-[#26262E] hover:border-[#383844] transition flex items-center gap-2 text-xs font-semibold text-white group"
          >
            <span className="w-7 h-7 rounded-lg bg-[#22222A] text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Sparkles size={14} />
            </span>
            <span className="truncate">Special Projects</span>
          </Link>

          <Link
            href="/admin/profile"
            className="p-2.5 sm:p-3 rounded-xl bg-[#16161B] hover:bg-[#1E1E24] border border-[#26262E] hover:border-[#383844] transition flex items-center gap-2 text-xs font-semibold text-white group"
          >
            <span className="w-7 h-7 rounded-lg bg-[#22222A] text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <User size={14} />
            </span>
            <span className="truncate">Edit Profile</span>
          </Link>

          <Link
            href="/admin/publications/new"
            className="p-2.5 sm:p-3 rounded-xl bg-[#16161B] hover:bg-[#1E1E24] border border-[#26262E] hover:border-[#383844] transition flex items-center gap-2 text-xs font-semibold text-white group"
          >
            <span className="w-7 h-7 rounded-lg bg-[#22222A] text-[var(--theme-color,#FFA800)] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <BookOpen size={14} />
            </span>
            <span className="truncate">+ Add Paper</span>
          </Link>

          <Link
            href="/admin/items/new"
            className="p-2.5 sm:p-3 rounded-xl bg-[#16161B] hover:bg-[#1E1E24] border border-[#26262E] hover:border-[#383844] transition flex items-center gap-2 text-xs font-semibold text-white group"
          >
            <span className="w-7 h-7 rounded-lg bg-[#22222A] text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Layers size={14} />
            </span>
            <span className="truncate">+ Add Item</span>
          </Link>

          <Link
            href="/admin/blog/new"
            className="p-2.5 sm:p-3 rounded-xl bg-[#16161B] hover:bg-[#1E1E24] border border-[#26262E] hover:border-[#383844] transition flex items-center gap-2 text-xs font-semibold text-white group"
          >
            <span className="w-7 h-7 rounded-lg bg-[#22222A] text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Newspaper size={14} />
            </span>
            <span className="truncate">+ Add Article</span>
          </Link>

          <Link
            href="/admin/faq"
            className="p-2.5 sm:p-3 rounded-xl bg-[#16161B] hover:bg-[#1E1E24] border border-[#26262E] hover:border-[#383844] transition flex items-center gap-2 text-xs font-semibold text-white group"
          >
            <span className="w-7 h-7 rounded-lg bg-[#22222A] text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <MessageCircleQuestion size={14} />
            </span>
            <span className="truncate">Student FAQs</span>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          INTERACTIVE RECENT RECORDS
      ═══════════════════════════════════════════════ */}
      <AdminDashboardCenter
        publications={recentPublications}
        grants={recentGrants}
        teamMembers={recentMembers}
        talks={recentTalks}
        pubCount={pubCount}
        grantCount={grantCount}
        memberCount={memberCount}
        talkCount={talkCount}
      />
    </div>
  );
}
