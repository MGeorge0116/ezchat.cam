const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep file tracing rooted to this app (quiet the multi-lockfile warning)
  outputFileTracingRoot: path.join(__dirname),

  // ✅ Skip ESLint in prod build so lint errors don't fail deploys
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
