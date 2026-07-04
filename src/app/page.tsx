import { ArrowRight, ScanLine, ShieldCheck, Ticket } from "lucide-react";
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

const operations = [
  {
    title: "회원",
    description: "이메일 인증 후 쿠폰을 다운로드하고 내 쿠폰을 확인합니다.",
    icon: ShieldCheck,
  },
  {
    title: "직원",
    description: "계산대 태블릿에서 QR을 스캔하고 사용완료 처리합니다.",
    icon: ScanLine,
  },
  {
    title: "관리자",
    description: "쿠폰 발행, 수량, 사용내역, 통계를 관리합니다.",
    icon: Ticket,
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
      {activePopup ? (
        <section className="border-b border-red-100 bg-red-50">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 text-sm text-red-950 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="font-bold">{activePopup.title}</p>
              <p className="mt-1 text-red-800">{activePopup.body}</p>
            </div>
            {activePopup.href ? (
              <ButtonLink href={activePopup.href} variant="outline">
                보기
              </ButtonLink>
            ) : null}
          </div>
        </section>
      ) : null}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
              HM GRILL COUPON SYSTEM
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal text-neutral-950 sm:text-5xl">
              화목 공식 홈페이지와 QR 쿠폰 운영 시스템
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
              회원은 쿠폰을 쉽게 다운로드하고, 직원은 계산대 태블릿에서
              QR을 빠르게 처리하며, 관리자는 발행부터 통계까지 한 화면에서
              관리합니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/coupons">
                쿠폰 확인
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/staff" variant="outline">
                직원모드
              </ButtonLink>
            </div>
          </div>
          <div className="grid content-start gap-4">
            {activeCoupon ? (
              <Card className="border-red-200">
                <CardContent>
                  <p className="text-sm font-semibold text-red-700">
                    현재 발행중 쿠폰
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-neutral-950">
                    {activeCoupon.name}
                  </h2>
                  <p className="mt-2 text-3xl font-bold text-red-700">
                    {formatCurrency(activeCoupon.amount)}
                  </p>
                  <p className="mt-4 text-sm text-neutral-600">
                    다운로드 후 {activeCoupon.validityDays}일 사용 가능
                  </p>
                </CardContent>
              </Card>
            ) : null}
            <div className="grid grid-cols-3 gap-3">
              {operations.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title}>
                    <CardContent className="grid gap-3 p-4">
                      <Icon className="text-red-700" size={24} aria-hidden="true" />
                      <p className="font-semibold text-neutral-950">{item.title}</p>
                      <p className="text-xs leading-5 text-neutral-500">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {banners.map((banner) => (
              <Card key={banner.id}>
                <CardContent>
                  <p className="text-sm font-semibold text-red-700">
                    운영 배너
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-neutral-950">
                    {banner.title}
                  </h2>
                  <p className="mt-2 text-sm text-neutral-600">{banner.body}</p>
                  {banner.href ? (
                    <ButtonLink href={banner.href} className="mt-4" variant="ghost">
                      자세히
                      <ArrowRight size={16} aria-hidden="true" />
                    </ButtonLink>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
              MENU
            </p>
            <h2 className="mt-2 text-3xl font-bold text-neutral-950">
              대표 메뉴
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
              <CardContent>
                <p className="text-sm font-semibold text-red-700">
                  {item.category}
                </p>
                <h3 className="mt-2 text-xl font-bold text-neutral-950">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  {item.description}
                </p>
                <p className="mt-4 font-semibold text-neutral-950">
                  {formatCurrency(item.price)}
                </p>
              </CardContent>
            </Card>
          ))}
          {featuredMenu.length === 0 ? (
            <Card>
              <CardContent>
                <p className="text-sm font-semibold text-neutral-600">
                  대표 메뉴가 준비 중입니다.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </main>
  );
}
