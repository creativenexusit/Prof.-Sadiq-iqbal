'use client';

import { useActionState, useState, useEffect } from 'react';
import { loginAdmin } from '@/app/actions/adminAuth';
import {
  Lock,
  User,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, { success: false });
  const [showPassword, setShowPassword] = useState(false);
  const [emailValue, setEmailValue] = useState('sadiq.iqbal@bu.edu.bd');
  const [rememberMe, setRememberMe] = useState(true);
  const [themeColor, setThemeColor] = useState('#FFA800');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sadiq_portfolio_color');
      if (saved) setThemeColor(saved);
    } catch {
      // ignore
    }
  }, []);

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen min-h-[100dvh] w-full bg-[#0E0E10] text-[#FFFFFF] flex flex-col lg:flex-row font-sans relative overflow-x-hidden"
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
      {/* ════════════════════════════════════════════════════════════════
          LEFT PANEL: Full-Screen Identity Layout
          - Animated from top with theme color shape
          - BU Logo & Department
          - Portrait & Designation with Framer Motion spring
      ════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#121214] flex-col justify-between items-center border-r border-[#222226] overflow-hidden select-none">
        {/* Subtle radial glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full opacity-10 blur-3xl pointer-events-none transition-all"
          style={{ backgroundColor: themeColor }}
        />

        {/* 1. TOP SHAPE (Full width of left side, slides down from top with Framer Motion) */}
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative overflow-hidden z-10"
        >
          <div
            className="w-full pt-8 pb-10 px-8 xl:px-12 text-black transition-colors"
            style={{ backgroundColor: themeColor }}
          >
            {/* Top Bar: View Site link */}
            <div className="w-full flex items-center justify-between mb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black/85 hover:text-black transition-transform hover:-translate-x-1 cursor-pointer"
              >
                <span className="w-8 h-8 rounded-full bg-black/15 flex items-center justify-center">
                  <ArrowLeft size={15} className="text-black" />
                </span>
                <span>View Site</span>
              </Link>
            </div>

            {/* University & Department Titles then BU Logo */}
            <div className="text-center space-y-2">

              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                className="flex justify-center py-0.5"
              >
                <div className="relative w-14 h-14 xl:w-16 xl:h-16 shrink-0 drop-shadow-lg">
                  <OptimizedImage
                    src="/bu-logo.png"
                    alt="Bangladesh University Logo"
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
              </motion.div>
              <div>
                <h2 className="text-lg xl:text-xl font-black tracking-widest uppercase text-black">
                  BANGLADESH UNIVERSITY
                </h2>
                <p className="text-[11px] font-bold tracking-wider text-black/85 uppercase">
                  Dept. of Computer Science &amp; Engineering
                </p>
              </div>


            </div>
          </div>

          {/* Curved Bottom of Shape */}
          <svg
            viewBox="0 0 500 50"
            className="w-full h-9 block -mt-[1px]"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M 0,0 L 500,0 C 350,45 150,45 0,0 Z"
              style={{ fill: themeColor }}
            />
          </svg>
        </motion.div>

        {/* 2. CENTER CONTENT (Portrait, Name & Title, raised up with bottom-20) */}
        <div className="w-full max-w-sm px-6 my-auto py-2 flex flex-col items-center text-center z-10 relative bottom-20">
          {/* Round Portrait Photo (animates in after the shape with spring motion) */}
          <motion.div
            initial={{ scale: 0.5, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 140, damping: 15, delay: 0.3 }}
            className="relative -mt-16 sm:-mt-20 mb-4 flex items-center justify-center"
          >
            <div
              className="w-32 h-32 xl:w-36 xl:h-36 rounded-full p-1 shadow-2xl transition-all"
              style={{ backgroundColor: themeColor }}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#121214] bg-[#1A1A1E]">
                <OptimizedImage
                  src="/prof-portrait.webp"
                  alt="Prof. Sadiq Iqbal"
                  fill
                  priority
                  quality={90}
                  sizes="(max-width: 1280px) 128px, 144px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Verified Check Badge */}
            <span
              className="absolute bottom-1 right-2 w-6 h-6 rounded-full border-2 border-[#121214] flex items-center justify-center shadow-md text-black font-black"
              style={{ backgroundColor: themeColor }}
              title="Verified Administrator"
            >
              <Check size={12} strokeWidth={3} />
            </span>
          </motion.div>

          {/* Name & Title */}
          <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.42, ease: 'easeOut' }}
            className="space-y-1.5"
          >
            <h1 className="text-xl xl:text-3xl font-black text-white tracking-tight uppercase">
              PROF. SADIQ IQBAL
            </h1>
            <p
              className="text-xs xl:text-sm font-black uppercase tracking-wider transition-colors"
              style={{ color: themeColor }}
            >
              CHAIRMAN &amp; PROFESSOR
            </p>
            <p className="text-xs text-neutral-400 font-medium tracking-wide">
              Bangladesh University, Dhaka
            </p>
          </motion.div>
        </div>

        {/* 3. BOTTOM FOOTER BAND (Clean www.bu.edu.bd) */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="w-full bg-[#0A0A0C] border-t border-[#1C1C20] py-3 text-center z-10"
        >
          <span className="text-xs font-mono font-medium tracking-widest text-neutral-400 hover:text-white transition-colors">
            www.bu.edu.bd
          </span>
        </motion.div> */}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          RIGHT PANEL: Clean, Simple, Easy-to-use Sign In Form
          Sequential Framer Motion entrances for each component
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-h-[100dvh] flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 bg-[#0E0E10]">
        {/* Mobile Header: Clean compact identity badge */}
        <div className="lg:hidden flex items-center justify-between pb-4 border-b border-[#222226]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#999999] hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>View Site</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div
              className="relative w-9 h-9 rounded-full overflow-hidden border-2 shadow-md"
              style={{ borderColor: themeColor }}
            >
              <OptimizedImage
                src="/prof-portrait.webp"
                alt="Prof. Sadiq Iqbal"
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
            <div className="text-left">
              <span className="block text-xs font-black text-white leading-tight">
                Prof. Sadiq Iqbal
              </span>
              <span className="block text-[10px] text-[#888888] font-mono">
                BU-CSE-001
              </span>
            </div>
          </div>
        </div>

        {/* Form Container: Framer Motion staggered entrance */}
        <div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ x: 35, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-1.5"
          >
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Sign in
            </h1>
            <p className="text-xs sm:text-sm text-[#888888]">
              Enter your credentials to access the administration console.
            </p>
          </motion.div>

          {/* Error Message */}
          {state?.error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Form with Staggered Inputs */}
          <form action={formAction} className="space-y-4">
            {/* Input 1: User Name / Email */}
            <motion.div
              initial={{ x: 35, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1.5"
            >
              <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA]">
                Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#777777] pointer-events-none">
                  <User size={17} />
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  placeholder="sadiq.iqbal@bu.edu.bd"
                  className="w-full pl-12 pr-4 py-3.5 text-sm rounded-xl bg-[#161619] border border-[#28282E] text-white placeholder-[#555555] focus:outline-none focus:border-[var(--theme-color)] focus:ring-1 focus:ring-[var(--theme-color)] transition-all"
                />
              </div>
            </motion.div>

            {/* Input 2: Password with SHOW/HIDE toggle */}
            <motion.div
              initial={{ x: 35, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-1.5"
            >
              <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA]">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#777777] pointer-events-none">
                  <Lock size={17} />
                </span>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  defaultValue="admin@121"
                  className="w-full pl-12 pr-20 py-3.5 text-sm rounded-xl bg-[#161619] border border-[#28282E] text-white placeholder-[#555555] focus:outline-none focus:border-[var(--theme-color)] focus:ring-1 focus:ring-[var(--theme-color)] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[11px] font-black uppercase tracking-wider text-[#888888] hover:text-white transition-colors cursor-pointer px-1 py-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </motion.div>

            {/* Checkbox: Remember me & Default Credential Info */}
            <motion.div
              initial={{ x: 25, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between text-xs pt-1"
            >
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${rememberMe
                    ? 'border-[var(--theme-color)] bg-[var(--theme-color)] text-black'
                    : 'border-[#444444] bg-[#1A1A1E]'
                    }`}
                >
                  {rememberMe && <Check size={12} strokeWidth={3} />}
                </span>
                <span className="text-[#AAAAAA] hover:text-white transition-colors text-[11px]">
                  Remember me
                </span>
              </label>

            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={isPending}
                style={{ backgroundColor: themeColor }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[var(--theme-color)]/20 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 hover:brightness-110"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-black" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </motion.div>
          </form>

          {/* Quick Helper Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="pt-3 border-t border-[#1F1F24] text-center text-xs text-[#777777]"
          >
            <span>Need to visit the portfolio? </span>
            <Link
              href="/"
              className="text-white hover:text-[var(--theme-color)] font-semibold transition-colors underline ml-1"
            >
              View Site
            </Link>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-[#555555] font-mono uppercase tracking-wider pt-2">
          &copy; {new Date().getFullYear()} Prof. Sadiq Iqbal &bull; All Rights Reserved
        </div>
      </div>
    </motion.div>
  );
}
