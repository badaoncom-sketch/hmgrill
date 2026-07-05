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
      <section className="relative min-h-[calc(100svh-105px)] overflow-hidden bg-[#0d0d0d] text-white md:min-h-[calc(100svh-81px)]">
        <Image
          src="/images/brand/brand-hero-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[64%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050403f7] via-[#050403b8] to-[#0504031f]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_52%,rgba(224,106,42,0.18),transparent_34rem)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0d0d0d] to-transparent" />
        <div className="relative mx-auto flex min-h-[calc(100svh-105px)] max-w-7xl flex-col justify-end px-4 pb-10 pt-14 sm:px-6 md:min-h-[calc(100svh-81px)] lg:px-8">
          <div className="hm-hero-shadow w-full max-w-[42rem] lg:w-[39%]">
            <p className="text-sm font-semibold tracking-[0.18em] text-[#f7e6c1]">
              참나무 장작구이 전문점
            </p>
            <h1 className="hm-serif mt-7 text-4xl font-semibold leading-[1.22] tracking-normal text-[#f7e6c1] sm:text-5xl lg:text-6xl">
              고기의 맛은
              <br />
              불에서 결정된다
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#faf7f2cc] sm:text-lg">
              좋은 재료, 참나무 장작, 그리고 정성. 화목은 장작불의 온도와
              은은한 연기로 깊은 풍미를 완성합니다.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/menu" className="border border-[#b8281e]">
                대표 메뉴 보기
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                href="/about"
                variant="outline"
                className="border-[#f7e6c166] bg-[#0d0d0d4d] text-[#f7e6c1] backdrop-blur hover:border-[#f7e6c1] hover:bg-[#f7e6c114] hover:text-white"
              >
                브랜드 소개
              </ButtonLink>
            </div>
          </div>
          <div className="mt-12 grid overflow-hidden rounded-md border border-[#f7e6c11f] bg-[#0d0d0dcc] shadow-2xl shadow-black/35 backdrop-blur-md sm:grid-cols-2 lg:ml-auto lg:w-[66%] lg:grid-cols-4">
            {brandValues.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="border-b border-[#f7e6c11f] p-5 last:border-b-0 sm:odd:border-r sm:even:border-r-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
                >
                  <Icon className="text-[#f7e6c1]" size={30} aria-hidden="true" />
                  <p className="mt-4 font-semibold text-[#f7e6c1]">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#f7e6c199]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {activePopup ? (
        <section className="border-b border-[#b13a1e26] bg-[#fff5e6]">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 text-sm text-[#5b281a] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="font-bold">{activePopup.title}</p>
              <p className="mt-1 text-[#7a4b33]">{activePopup.body}</p>
            </div>
            {activePopup.href ? (
              <ButtonLink href={activePopup.href} variant="outline">
                보기
              </ButtonLink>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#B13A1E]">
              MENU
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-normal text-[#17130f]">
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
                <p className="text-sm font-semibold text-[#B13A1E]">
                  {item.category}
                </p>
                <h3 className="text-xl font-bold text-[#17130f]">{item.name}</h3>
                <p className="text-sm leading-6 text-[#5f554a]">
                  {item.description}
                </p>
                <p className="font-semibold text-[#17130f]">
                  {formatCurrency(item.price)}
                </p>
              </CardContent>
            </Card>
          ))}
          {featuredMenu.length === 0 ? (
            <Card>
              <CardContent>
                <p className="text-sm font-semibold text-[#5f554a]">
                  대표 메뉴가 준비 중입니다.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
      <section className="bg-[#17130f] text-[#f7e6c1]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#e9b66e]">
              Brand Experience
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal">
              화목은 불을 연구합니다
            </h2>
            <p className="mt-4 leading-7 text-[#f7e6c1b3]">
              장작불의 빛, 검은 간판, 금빛 로고, 따뜻한 실내 조명은 하나의
              경험으로 이어집니다. 쿠폰은 방문 혜택으로 조용히 돕고, 첫인상은
              전문점의 깊이로 남깁니다.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="rounded-md border border-[#f7e6c126] bg-[#f7e6c10f] p-5"
              >
                <p className="text-sm font-semibold text-[#e9b66e]">소식</p>
                <h3 className="mt-2 text-xl font-bold">{banner.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#f7e6c1a6]">
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
              <div className="rounded-md border border-[#f7e6c126] bg-[#f7e6c10f] p-5">
                <p className="text-sm font-semibold text-[#e9b66e]">방문 혜택</p>
                <h3 className="mt-2 text-xl font-bold">{activeCoupon.name}</h3>
                <p className="mt-2 text-2xl font-bold text-white">
                  {formatCurrency(activeCoupon.amount)}
                </p>
                <p className="mt-3 text-sm text-[#f7e6c1a6]">
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
