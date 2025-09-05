// next.config.ts
import path from "path";

const nextConfig = {
  // ✅ must be top-level (not under experimental)
  outputFileTracingRoot: path.join(__dirname, ".."),

  // Don’t fail builds just because ESLint isn’t installed
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
