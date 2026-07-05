import Image from "next/image";
import { ArrowRight, Flame, Leaf, Utensils, Wind } from "lucide-react";
import { MenuImage } from "@/components/menu-image";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  mapMenuItem,
  mapSiteBanner,
  mapSitePopup,
  menuItemSelect,
  siteBannerSelect,
  sitePopupSelect,
} from "@/lib/content/db";
import { couponIssueSelect, mapCouponIssue } from "@/lib/coupons/db";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

const brandValues = [
  {
    title: "참나무 장작",
    description: "100% 참나무 사용",
    icon: Flame,
  },
  {
    title: "좋은 재료",
    description: "엄선한 신선한 재료",
    icon: Leaf,
  },
  {
    title: "전통 방식",
    description: "정직한 숙성의 기술",
    icon: Utensils,
  },
  {
    title: "쾌적한 공간",
    description: "최적의 연기 시스템",
    icon: Wind,
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: menuRows }, { data: couponRows }, { data: bannerRows }, { data: popupRows }] =
    await Promise.all([
      supabase
        .from("menu_items")
        .select(menuItemSelect)
        .eq("featured", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("coupon_issues")
        .select(couponIssueSelect)
        .eq("status", "issuing")
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("site_banners")
        .select(siteBannerSelect)
        .eq("placement", "home")
        .order("sort_order", { ascending: true }),
      supabase
        .from("site_popups")
        .select(sitePopupSelect)
        .order("sort_order", { ascending: true })
        .limit(1),
    ]);
  const featuredMenu = (menuRows ?? []).map(mapMenuItem);
  const activeCoupon = (couponRows ?? []).map(mapCouponIssue)[0];
  const banners = (bannerRows ?? []).map(mapSiteBanner);
  const activePopup = (popupRows ?? []).map(mapSitePopup)[0];

  return (
    <main>
      <section className="relative -mt-20 min-h-screen overflow-hidden bg-[var(--hm-background)] text-white">
        <Image
          src="/images/brand/brand-hero-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[63%_center]"
        />
        <div className="absolute inset-0 bg-[rgba(0,0,0,.45)]" />
        <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 pb-6 pt-20 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center">
            <div className="hm-hero-shadow w-full max-w-[40rem] lg:w-[40%]">
              <div className="relative h-44 w-72 sm:h-52 sm:w-80 lg:h-60 lg:w-[23rem]">
                <Image
                  src="/images/brand/brand-logo-transparent.png"
                  alt="화목 참나무 장작구이"
                  fill
                  priority
                  sizes="(min-width: 1024px) 368px, 320px"
                  className="object-contain object-left drop-shadow-[0_18px_42px_rgba(0,0,0,0.65)]"
                />
              </div>
              <h1 className="hm-serif mt-5 text-[40px] font-bold leading-[1.22] tracking-normal text-[var(--hm-primary)] md:text-[52px] lg:text-[64px]">
                고기의 맛은
                <br />
                불에서 결정된다
              </h1>
              <p className="mt-6 max-w-md text-base leading-[1.8] text-white/80 sm:text-lg">
                좋은 재료, 참나무 장작, 그리고 정성. 화목은 장작불의 온도와
                은은한 연기로 깊은 풍미를 완성합니다.
              </p>
              <div className="mt-9 flex">
                <ButtonLink href="/menu">
                  대표 메뉴 보기
                  <ArrowRight size={16} aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>
          </div>
          <div className="grid overflow-hidden rounded-[20px] border border-[rgba(255,255,255,.08)] bg-[rgba(18,18,18,.75)] shadow-[var(--hm-shadow)] backdrop-blur-[12px] sm:grid-cols-2 lg:ml-auto lg:w-[52rem] lg:grid-cols-4">
            {brandValues.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-8 transition duration-200 hover:bg-white/[0.03] hover:opacity-95 sm:border-r sm:border-[rgba(255,255,255,.08)] sm:even:border-r-0 lg:border-r lg:last:border-r-0"
                >
                  <Icon className="text-[var(--hm-primary)]" size={34} aria-hidden="true" />
                  <p className="mt-5 font-semibold text-[var(--hm-primary)]">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {activePopup ? (
        <section className="border-y border-[var(--hm-border)] bg-[var(--hm-surface)]">
          <div className="hm-container flex flex-col gap-2 py-4 text-sm text-[var(--hm-subtext)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-[var(--hm-text)]">{activePopup.title}</p>
              <p className="mt-1">{activePopup.body}</p>
            </div>
            {activePopup.href ? (
              <ButtonLink href={activePopup.href} variant="outline">
                보기
              </ButtonLink>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="hm-container py-[120px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--hm-accent-gold)]">
              MENU
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-normal text-[var(--hm-text)]">
              불맛을 중심에 둔 대표 메뉴
            </h2>
          </div>
          <ButtonLink href="/menu" variant="ghost">
            전체메뉴 보기
            <ArrowRight size={16} aria-hidden="true" />
          </ButtonLink>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {featuredMenu.map((item) => (
            <Card key={item.id}>
              <CardContent className="grid gap-4">
                <MenuImage src={item.imageUrl} alt={item.name} />
                <p className="text-sm font-semibold text-[var(--hm-accent-gold)]">
                  {item.category}
                </p>
                <h3 className="text-xl font-bold text-[var(--hm-text)]">{item.name}</h3>
                <p className="text-sm leading-6 text-[var(--hm-subtext)]">
                  {item.description}
                </p>
                <p className="font-semibold text-[var(--hm-text)]">
                  {formatCurrency(item.price)}
                </p>
              </CardContent>
            </Card>
          ))}
          {featuredMenu.length === 0 ? (
            <Card>
              <CardContent>
                <p className="text-sm font-semibold text-[var(--hm-subtext)]">
                  대표 메뉴가 준비 중입니다.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
      <section className="border-t border-[var(--hm-border)] bg-[var(--hm-surface)] text-[var(--hm-primary)]">
        <div className="hm-container grid gap-8 py-[120px] lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--hm-accent-gold)]">
              Brand Experience
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal">
              화목은 불을 연구합니다
            </h2>
            <p className="mt-4 leading-7 text-[var(--hm-subtext)]">
              장작불의 빛, 검은 간판, 금빛 로고, 따뜻한 실내 조명은 하나의
              경험으로 이어집니다. 쿠폰은 방문 혜택으로 조용히 돕고, 첫인상은
              브랜드의 깊이로 남깁니다.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-card)] p-6"
              >
                <p className="text-sm font-semibold text-[var(--hm-accent-gold)]">소식</p>
                <h3 className="mt-2 text-xl font-bold">{banner.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--hm-subtext)]">
                  {banner.body}
                </p>
                {banner.href ? (
                  <ButtonLink href={banner.href} className="mt-4" variant="outline">
                    자세히
                    <ArrowRight size={16} aria-hidden="true" />
                  </ButtonLink>
                ) : null}
              </div>
            ))}
            {activeCoupon ? (
              <div className="rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-card)] p-6">
                <p className="text-sm font-semibold text-[var(--hm-accent-gold)]">방문 혜택</p>
                <h3 className="mt-2 text-xl font-bold">{activeCoupon.name}</h3>
                <p className="mt-2 text-2xl font-bold text-white">
                  {formatCurrency(activeCoupon.amount)}
                </p>
                <p className="mt-3 text-sm text-[var(--hm-subtext)]">
                  다운로드 후 {activeCoupon.validityDays}일 사용 가능
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
