'use client';

import { useState, useEffect } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import Link from 'next/link';
import { User, Briefcase } from 'lucide-react';
import { usePortfolio } from '@/components/home/PortfolioShell';

interface HomeHeroProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile?: any;
}

export default function HomeHero({ profile }: HomeHeroProps) {
  const { themeColor } = usePortfolio();
  const [typewriterText, setTypewriterText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const fullName = profile?.fullName || 'Prof. Sadiq Iqbal';
  const designation = profile?.designation || 'Chairman, Department of Computer Science & Engineering';
  const institution = profile?.institution || 'Bangladesh University, Dhaka, Bangladesh';
  const bio =
    profile?.bio ||
    'Academic leader, educator, and researcher with extensive experience in computer science and engineering. Dedicated to advancing scientific inquiry in Machine Learning, Explainable AI, Network Security, and Telemedicine.';
  const avatarUrl = profile?.avatar?.url || '/prof-sadiq-iqbal.png';

  const phrases = [
    fullName.toUpperCase(),
    'PROFESSOR DEPT. OF CSE',
    'MACHINE LEARNING RESEARCHER',
    'EXPLAINABLE AI SPECIALIST',
    'DEPT HEAD OF CSE DEPARTMENT',
  ];

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex] || phrases[0];
    let timer: NodeJS.Timeout;

    if (!isDeleting && typewriterText.length < currentPhrase.length) {
      timer = setTimeout(() => {
        setTypewriterText(currentPhrase.substring(0, typewriterText.length + 1));
      }, 75);
    } else if (!isDeleting && typewriterText.length === currentPhrase.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2200);
    } else if (isDeleting && typewriterText.length > 0) {
      timer = setTimeout(() => {
        setTypewriterText(currentPhrase.substring(0, typewriterText.length - 1));
      }, 40);
    } else if (isDeleting && typewriterText.length === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, phraseIndex, phrases]);

  return (
    <div className="animate-slide-right w-full min-h-[calc(100vh-130px)] flex items-center py-6 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left: User Portrait */}
        <div className="lg:col-span-5 flex justify-center lg:justify-start">
          <div className="relative w-64 h-80 sm:w-80 sm:h-[420px]">
            {/* Offset Border in Active Theme Color */}
            <div
              className="absolute -inset-3 -bottom-3 -right-3 border-2 rounded-3xl pointer-events-none transition-colors duration-300"
              style={{ borderColor: themeColor.hex }}
            />
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-[#181818] shadow-2xl">
              <OptimizedImage
                src={avatarUrl}
                alt={`${fullName} — ${designation}`}
                fill
                priority
                quality={80}
                sizes="(max-width: 640px) 256px, 320px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right: Hero Headline & Animated Typewriter Text */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#A5A5A5] block">
            HI THERE !
          </span>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-[1.12]">
              I&apos;M{' '}
              <span
                style={{ color: themeColor.hex }}
                className="transition-colors duration-300 inline-block min-h-[1.2em]"
              >
                {typewriterText}
                <span aria-hidden="true" className="animate-pulse font-normal">|</span>
              </span>
            </h1>

            <p
              className="text-base sm:text-xl font-bold transition-colors duration-300"
              style={{ color: themeColor.hex }}
            >
              {designation}
            </p>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#888888]">
              {institution}
            </p>
          </div>

          <p className="text-sm sm:text-base leading-relaxed text-[#D6D6D6] max-w-xl mx-auto lg:mx-0">
            {bio}
          </p>

          {/* Two Pill Buttons: Solid Color + Outlined Color */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              href="/about"
              style={{ backgroundColor: themeColor.hex }}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-black font-bold text-xs sm:text-sm uppercase tracking-wider shadow-xl transition-all cursor-pointer active:scale-95 hover:opacity-90"
            >
              <User size={16} />
              <span>MORE</span>
            </Link>

            <Link
              href="/research"
              className="btn-theme-outline inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border font-bold text-xs sm:text-sm uppercase tracking-wider cursor-pointer active:scale-95 shadow-md hover:shadow-xl"
            >
              <Briefcase size={16} />
              <span>RESEARCH</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
