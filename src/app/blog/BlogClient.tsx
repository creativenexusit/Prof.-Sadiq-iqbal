'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IBlogPost } from '@/lib/data';
import { usePortfolio } from '@/components/home/PortfolioShell';
import { Sparkles, ArrowRight, Layers, Clock, Calendar } from 'lucide-react';

interface BlogClientProps {
  blogPosts: IBlogPost[];
}

function SafeBlogImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full bg-[#18181F] flex items-center justify-center text-neutral-600">
        <Layers size={24} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setError(true)}
    />
  );
}

export default function BlogClient({ blogPosts }: BlogClientProps) {
  const { themeColor } = usePortfolio();

  // Find featured post (if any)
  const featuredPost = blogPosts.find((p) => p.isFeatured);

  // All other posts for the grid (if featured exists, show remaining in grid)
  const gridPosts = featuredPost
    ? blogPosts.filter((p) => (p._id ? p._id !== featuredPost._id : p.slug !== featuredPost.slug))
    : blogPosts;

  return (
    <div className="animate-slide-right w-full space-y-6 sm:space-y-8 max-w-full overflow-hidden">
      {/* ═══════════════════════════════════════════════
          PAGE HEADER (Mobile-friendly)
      ═══════════════════════════════════════════════ */}
      <div className="text-center space-y-2 px-1">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
          LATEST{' '}
          <span style={{ color: themeColor.hex }} className="transition-colors duration-300">
            BLOGS
          </span>
        </h1>
        <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#888888]">
          <span className="hidden sm:inline-block w-6 sm:w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
          <span className="text-center leading-normal">
            ACADEMIC INSIGHTS, ESSAYS &amp; TECHNICAL PERSPECTIVES
          </span>
          <span className="hidden sm:inline-block w-6 sm:w-8 h-[1px]" style={{ backgroundColor: themeColor.hex }} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          1. FEATURED ARTICLE SPOTLIGHT (Hero Card)
      ═══════════════════════════════════════════════ */}
      {featuredPost && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 px-0.5">
            <Sparkles size={12} style={{ color: themeColor.hex }} />
            <span>Featured Insight</span>
          </div>

          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#141418] border border-[#2B2B33] hover:border-[var(--theme-color)] active:scale-[0.995] transition-all duration-300 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 items-center">
              {/* Spotlight Image */}
              <div className="relative md:col-span-7 h-48 xs:h-56 sm:h-64 md:h-80 w-full overflow-hidden bg-[#101014]">
                <SafeBlogImage
                  src={featuredPost.image || '/contact-sheet/img2.webp'}
                  alt={featuredPost.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/85 via-black/30 to-transparent" />

                {/* Featured Badge */}
                <div
                  className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/85 backdrop-blur-md border shadow-lg"
                  style={{ borderColor: themeColor.hex, color: themeColor.hex }}
                >
                  <Sparkles size={11} className="fill-current" />
                  <span>Featured Post</span>
                </div>

                {/* Category pill on image */}
                {featuredPost.category && (
                  <div className="md:hidden absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/85 backdrop-blur-sm border border-white/10 text-neutral-200">
                    {featuredPost.category}
                  </div>
                )}
              </div>

              {/* Spotlight Content */}
              <div className="p-4 sm:p-6 md:col-span-5 flex flex-col justify-between space-y-2.5 sm:space-y-3">
                <div className="hidden md:flex items-center gap-2 text-xs">
                  {featuredPost.category && (
                    <span
                      className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-[#1C1C24] border border-[#2B2B35]"
                      style={{ color: themeColor.hex }}
                    >
                      {featuredPost.category}
                    </span>
                  )}
                  {featuredPost.readTime && (
                    <span className="text-neutral-500 font-mono text-[11px]">
                      {featuredPost.readTime}
                    </span>
                  )}
                </div>

                <h2 className="text-base sm:text-xl md:text-2xl font-bold sm:font-black text-white group-hover:text-[var(--theme-color)] transition-colors leading-snug line-clamp-2 sm:line-clamp-3">
                  {featuredPost.title}
                </h2>

                <p className="text-xs sm:text-[13px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {featuredPost.excerpt}
                </p>

                <div className="pt-2 border-t border-[#1F1F26] md:border-t-0 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-mono text-[11px] inline-flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{featuredPost.date}</span>
                  </span>

                  <span
                    className="inline-flex items-center gap-1.5 font-bold uppercase text-[11px] tracking-wider group-hover:translate-x-1 transition-transform"
                    style={{ color: themeColor.hex }}
                  >
                    <span>Read Article</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          2. SIMPLE ARTICLES GRID (Just Image + Title)
      ═══════════════════════════════════════════════ */}
      <div className="space-y-3 sm:space-y-4">
        {featuredPost && gridPosts.length > 0 && (
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-0.5 pt-1">
            All Articles &amp; Commentary ({blogPosts.length})
          </h3>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 lg:gap-6">
          {gridPosts.map((post, idx) => {
            const articleUrl = `/blog/${post.slug}`;
            const postImage = post.image || `/contact-sheet/img${(idx + 2) % 7}.webp`;

            return (
              <Link
                key={post.slug || post._id || idx}
                href={articleUrl}
                className="group flex flex-col rounded-xl sm:rounded-2xl overflow-hidden bg-[#141418] border border-[#222226] hover:border-[var(--theme-color)] active:scale-[0.99] transition-all duration-300 shadow-md hover:-translate-y-0.5"
              >
                {/* 1. CLEAN IMAGE BOX */}
                <div className="relative aspect-[16/10] w-full bg-[#101014] overflow-hidden">
                  <SafeBlogImage src={postImage} alt={post.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                  {/* Featured Badge on Card */}
                  {post.isFeatured && (
                    <div
                      className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/85 backdrop-blur-md border shadow-md"
                      style={{ borderColor: themeColor.hex, color: themeColor.hex }}
                    >
                      <Sparkles size={9} className="fill-current" />
                      <span>Featured</span>
                    </div>
                  )}

                  {/* Category Pill on bottom of Image */}
                  {post.category && (
                    <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-sm border border-white/10 text-neutral-300 max-w-[65%] truncate">
                      {post.category}
                    </div>
                  )}

                  {/* Read time pill */}
                  {post.readTime && (
                    <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 text-[9px] font-mono text-neutral-400 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10 inline-flex items-center gap-1">
                      <Clock size={9} />
                      <span>{post.readTime}</span>
                    </div>
                  )}
                </div>

                {/* 2. SIMPLE TITLE & DATE (Pure Image + Title) */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                  <h3 className="text-sm sm:text-[15px] font-bold text-white group-hover:text-[var(--theme-color)] transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  <div className="pt-2 border-t border-[#1C1C22] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span>{post.date}</span>
                    <span
                      className="inline-flex items-center gap-1 font-bold group-hover:translate-x-0.5 transition-transform"
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
      </div>
    </div>
  );
}
