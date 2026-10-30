'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutAdmin } from '@/app/actions/adminAuth';
import {
  LayoutDashboard,
  UserCheck,
  BookOpen,
  Layers,
  ExternalLink,
  LogOut,
  Menu,
  X,
  MessageCircleQuestion,
  Newspaper,
  Sparkles,
} from 'lucide-react';

export interface SidebarThemeColor {
  hex: string;
  name?: string;
  hoverHex?: string;
}

interface AdminSidebarProps {
  adminEmail?: string;
  fullName?: string;
  themeColor?: SidebarThemeColor;
  onOpenColorPicker?: () => void;
}

export default function AdminSidebar({
  adminEmail = 'sadiq.iqbal@bu.edu.bd',
  fullName = 'Prof. Sadiq Iqbal',
  themeColor = { hex: '#FFA800', name: 'Amber Gold', hoverHex: '#FFB82E' },
}: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const activeColor = themeColor.hex || '#FFA800';

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      active: pathname === '/admin',
    },
    {
      label: 'Publications',
      href: '/admin/publications',
      icon: BookOpen,
      active: pathname.startsWith('/admin/publications'),
    },
    {
      label: 'Research & Items',
      href: '/admin/items',
      icon: Layers,
      active: pathname.startsWith('/admin/items'),
    },
    {
      label: 'Special Projects',
      href: '/admin/special-projects',
      icon: Sparkles,
      active: pathname.startsWith('/admin/special-projects'),
    },
    {
      label: 'Student FAQ',
      href: '/admin/faq',
      icon: MessageCircleQuestion,
      active: pathname.startsWith('/admin/faq'),
    },
    {
      label: 'Blog & Articles',
      href: '/admin/blog',
      icon: Newspaper,
      active: pathname.startsWith('/admin/blog'),
    },
    {
      label: 'Profile Config',
      href: '/admin/profile',
      icon: UserCheck,
      active: pathname.startsWith('/admin/profile'),
    },
  ];

  const SidebarContent = () => (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#101013] border-r border-[#1F1F24] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
    >
      {/* Brand Header: Clean & Minimal */}
      <div className="p-4 border-b border-[#1F1F24] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div
            className="relative w-9 h-9 rounded-xl p-1 shrink-0 flex items-center justify-center bg-[#17171C] border border-[#2B2B33]"
          >
            <Image
              src="/logo.webp"
              alt={fullName}
              fill
              sizes="36px"
              className="object-contain p-1"
              priority
            />
          </div>

          <div className="overflow-hidden">
            <h2 className="font-bold text-xs text-white truncate tracking-tight">
              {fullName}
            </h2>
            <span className="text-[10px] font-mono text-neutral-400 block">
              Admin Console
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block mb-2">
          Menu
        </span>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                  ? 'bg-[#1C1C22] text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-[#16161A]'
                }`}
            >
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                style={{
                  color: isActive ? activeColor : 'inherit',
                }}
              >
                <Icon size={16} />
              </span>
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full ml-auto"
                  style={{ backgroundColor: activeColor }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer: View Site & Logout */}
      <div className="p-3 border-t border-[#1F1F24] space-y-1.5 bg-[#0D0D10]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-[#16161A] transition-colors"
        >
          <span className="font-medium">Live Website</span>
          <ExternalLink size={13} style={{ color: activeColor }} />
        </Link>

        <div className="flex items-center justify-between pt-1 px-1">
          <div className="overflow-hidden text-left">
            <span className="text-[10px] text-neutral-500 font-mono block truncate max-w-[140px]">
              {adminEmail}
            </span>
          </div>

          <form action={logoutAdmin}>
            <button
              type="submit"
              className="p-1.5 rounded-lg border border-[#2A2A30] text-neutral-400 hover:text-red-400 hover:border-red-500/40 bg-[#16161A] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#101013] border-b border-[#1F1F24]">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-[#18181D]">
            <Image src="/logo.webp" alt={fullName} fill sizes="28px" className="object-contain p-1" priority />
          </div>
          <span className="font-bold text-xs text-white">
            Admin Console
          </span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg border border-[#282830] bg-[#18181D] text-white cursor-pointer"
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <SidebarContent />
    </>
  );
}
