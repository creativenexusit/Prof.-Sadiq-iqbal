'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Settings,
  X,
  Check,
  Palette,
  Save,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { updateThemeColorAdmin } from '@/app/actions/adminCrud';
import AdminSidebar from './AdminSidebar';

export interface ThemeColor {
  id: string;
  name: string;
  hex: string;
  hoverHex: string;
}

export const ADMIN_COLOR_PALETTES: ThemeColor[] = [
  { id: 'blue', name: 'Sky Blue', hex: '#0EA5E9', hoverHex: '#0284C7' },
  { id: 'cyan', name: 'Cyan Wave', hex: '#06B6D4', hoverHex: '#0891B2' },
  { id: 'green', name: 'Emerald Green', hex: '#10B981', hoverHex: '#059669' },
  { id: 'purple', name: 'Royal Violet', hex: '#8B5CF6', hoverHex: '#7C3AED' },
  { id: 'gold', name: 'Amber Gold', hex: '#FFA800', hoverHex: '#FFB82E' },
  { id: 'red', name: 'Crimson Red', hex: '#D31A26', hoverHex: '#E52532' },
  { id: 'pink', name: 'Hot Pink', hex: '#EC4899', hoverHex: '#DB2777' },
  { id: 'yellow', name: 'Vibrant Yellow', hex: '#FFB400', hoverHex: '#FFC02A' },
];

/** Always enforce clean dark mode CSS variables */
function applyDarkCSSVars(accent: string) {
  const root = document.documentElement;
  root.classList.add('dark');
  root.style.setProperty('--theme-color', accent);
  root.style.setProperty('--theme-color-hover', accent);
  root.style.setProperty('--primary', accent);
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--ring', accent);

  root.style.setProperty('--admin-bg', '#0C0C0E');
  root.style.setProperty('--admin-surface', '#121215');
  root.style.setProperty('--admin-card', '#141418');
  root.style.setProperty('--admin-border', '#222226');
  root.style.setProperty('--admin-border-hover', '#33333A');
  root.style.setProperty('--admin-text', '#FFFFFF');
  root.style.setProperty('--admin-text-secondary', '#99999F');
  root.style.setProperty('--admin-muted', '#66666F');
  root.style.setProperty('--admin-input', '#17171C');
}

interface AdminThemeShellProps {
  children: React.ReactNode;
  adminEmail?: string;
  fullName?: string;
  initialColor?: string;
}

export default function AdminThemeShell({
  children,
  adminEmail,
  fullName,
  initialColor = '#0EA5E9',
}: AdminThemeShellProps) {
  const initialHex = initialColor || '#0EA5E9';
  const defaultPalette = ADMIN_COLOR_PALETTES.find(
    (c) => c.hex.toLowerCase() === initialHex.toLowerCase()
  ) || {
    id: 'default',
    name: 'Theme Color',
    hex: initialHex,
    hoverHex: initialHex,
  };

  const [themeColor, setThemeColorState] = useState<ThemeColor>(defaultPalette);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedColor = localStorage.getItem('sadiq_portfolio_color');
      if (savedColor) {
        const match = ADMIN_COLOR_PALETTES.find(
          (c) => c.hex.toLowerCase() === savedColor.toLowerCase()
        );
        if (match) {
          setThemeColorState(match);
          applyDarkCSSVars(match.hex);
        } else {
          setThemeColorState({ id: 'custom', name: 'Custom Accent', hex: savedColor, hoverHex: savedColor });
          applyDarkCSSVars(savedColor);
        }
      } else {
        applyDarkCSSVars(initialHex);
      }
    } catch {
      applyDarkCSSVars(initialHex);
    }
  }, [initialHex]);

  const setThemeColor = (palette: ThemeColor) => {
    setThemeColorState(palette);
    applyDarkCSSVars(palette.hex);
    try {
      localStorage.setItem('sadiq_portfolio_color', palette.hex);
    } catch {
      // ignore
    }
  };

  const handleSaveAsDefault = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await updateThemeColorAdmin(themeColor.hex);
      setSaveMessage('Saved as Site Default!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage('Error saving color');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0C0C0E] text-[#FFFFFF] flex flex-col font-sans antialiased relative"
      style={{ '--theme-color': themeColor.hex, '--theme-color-hover': themeColor.hoverHex } as React.CSSProperties}
    >
      {/* Sidebar (Clean, Minimal, Dark Only) */}
      <AdminSidebar
        adminEmail={adminEmail}
        fullName={fullName}
        themeColor={themeColor}
        onOpenColorPicker={() => setColorPickerOpen(true)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 bg-[#0C0C0E] min-h-screen">
        {/* Floating Minimal Theme Picker Button */}
        <div className="fixed right-0 top-24 z-50">
          <button
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
            aria-label="Color Palette"
            className="w-8 h-8 rounded-l-lg shadow-xl flex items-center justify-center transition-all cursor-pointer group active:scale-95 text-black"
            style={{
              backgroundColor: themeColor.hex,
            }}
            title="Theme Accent"
          >
            <Palette
              size={15}
              className={`transition-transform duration-300 ${colorPickerOpen ? 'rotate-90' : 'group-hover:scale-110'} text-black`}
            />
          </button>

          {/* Minimal Color Picker Dropdown */}
          {colorPickerOpen && (
            <div
              className="absolute right-0 top-10 w-52 border border-[#26262C] rounded-2xl shadow-2xl p-3 bg-[#141418]/95 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#222228]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Theme Accent
                </span>
                <button
                  onClick={() => setColorPickerOpen(false)}
                  className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>

              {/* 8-color palette */}
              <div className="grid grid-cols-4 gap-2 py-1">
                {ADMIN_COLOR_PALETTES.map((palette) => {
                  const isSelected = themeColor.hex.toLowerCase() === palette.hex.toLowerCase();
                  return (
                    <button
                      key={palette.id}
                      onClick={() => setThemeColor(palette)}
                      className="relative w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      style={{
                        backgroundColor: palette.hex,
                        boxShadow: isSelected ? `0 0 8px ${palette.hex}` : undefined,
                      }}
                      title={palette.name}
                    >
                      {isSelected && <Check size={13} className="text-black font-black" />}
                    </button>
                  );
                })}
              </div>

              {/* Save default */}
              <div className="mt-2.5 pt-2 border-t border-[#222228]">
                <button
                  onClick={handleSaveAsDefault}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-black font-black text-[10px] uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: themeColor.hex }}
                >
                  {isSaving ? <span>Saving...</span> : <><Save size={11} /><span>Save Default</span></>}
                </button>
                {saveMessage && (
                  <div className="mt-1 text-center text-[10px] text-emerald-400 font-mono">
                    {saveMessage}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Top Navbar (Hidden on mobile, visible on desktop) */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 bg-[#101013]/90 backdrop-blur-md border-b border-[#1F1F24] px-4 sm:px-6 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor.hex }} />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Faculty Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16161B] border border-[#282830] text-xs font-semibold text-neutral-300 hover:text-white transition"
            >
              <span>View Site</span>
              <ExternalLink size={12} style={{ color: themeColor.hex }} />
            </Link>

            <div className="flex items-center gap-2 pl-3 border-l border-[#222228]">
              <div
                className="relative w-7 h-7 rounded-full overflow-hidden border"
                style={{ borderColor: themeColor.hex }}
              >
                <Image
                  src="/prof-portrait.webp"
                  alt={fullName || 'Admin'}
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </div>
              <span className="hidden sm:inline text-xs font-bold text-white truncate max-w-[140px]">
                {fullName}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-2.5 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
