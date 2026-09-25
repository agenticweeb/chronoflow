import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Consolidate all legacy domains onto the custom domain (301 = pass authority).
  // Without this, the old vercel.app URLs serve duplicate content and whatever
  // signals they earned never transfer to aniwatchorder.cc.
  async redirects() {
    const legacyHosts = [
      "chronoflow-zeta.vercel.app",
      "myaniwatchorder-zeta.vercel.app",
    ];
    return legacyHosts.map((host) => ({
      source: "/:path*",
      // Next's RouteHas type: host conditions take ONLY `value` — no `key`.
      // (key exists for header/cookie/query condition types, not host.)
      has: [{ type: "host", value: host }],
      destination: "https://aniwatchorder.cc/:path*",
      permanent: true,
    }));
  },
  images: {
    // FIX: Bypass Next.js Image Optimizer to prevent Cloudflare 403 errors on AniList images
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "media.kitsu.app" },
    ],
  },
  experimental: {
    // Keep server action body size modest — watch-order payloads are small JSON
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
