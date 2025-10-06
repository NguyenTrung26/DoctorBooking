import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "your-supabase-project.supabase.co", // nếu ảnh bác sĩ lưu ở Supabase Storage
      },
    ],
  },
};

export default nextConfig;
