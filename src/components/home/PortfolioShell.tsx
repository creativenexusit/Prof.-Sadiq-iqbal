'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar, { NavItem } from './Sidebar';
import {
  Home,
  User,
  Briefcase,
  Mail,
  X,
  Menu,
  Settings,
  Check,
  MessageCircle,
  Lock,
  FlaskConical,
  BookOpen,
  GraduationCap,
  Newspaper,
  Calendar,
} from 'lucide-react';
import { IProfile } from '@/models/Profile';
import SlideOverDrawer, { DrawerItem } from './SlideOverDrawer';

export interface ThemeColor {
  id: string;
  name: string;
  hex: string;
  hoverHex: string;
}

export const COLOR_PALETTES: ThemeColor[] = [
  { id: 'blue', name: 'Sky Blue', hex: '#0EA5E9', hoverHex: '#0284C7' },
  { id: 'cyan', name: 'Cyan Wave', hex: '#06B6D4', hoverHex: '#0891B2' },
  { id: 'green', name: 'Emerald Green', hex: '#10B981', hoverHex: '#059669' },
  { id: 'purple', name: 'Royal Violet', hex: '#8B5CF6', hoverHex: '#7C3AED' },
  { id: 'gold', name: 'Amber Gold', hex: '#FFA800', hoverHex: '#FFB82E' },
  { id: 'red', name: 'Crimson Red', hex: '#D31A26', hoverHex: '#E52532' },
  { id: 'pink', name: 'Hot Pink', hex: '#EC4899', hoverHex: '#DB2777' },
  { id: 'yellow', name: 'Vibrant Yellow', hex: '#FFB400', hoverHex: '#FFC02A' },
];

interface PortfolioContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  openDrawer: (item: DrawerItem) => void;
  closeDrawer: () => void;
}

const PortfolioContext = createContext<PortfolioContextType>({
  themeColor: COLOR_PALETTES[0],
  setThemeColor: () => {},
  openDrawer: () => {},
  closeDrawer: () => {},
});

export const usePortfolio = () => useContext(PortfolioContext);

interface PortfolioShellProps {
  children: React.ReactNode;
  profile?: IProfile | any;
}

