import path from "path";

const nextConfig = {
  // point tracing to the monorepo root (folder that contains /web)
  outputFileTracingRoot: path.join(__dirname, ".."),
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
