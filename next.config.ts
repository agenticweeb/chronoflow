import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
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
