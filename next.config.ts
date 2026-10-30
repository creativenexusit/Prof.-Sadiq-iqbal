import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ─── Format priority: AVIF first, WebP fallback, then original ───
    formats: ['image/avif', 'image/webp'],

    // ─── Responsive breakpoints (matches common device widths) ───
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // ─── Cache optimized images for 30 days on CDN/browser ───
    minimumCacheTTL: 60 * 60 * 24 * 30,

    // ─── Dangerously allow SVG for inline use (logo etc.) ───
    dangerouslyAllowSVG: false,

    // ─── Remote image sources allowed ───
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  // ─── HTTP Security Headers ───
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // ─── Cache static assets aggressively ───
      {
        source: '/(.*)\\.(png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
