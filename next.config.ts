import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint during `next build` (CI).
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Keep TS type checking (default behavior). If you *also* want to skip TS errors:
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
