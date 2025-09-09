/* eslint-env node */
const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,

  // If you deploy from /web, this keeps output tracing rooted correctly on Vercel
  outputFileTracingRoot: path.resolve(__dirname),

  // Turn off lint/type *failures* during build (so ESLint errors won't stop deploys)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname),
    };
    return config;
  },
};
