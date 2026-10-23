import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8001";
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*/` }];
  },
};

export default nextConfig;
