import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  // output: 'export',
  images: {
    domains: [
      'homy-next.vercel.app',
      // add other allowed domains here if needed
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

/** @type {import('next').NextConfig} */
// const nextConfig = {
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   trailingSlash: true,
//   output: 'export',
//   basePath: '/lokalmegleren',
//   assetPrefix: '/lokalmegleren/',
//   images: {
//     unoptimized: true, // Required for static export when using Next.js Image component
//     path: "/lokalmegleren",
//     domains: [
//       'homy-next.vercel.app',
//       // add other allowed domains here if needed
//     ],
//   },
//   eslint: {
//     // Warning: This allows production builds to successfully complete even if
//     // your project has ESLint errors.
//     ignoreDuringBuilds: true,
//   },
// };

export default nextConfig;