export default function PortfolioShell({ children, profile }: PortfolioShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Active tab derived strictly from current route
  const activeTab =
    pathname.startsWith('/about')
      ? 'about'
      : pathname.startsWith('/research')
      ? 'research'
      : pathname.startsWith('/publications') || pathname.startsWith('/portfolio')
      ? 'publications'
      : pathname.startsWith('/students')
      ? 'students'
      : pathname.startsWith('/blog')
      ? 'blog'
      : pathname.startsWith('/contact')
      ? 'contact'
      : pathname.startsWith('/experience')
      ? 'experience'
      : pathname.startsWith('/events')
      ? 'events'
      : 'home';

  // Mobile bottom bar drawer state
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  // Settings / Color Customizer state
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const adminHex = profile?.themeConfig?.primaryColor || '#0EA5E9';
  const adminPalette = COLOR_PALETTES.find(
    (c) => c.hex.toLowerCase() === adminHex.toLowerCase()
  ) || { id: 'admin', name: 'Admin Theme', hex: adminHex, hoverHex: adminHex };
  const [themeColor, setThemeColorState] = useState<ThemeColor>(adminPalette);

  // Detail Slide-over Drawer state
  const [drawerItem, setDrawerItem] = useState<DrawerItem | null>(null);

  // Load saved theme color from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sadiq_portfolio_color');
    if (saved) {
      const match = COLOR_PALETTES.find((c) => c.hex.toLowerCase() === saved.toLowerCase());
      if (match) setThemeColorState(match);
      else setThemeColorState({ id: 'custom', name: 'Custom Accent', hex: saved, hoverHex: saved });
    } else if (profile?.themeConfig?.primaryColor) {
      const col = profile.themeConfig.primaryColor;
      const match = COLOR_PALETTES.find((c) => c.hex.toLowerCase() === col.toLowerCase());
      if (match) setThemeColorState(match);
      else setThemeColorState({ id: 'admin', name: 'Admin Theme', hex: col, hoverHex: col });
    }
  }, [profile?.themeConfig?.primaryColor]);

  const setThemeColor = (palette: ThemeColor) => {
    setThemeColorState(palette);
    localStorage.setItem('sadiq_portfolio_color', palette.hex);
  };

  const openDrawer = (item: DrawerItem) => setDrawerItem(item);
  const closeDrawer = () => setDrawerItem(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerItem]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerItem(null);
        setColorPickerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // All pages (used in desktop sidebar & mobile expanded 3-bar menu)
  const navItems: readonly NavItem[] = [
    { id: 'home', label: 'HOME', icon: Home, href: '/' },
    { id: 'about', label: 'ABOUT', icon: User, href: '/about' },
    { id: 'research', label: 'RESEARCH', icon: FlaskConical, href: '/research' },
    { id: 'publications', label: 'PUBLICATIONS', icon: BookOpen, href: '/publications' },
    { id: 'students', label: 'STUDENTS', icon: GraduationCap, href: '/students' },
    { id: 'experience', label: 'EXPERIENCE', icon: Briefcase, href: '/experience' },
    { id: 'events', label: 'EVENTS', icon: Calendar, href: '/events' },
    { id: 'blog', label: 'BLOG', icon: Newspaper, href: '/blog' },
    { id: 'contact', label: 'CONTACT', icon: MessageCircle, href: '/contact' },
  ];

  // Primary 4 items strictly for the mobile bottom bar
  const mobileBottomBarItems: readonly NavItem[] = [
    { id: 'home', label: 'HOME', icon: Home, href: '/' },
    { id: 'research', label: 'RESEARCH', icon: FlaskConical, href: '/research' },
    { id: 'publications', label: 'PUBLICATIONS', icon: BookOpen, href: '/publications' },
    { id: 'contact', label: 'CONTACT', icon: MessageCircle, href: '/contact' },
  ];

  const handleTabChange = (target: string) => {
    setIsMenuExpanded(false);
    const routeMap: Record<string, string> = {
      home: '/',
      about: '/about',
      research: '/research',
      publications: '/publications',
      portfolio: '/publications',
      students: '/students',
      blog: '/blog',
      contact: '/contact',
      experience: '/experience',
      events: '/events',
    };
    const href = target.startsWith('/') ? target : routeMap[target] || '/';
    if (pathname === href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <PortfolioContext.Provider value={{ themeColor, setThemeColor, openDrawer, closeDrawer }}>
      <div
        className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased overflow-x-hidden transition-colors duration-300"
        style={
          {
            '--theme-color': themeColor.hex,
            '--theme-color-hover': themeColor.hoverHex,
          } as React.CSSProperties
        }
      >
        {/* ═══════════════════════════════════════════════
            GSAP-ANIMATED FLOATING SIDEBAR (Top-Left)
        ═══════════════════════════════════════════════ */}
        <Sidebar
          navItems={navItems}
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          themeColor={themeColor}
        />

        {/* ═══════════════════════════════════════════════
            RIGHT FLOATING SETTINGS / GEAR BUTTON
        ═══════════════════════════════════════════════ */}
        <div className="fixed right-0 top-1/4 z-50">
          <button
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
            aria-label="Color Customizer"
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white text-black rounded-l-xl shadow-2xl flex items-center justify-center hover:bg-[var(--theme-color)] transition-colors cursor-pointer group active:scale-95"
            title="Customize Theme Accent Color"
          >
            <Settings
              size={18}
              className={`transition-transform duration-500 ${
                colorPickerOpen ? 'rotate-90 text-black' : 'group-hover:rotate-45'
              }`}
            />
          </button>

          {/* Compact Mini Color Switcher Dropdown */}
          {colorPickerOpen && (
            <div className="absolute right-0 top-11 w-44 bg-[#1A1A1A]/95 backdrop-blur-xl border border-[#333333] rounded-2xl shadow-2xl p-3 animate-drawer-right">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#282828]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#AAAAAA]">
                  Accent Theme
                </span>
                <button
                  onClick={() => setColorPickerOpen(false)}
                  className="text-[#777777] hover:text-white transition-colors"
                  aria-label="Close customizer"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Grid of 8 Compact Palette Circles */}
              <div className="grid grid-cols-4 gap-2 py-1">
                {COLOR_PALETTES.map((palette) => {
                  const isSelected = themeColor.hex.toLowerCase() === palette.hex.toLowerCase();
                  return (
                    <button
                      key={palette.id}
                      onClick={() => setThemeColor(palette)}
                      className="relative w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: palette.hex }}
                      title={palette.name}
                    >
                      {isSelected && (
                        <Check size={12} className="text-black drop-shadow font-bold" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Input & Active Hex */}
              <div className="mt-2.5 pt-2 border-t border-[#262626] flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={themeColor.hex}
                    onChange={(e) =>
                      setThemeColor({
                        id: 'custom',
                        name: 'Custom',
                        hex: e.target.value,
                        hoverHex: e.target.value,
                      })
                    }
                    className="w-5 h-5 rounded-md cursor-pointer border border-[#333333] bg-transparent p-0"
                    title="Choose custom color"
                  />
                  <span className="text-[#777777]">HEX</span>
                </div>
                <span style={{ color: themeColor.hex }} className="font-bold">
                  {themeColor.hex}
                </span>
              </div>

              {/* Login Portal Link */}
              <div className="mt-2.5 pt-2 border-t border-[#262626]">
                <Link
                  href="/login"
                  onClick={() => setColorPickerOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#242424] hover:bg-[var(--theme-color)] hover:text-black text-white transition-all text-[11px] font-bold uppercase tracking-wider cursor-pointer group shadow-sm active:scale-95 border border-[#333333] hover:border-transparent"
                >
                  <Lock size={12} className="text-[var(--theme-color)] group-hover:text-black transition-colors" />
                  <span>Login</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════
            MOBILE BOTTOM FLOATING QUICK-BAR (Phone Ergonomics)
            (Strictly 4 items: Home, Research, Publications, Contact + 3-Bar Menu)
        ═══════════════════════════════════════════════ */}
        {/* Backdrop for 3-bar expanded menu */}
        {isMenuExpanded && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setIsMenuExpanded(false)}
          />
        )}

        <div className="fixed bottom-3.5 left-1/2 -translate-x-1/2 z-50 lg:hidden w-[94%] max-w-sm">
          <div className="bg-[#141418]/95 backdrop-blur-xl border border-[#2A2A34] rounded-full px-2 py-1.5 flex items-center justify-between shadow-2xl gap-1">
            {mobileBottomBarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const targetHref = item.href || '/';
              return (
                <Link
                  key={item.id}
                  href={targetHref}
                  prefetch={true}
                  onClick={() => handleTabChange(targetHref)}
                  className={`flex-1 flex items-center justify-center py-2.5 px-2 rounded-full transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'text-black shadow-md font-bold'
                      : 'text-[#888888] hover:text-white'
                  }`}
                  style={isActive ? { backgroundColor: themeColor.hex } : {}}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon size={18} />
                </Link>
              );
            })}

            {/* 3-Bar / X Toggle */}
            <button
              onClick={() => setIsMenuExpanded((prev) => !prev)}
              className={`flex-none flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200 cursor-pointer active:scale-95 ${
                isMenuExpanded
                  ? 'bg-[#22222A] border-[var(--theme-color)] text-[var(--theme-color)] shadow-lg'
                  : 'bg-[#1C1C22] border-[#32323E] text-[#AAAAAA] hover:border-[var(--theme-color)] hover:text-[var(--theme-color)]'
              }`}
              aria-label={isMenuExpanded ? 'Close menu' : 'Open all pages'}
              title="All Pages"
            >
              {isMenuExpanded ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>

          {/* Mobile Nav Drawer: All Pages Popup */}
          {isMenuExpanded && (
            <div className="absolute bottom-full mb-3 right-0 flex items-start gap-2.5 animate-slide-up z-50">
              {/* LEFT: Plain text labels */}
              <div className="flex flex-col items-end pt-[50px]">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const targetHref = item.href || '/';
                  return (
                    <Link
                      key={item.id}
                      href={targetHref}
                      prefetch={true}
                      onClick={() => handleTabChange(targetHref)}
                      className={`h-8 mb-2 last:mb-0 flex items-center justify-end text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer pr-1 drop-shadow-md ${
                        isActive ? '' : 'text-white hover:opacity-70'
                      }`}
                      style={isActive ? { color: themeColor.hex } : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* RIGHT: Dark vertical pill with icons */}
              <div className="flex flex-col items-center bg-[#1A1A20] border border-[#32323E] rounded-full py-2.5 px-0 shadow-2xl w-11">
                <button
                  onClick={() => setIsMenuExpanded(false)}
                  className="mb-2 flex h-8 w-8 items-center justify-center rounded-full transition-colors cursor-pointer text-[#999999] hover:text-white active:scale-90"
                  aria-label="Close navigation"
                >
                  <X size={15} />
                </button>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const targetHref = item.href || '/';
                  return (
                    <Link
                      key={item.id}
                      href={targetHref}
                      prefetch={true}
                      onClick={() => handleTabChange(targetHref)}
                      title={item.label}
                      className={`mb-2 last:mb-0 flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer active:scale-95 ${
                        isActive
                          ? 'text-black shadow-md font-bold'
                          : 'text-[#999999] hover:text-white hover:scale-105'
                      }`}
                      style={isActive ? { backgroundColor: themeColor.hex } : undefined}
                    >
                      <Icon size={15} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════
            MAIN PAGE CONTENT (Offset for sidebar & mobile bar)
        ═══════════════════════════════════════════════ */}
        <main
          className="w-full min-h-screen px-4 sm:px-8 lg:pl-28 lg:pr-16 pt-16 lg:pt-20 pb-28 lg:pb-24 max-w-7xl mx-auto flex flex-col justify-start"
        >
          {children}
        </main>

        {/* ═══════════════════════════════════════════════
            DETAIL SLIDE-OVER DRAWER
        ═══════════════════════════════════════════════ */}
        <SlideOverDrawer
          drawerItem={drawerItem}
          onClose={closeDrawer}
          themeColor={themeColor}
        />
      </div>
    </PortfolioContext.Provider>
  );
}
