import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 모바일 최적화: 이미지 최적화
  images: {
    formats: ["image/webp"],
  },
  // 환경변수 공개 목록
  env: {
    NEXT_PUBLIC_APP_NAME: "실버케어",
  },
};

export default nextConfig;
