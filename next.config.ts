import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Bỏ qua lỗi ESLint khi build trên Render
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Bỏ qua lỗi TypeScript khi build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
