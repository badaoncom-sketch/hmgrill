import { getSiteUrl } from "@/lib/seo";
import { siteContact } from "@/lib/navigation";
import type { SiteSettings } from "@/lib/site-settings";

// 검색엔진에 음식점 정보를 구조화해 전달한다 (리치 결과 노출용 Restaurant 스키마).
export function RestaurantStructuredData({ settings }: { settings: SiteSettings }) {
  const base = getSiteUrl();
  const ogImage = settings["seo.site.og_image"];

  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "화목",
    alternateName: "HWAMOK",
    description: settings["seo.site.description"],
    url: base,
    image: ogImage.startsWith("http") ? ogImage : `${base}${ogImage}`,
    telephone: siteContact.phoneDisplay,
    email: siteContact.email,
    servesCuisine: ["한식", "구이"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "온천천로 447-2",
      addressLocality: "동래구",
      addressRegion: "부산광역시",
      postalCode: siteContact.postalCode,
      addressCountry: "KR",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "22:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "11:00",
        closes: "22:00",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
