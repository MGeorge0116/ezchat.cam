import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Do NOT set experimental.appDir: false
  // No basePath here unless you really intend to host under a subpath.
};

export default nextConfig;
