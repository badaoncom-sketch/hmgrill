import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      // 메뉴 이미지 업로드(파일 폼)를 위해 기본 1MB 제한을 늘린다.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
