'use client';

import { useState } from 'react';
import Image from 'next/image';
import OptimizedImage from '@/components/OptimizedImage';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Check,
  Bookmark,
  ArrowRight,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { IBlogPost } from '@/lib/data';
import { usePortfolio } from '@/components/home/PortfolioShell';

function SafeRelatedImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-[#18181F] flex items-center justify-center text-neutral-600">
        <Layers size={22} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes="(max-width: 640px) 100vw, 50vw"
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setError(true)}
    />
  );
}

interface BlogDetailClientProps {
  post: IBlogPost;
  relatedPosts: IBlogPost[];
}

export default function BlogDetailClient({ post, relatedPosts }: BlogDetailClientProps) {
  const { themeColor } = usePortfolio();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <article className="animate-slide-right w-full max-w-4xl mx-auto space-y-10 sm:space-y-12">
      {/* 1. TOP NAVIGATION / BACK BUTTON */}
      <div className="flex items-center justify-between border-b border-[#262626] pb-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A0A0A0] hover:text-white transition-colors group cursor-pointer"
        >
          <span
            className="flex items-center justify-center w-7 h-7 rounded-full bg-[#202020] group-hover:bg-[var(--theme-color)] group-hover:text-black transition-all"
            style={{ color: themeColor.hex }}
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          </span>
          <span>BACK TO ALL ARTICLES</span>
        </Link>

        {/* Share Action Button */}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#333333] bg-[#1E1E1E] text-xs font-semibold text-[#CCCCCC] hover:text-white hover:border-[var(--theme-color)] transition-all cursor-pointer active:scale-95"
          title="Copy article link"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Share2 size={13} style={{ color: themeColor.hex }} />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* 2. ARTICLE HEADER */}
      <header className="space-y-4">
        {/* Category & Read Time */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span
            className="px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[11px] bg-[#222222] border"
            style={{ color: themeColor.hex, borderColor: `${themeColor.hex}40` }}
          >
            {post.category}
          </span>
          <span className="text-[#666666]">•</span>
          <span className="inline-flex items-center gap-1 text-[#999999]">
            <Clock size={13} style={{ color: themeColor.hex }} />
            <span>{post.readTime}</span>
          </span>
          <span className="text-[#666666]">•</span>
          <span className="inline-flex items-center gap-1 text-[#999999]">
            <Calendar size={13} style={{ color: themeColor.hex }} />
            <span>{post.date}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
          {post.title}
        </h1>

        {/* Author Byline */}
        <div className="flex items-center gap-3 pt-2">
          <div
            className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm bg-[#1E1E1E]"
            style={{ borderColor: themeColor.hex, color: themeColor.hex }}
          >
            SI
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">{post.author}</p>
            <p className="text-xs text-[#888888] mt-1">
              Associate Professor &amp; Chair, Dept of CSE, BU
            </p>
          </div>
        </div>
      </header>

      {/* 3. FEATURED IMAGE */}
      {post.image && (
        <div className="relative w-full h-64 sm:h-96 rounded-2xl overflow-hidden bg-[#161616] border border-[#2E2E2E] shadow-2xl">
          <OptimizedImage
            src={post.image}
            alt={post.title}
            fill
            quality={80}
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}

      {/* 4. ABSTRACT CALLOUT */}
      <div
        className="p-5 sm:p-6 rounded-2xl bg-[#1A1A1A] border-l-4 shadow-xl"
        style={{ borderLeftColor: themeColor.hex }}
      >
        <span
          className="text-xs font-mono font-bold uppercase tracking-wider block mb-2"
          style={{ color: themeColor.hex }}
        >
          // EXECUTIVE SUMMARY
        </span>
        <p className="text-sm sm:text-base text-[#E0E0E0] italic leading-relaxed">
          &ldquo;{post.excerpt}&rdquo;
        </p>
      </div>

      {/* 5. MAIN ESSAY CONTENT */}
      <div className="space-y-6 text-[#CCCCCC] text-sm sm:text-base leading-relaxed sm:leading-8 font-sans">
        {post.content && post.content.length > 0 ? (
          post.content.map((paragraph, idx) => (
            <p key={idx} className="tracking-wide">
              {paragraph}
            </p>
          ))
        ) : (
          <p>{post.excerpt}</p>
        )}
      </div>

      {/* 6. TAGS SECTION */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-6 border-t border-[#262626] space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">
            TOPICS &amp; DOMAIN SPECIALTIES:
          </span>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-[#1F1F1F] text-[#D0D0D0] border border-[#2E2E2E]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 7. BOTTOM NAVIGATION / RETURN */}
      <div className="pt-8 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/blog"
          style={{ backgroundColor: themeColor.hex }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 shadow-xl"
        >
          <ArrowLeft size={15} />
          <span>BACK TO ALL ARTICLES</span>
        </Link>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xs font-bold uppercase tracking-wider text-[#888888] hover:text-white transition-colors py-2"
        >
          ↑ RETURN TO TOP
        </button>
      </div>

      {/* 8. RELATED ARTICLES RECOMMENDATION */}
      {relatedPosts.length > 0 && (
        <section className="pt-10 border-t border-[#262626] space-y-6">
          <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor.hex }} />
            <span>MORE TECHNICAL ESSAYS &amp; INSIGHTS</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {relatedPosts.map((related, idx) => {
              const relImage = related.image || `/contact-sheet/img${(idx + 3) % 7}.webp`;

              return (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group flex flex-col rounded-xl sm:rounded-2xl overflow-hidden bg-[#141418] border border-[#24242A] hover:border-[var(--theme-color)] active:scale-[0.99] transition-all duration-300 shadow-md hover:-translate-y-0.5"
                >
                  {/* Clean Image Box */}
                  <div className="relative aspect-[16/10] w-full bg-[#101014] overflow-hidden">
                    <SafeRelatedImage src={relImage} alt={related.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                    {/* Category pill on image */}
                    {related.category && (
                      <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-sm border border-white/10 text-neutral-300 max-w-[65%] truncate">
                        {related.category}
                      </div>
                    )}

                    {/* Read time pill */}
                    {related.readTime && (
                      <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 text-[9px] font-mono text-neutral-400 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10 inline-flex items-center gap-1">
                        <Clock size={9} />
                        <span>{related.readTime}</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Date */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                    <h4 className="text-sm sm:text-[15px] font-bold text-white group-hover:text-[var(--theme-color)] transition-colors leading-snug line-clamp-2">
                      {related.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-[#1F1F24] font-mono">
                      <span>{related.date}</span>
                      <span
                        className="font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        style={{ color: themeColor.hex }}
                      >
                        <span>Read</span>
                        <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
