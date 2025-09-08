/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don’t fail production builds on ESLint errors
  eslint: { ignoreDuringBuilds: true },
  // If you also want to ignore TS type errors (not recommended), uncomment:
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
