import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for @opennextjs/cloudflare — produces self-contained route bundles
  output: "standalone",

  // Cloudflare Workers runtime has no Node.js image optimisation support.
  // Disable to prevent runtime crashes on Cloudflare Pages.
  images: {
    unoptimized: true,
  },

  // next lint is deprecated in 15.5 and the flat-config path is broken.
  // ESLint still runs fine via `npx eslint .` — just skip it during next build.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
