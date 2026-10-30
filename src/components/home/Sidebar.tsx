'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { Menu, X } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
}

interface SidebarProps {
  navItems: readonly NavItem[] | NavItem[];
  activeTab: string;
  handleTabChange: (target: string) => void;
  themeColor: { hex: string; name?: string };
}

export default function Sidebar({
  navItems,
  activeTab,
  handleTabChange,
  themeColor,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const labelsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Fast & snappy GSAP animation (no sluggish delay)
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const ctx = gsap.context(() => {
      if (isOpen) {
        gsap.set(panel, {
          autoAlpha: 1,
          scaleY: 1,
          transformOrigin: 'top center',
        });

        timelineRef.current?.kill();

        const tl = gsap.timeline();
        timelineRef.current = tl;

        // Snappy drop & expand from top to bottom
        tl.fromTo(
          panel,
          { scaleY: 0.88, y: -6 },
          {
            scaleY: 1,
            y: 0,
            duration: 0.16,
            ease: 'power2.out',
          }
        );

        // Icons reveal fast with minimal stagger
        tl.fromTo(
          itemsRef.current.filter(Boolean),
          { y: -8, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.16,
            stagger: 0.02,
            ease: 'power2.out',
          },
          '-=0.10'
        );

        // Text labels slide fast from behind the shape
        tl.fromTo(
          labelsRef.current.filter(Boolean),
          { x: -10, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            duration: 0.16,
            stagger: 0.02,
            ease: 'power2.out',
          },
          '-=0.12'
        );
      } else {
        timelineRef.current?.kill();

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(panel, { autoAlpha: 0 });
          },
        });

        timelineRef.current = tl;

        // Fast collapse on turn-off
        tl.to(labelsRef.current.filter(Boolean), {
          x: -8,
          autoAlpha: 0,
          duration: 0.1,
          stagger: {
            each: 0.015,
            from: 'end',
          },
          ease: 'power1.in',
        });

        tl.to(
          itemsRef.current.filter(Boolean),
          {
            y: -6,
            autoAlpha: 0,
            duration: 0.1,
            stagger: {
              each: 0.015,
              from: 'end',
            },
            ease: 'power1.in',
          },
          '-=0.08'
        );

        tl.to(
          panel,
          {
            scaleY: 0.88,
            y: -6,
            duration: 0.12,
            ease: 'power2.in',
          },
          '-=0.05'
        );
      }
    }, containerRef);

    return () => {
      ctx.revert();
      timelineRef.current?.kill();
    };
  }, [isOpen]);

  const activeItems = navItems;

  return (
    <div
      ref={containerRef}
      className="fixed left-5 top-5 z-50 hidden lg:flex items-start gap-2.5 select-none"
    >
      {/* Column: 3-Bar Toggle Button + Animated Capsule Panel */}
      <div className="flex flex-col items-center">
        {/* 3-Bar Toggle Button (ONLY this button toggles ON/OFF) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Turn off navigation' : 'Turn on navigation'}
          aria-expanded={isOpen}
          title="Toggle Navigation (3-Bar)"
          className={`mb-2 flex h-11 w-11 items-center justify-center rounded-full border shadow-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
            isOpen
              ? 'bg-[#2E2E2E] border-[var(--theme-color)] text-[var(--theme-color)]'
              : 'bg-[#242424] border-[#383838] text-white hover:bg-[#2F2F2F] hover:border-[var(--theme-color)] hover:text-[var(--theme-color)]'
          }`}
        >
          {/* 3-Bar (closed) → X (open) */}
          {isOpen
            ? <X size={18} className="transition-transform duration-150" />
            : <Menu size={18} className="transition-transform duration-150" />
          }
        </button>

        {/* Animated Navigation Capsule Panel (with icons) */}
        <div
          ref={panelRef}
          aria-hidden={!isOpen}
          data-lenis-prevent
          className={`relative w-11 overflow-hidden rounded-full bg-[#242424] border border-[#383838] py-3 shadow-2xl ${
            isOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          style={{ visibility: isOpen ? 'visible' : 'hidden' }}
        >
          <nav className="flex flex-col items-center gap-2.5">
            {activeItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const targetHref = item.href || (item.id === 'home' ? '/' : `/${item.id}`);

              return (
                <Link
                  key={item.id}
                  href={targetHref}
                  prefetch={true}
                  ref={(el) => {
                    itemsRef.current[index] = el;
                  }}
                  tabIndex={isOpen ? 0 : -1}
                  onClick={() => {
                    handleTabChange(targetHref);
                  }}
                  title={item.label}
                  aria-label={item.label}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'text-black shadow-md'
                      : 'text-[#999999] hover:text-white hover:scale-105'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: themeColor.hex }
                      : undefined
                  }
                >
                  <Icon size={15} />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Animated Text Labels outside the shape (Clicking switches tab without closing) */}
      {isOpen && (
        <div data-lenis-prevent className="flex flex-col pt-[64px]">
          {activeItems.map((item, index) => {
            const isActive = activeTab === item.id;
            const targetHref = item.href || (item.id === 'home' ? '/' : `/${item.id}`);

            return (
              <Link
                key={item.id}
                href={targetHref}
                prefetch={true}
                ref={(el) => {
                  labelsRef.current[index] = el;
                }}
                tabIndex={isOpen ? 0 : -1}
                onClick={() => {
                  handleTabChange(targetHref);
                }}
                className={`h-8 mb-2.5 last:mb-0 flex items-center px-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-[var(--theme-color)]'
                    : 'text-white hover:text-[var(--theme-color)]'
                }`}
                style={isActive ? { color: themeColor.hex } : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
