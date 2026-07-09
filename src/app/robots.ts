import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

// 개인 영역·운영 화면은 크롤링에서 제외하고, 공개 콘텐츠에 크롤 예산을 집중한다.
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/mypage",
          "/notifications",
          "/coupons/my",
          "/coupons/history",
          "/qr-coupon",
          "/staff",
          "/auth/",
          "/login",
          "/signup",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
