import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 외부 이미지 허용을 위한 도메인 설정
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn-lostark.game.onstove.com" },
      { protocol: "https", hostname: "img.lostark.co.kr" },
      { protocol: "https", hostname: "developer-lostark.game.onstove.com" },
    ],
  },
};

export default nextConfig;
