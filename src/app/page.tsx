import Image from "next/image";
import {
  ArrowRight,
  Camera,
  Flame,
  Gift,
  Leaf,
  MapPin,
  UsersRound,
  Utensils,
} from "lucide-react";
import { MenuImage } from "@/components/menu-image";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/layout";
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

const featureCards = [
  {
    title: "참나무 장작",
    description: "입체적인 향과 온도로 고기의 결을 완성합니다.",
    icon: Flame,
  },
  {
    title: "정성의 손길",
    description: "숙성의 균형과 굽는 시간을 섬세하게 맞춥니다.",
    icon: Leaf,
  },
  {
    title: "화심금 재료",
    description: "신선하고 품격 있는 재료를 엄선해 사용합니다.",
    icon: Utensils,
  },
  {
    title: "소중한 시간",
    description: "좋은 사람과 머무는 시간을 깊게 만듭니다.",
    icon: UsersRound,
  },
];

const fallbackFeaturedMenu = [
  {
    id: "fallback-1",
    category: "대표",
    name: "참나무 장작구이 모둠",
    description: "엄선한 숙성육을 장작불 향으로 구워낸 구성",
    price: 68000,
    imageUrl: "/images/menu/1783221304773.png",
  },
  {
    id: "fallback-2",
    category: "인기",
    name: "화목 숙성 꽃갈비살",
    description: "부드러운 식감과 진한 육향을 살린 한 접시",
    price: 42000,
    imageUrl: "/images/menu/1783221304868.png",
  },
  {
    id: "fallback-3",
    category: "추천",
    name: "참나무 통삼겹",
    description: "겉은 바삭하고 속은 촉촉한 장작구이",
    price: 38000,
    imageUrl: "/images/menu/1783221304957.png",
  },
  {
    id: "fallback-4",
    category: "프리미엄",
    name: "한우 안심",
    description: "부드러운 결과 은은한 불향이 조화로운 메뉴",
    price: 55000,
    imageUrl: "/images/menu/1783221305035.png",
  },
];

const fallbackPromotions = [
  {
    id: "promo-1",
    title: "신규 회원 혜택",
    body: "첫 방문을 위한 조용한 혜택을 준비했습니다.",
    href: "/coupons",
    imageUrl: "/images/brand/brand-fire-wall.png",
  },
  {
    id: "promo-2",
    title: "생일 축하 혜택",
    body: "소중한 날의 식사를 더 따뜻하게 만듭니다.",
    href: "/events",
    imageUrl: "/images/brand/brand-storefront.png",
  },
  {
    id: "promo-3",
    title: "화목 데이",
    body: "장작불의 향을 천천히 즐기는 하루입니다.",
    href: "/events",
    imageUrl: "/images/menu/1783221305281.png",
  },
];

const storeCards = [
  {
    id: "bon",
    name: "화목 본점",
    address: "서울 강남구 테헤란로 123",
    phone: "02-1234-5678",
    imageUrl: "/images/brand/brand-storefront.png",
  },
  {
    id: "gangnam",
    name: "화목 강남점",
    address: "서울 서초구 서초대로 456",
    phone: "02-2345-6789",
    imageUrl: "/images/brand/brand-fire-wall.png",
  },
  {
    id: "pangyo",
    name: "화목 판교점",
    address: "경기 성남시 분당구 판교로 789",
    phone: "031-345-6789",
    imageUrl: "/images/brand/brand-sign-collage.jpg",
  },
];

const instagramImages = [
  "/images/menu/1783221305383.png",
  "/images/brand/brand-fire-wall.png",
  "/images/brand/brand-storefront.png",
  "/images/menu/1783221305470.png",
  "/images/menu/1783221305545.png",
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
  const homeMenus = featuredMenu.length > 0 ? featuredMenu.slice(0, 4) : fallbackFeaturedMenu;
  const promotions =
    banners.length > 0
      ? banners.slice(0, 3).map((banner, index) => ({
          id: banner.id,
          title: banner.title,
          body: banner.body,
          href: banner.href ?? "/events",
          imageUrl: fallbackPromotions[index % fallbackPromotions.length].imageUrl,
        }))
      : fallbackPromotions;

  return (
    <main>
      <section className="relative -mt-20 min-h-screen overflow-hidden bg-[var(--hm-background)] text-white">
        <Image
          src="/images/brand/brand-hero-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_center]"
        />
        <div className="absolute inset-0 bg-[rgba(0,0,0,.45)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.86)_0%,rgba(0,0,0,.62)_36%,rgba(0,0,0,.18)_72%,rgba(0,0,0,.42)_100%)]" />
        <Container className="relative flex min-h-screen flex-col pb-6 pt-20">
          <div className="flex flex-1 items-center">
            <div className="hm-hero-shadow w-full max-w-[36rem] py-16 lg:w-[42%]">
              <h1 className="hm-serif text-[42px] font-bold leading-[1.28] tracking-normal text-[var(--hm-primary)] md:text-[56px] lg:text-[68px]">
                참나무 장작의 깊은 향,
                <br />
                화목의 시간
              </h1>
              <p className="mt-7 max-w-md text-base leading-[1.8] text-white/78 sm:text-lg">
                좋은 사람과 함께하는 시간. 정성으로 구워낸 특별한 맛을 전합니다.
              </p>
              <div className="mt-10">
                <ButtonLink href="/menu" className="min-w-36">
                  화목 둘러보기
                  <ArrowRight size={16} aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="bg-[rgba(18,18,18,.75)] shadow-[0_20px_60px_rgba(0,0,0,.22)] backdrop-blur-[12px] hover:-translate-y-1 hover:bg-[#25211c]"
                >
                  <CardContent className="grid min-h-40 justify-items-center p-7 text-center">
                    <Icon className="text-[var(--hm-accent-gold)]" size={34} aria-hidden="true" />
                    <h2 className="mt-5 text-lg font-bold text-[var(--hm-primary)]">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/68">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {activePopup ? (
        <section className="border-y border-[var(--hm-border)] bg-[var(--hm-surface)]">
          <Container className="flex flex-col gap-3 py-4 text-sm text-[var(--hm-subtext)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-[var(--hm-text)]">{activePopup.title}</p>
              <p className="mt-1">{activePopup.body}</p>
            </div>
            {activePopup.href ? (
              <ButtonLink href={activePopup.href} variant="outline">
                자세히
              </ButtonLink>
            ) : null}
          </Container>
        </section>
      ) : null}

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-accent-gold)]">
                ABOUT HWAMOK
              </p>
              <h2 className="hm-serif mt-4 text-3xl font-bold leading-tight text-[var(--hm-primary)] sm:text-4xl">
                화목, 그 특별한 이야기
              </h2>
              <p className="mt-6 max-w-md leading-8 text-[var(--hm-subtext)]">
                화목은 참나무 장작구이를 통해 음식 본연의 맛과 향을 살리고,
                좋은 사람들과 함께하는 소중한 시간을 만들어가는 공간입니다.
              </p>
              <ButtonLink href="/about" variant="ghost" className="mt-7 px-0">
                더 알아보기
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1.25fr_.75fr]">
              <div className="relative min-h-[340px] overflow-hidden rounded-[24px] border border-[var(--hm-border)]">
                <Image
                  src="/images/brand/brand-storefront.png"
                  alt="화목 매장 분위기"
                  fill
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="relative min-h-[340px] overflow-hidden rounded-[24px] border border-[var(--hm-border)]">
                <Image
                  src="/images/brand/brand-fire-wall.png"
                  alt="화목 장작불 공간"
                  fill
                  sizes="(min-width: 1024px) 28vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-y border-[var(--hm-divider)] bg-[rgba(255,255,255,.015)]">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-accent-gold)]">
                SIGNATURE MENU
              </p>
              <h2 className="hm-serif mt-3 text-3xl font-bold text-[var(--hm-primary)] sm:text-4xl">
                화목의 대표 메뉴
              </h2>
            </div>
            <ButtonLink href="/menu" variant="ghost" className="px-0">
              전체 메뉴 보기
              <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {homeMenus.map((item, index) => (
              <Card key={item.id} className="group overflow-hidden hover:-translate-y-1">
                <CardContent className="p-0">
                  <MenuImage src={item.imageUrl} alt={item.name} priority={index === 0} />
                  <div className="grid gap-3 p-5">
                    <Badge tone="neutral">{item.category}</Badge>
                    <h3 className="text-lg font-bold text-[var(--hm-text)]">{item.name}</h3>
                    <p className="min-h-12 text-sm leading-6 text-[var(--hm-subtext)]">
                      {item.description}
                    </p>
                    <p className="font-bold text-[var(--hm-primary)]">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-accent-gold)]">
                PROMOTION
              </p>
              <h2 className="hm-serif mt-3 text-3xl font-bold text-[var(--hm-primary)] sm:text-4xl">
                이벤트 & 쿠폰
              </h2>
            </div>
            <ButtonLink href="/events" variant="ghost" className="px-0">
              전체 보기
              <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {promotions.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:-translate-y-1">
                <CardContent className="grid grid-cols-[112px_1fr] gap-5 p-5">
                  <div className="relative min-h-28 overflow-hidden rounded-[18px] bg-[var(--hm-surface)]">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--hm-primary)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--hm-subtext)]">{item.body}</p>
                    <ButtonLink href={item.href} variant="ghost" className="mt-3 h-auto min-h-0 px-0 py-0">
                      자세히 보기
                      <ArrowRight size={14} aria-hidden="true" />
                    </ButtonLink>
                  </div>
                </CardContent>
              </Card>
            ))}
            {activeCoupon ? (
              <Card className="overflow-hidden border-[rgba(247,230,193,.22)] hover:-translate-y-1">
                <CardContent className="grid grid-cols-[72px_1fr] gap-5 p-5">
                  <div className="grid h-[72px] w-[72px] place-items-center rounded-[18px] bg-[var(--hm-primary)] text-[var(--hm-background)]">
                    <Gift size={28} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--hm-primary)]">{activeCoupon.name}</h3>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {formatCurrency(activeCoupon.amount)}
                    </p>
                    <p className="mt-2 text-sm text-[var(--hm-subtext)]">
                      다운로드 후 {activeCoupon.validityDays}일 사용 가능
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </Container>
      </Section>

      <Section className="border-y border-[var(--hm-divider)] bg-[rgba(255,255,255,.015)]">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-accent-gold)]">
                STORE
              </p>
              <h2 className="hm-serif mt-3 text-3xl font-bold text-[var(--hm-primary)] sm:text-4xl">
                화목 매장 안내
              </h2>
            </div>
            <ButtonLink href="/store" variant="ghost" className="px-0">
              매장 정보 보기
              <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {storeCards.map((store) => (
              <Card key={store.id} className="group overflow-hidden hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/2.5] overflow-hidden">
                    <Image
                      src={store.imageUrl}
                      alt={store.name}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="grid gap-2 p-5">
                    <h3 className="font-bold text-[var(--hm-primary)]">{store.name}</h3>
                    <p className="flex gap-2 text-sm text-[var(--hm-subtext)]">
                      <MapPin size={16} aria-hidden="true" />
                      {store.address}
                    </p>
                    <p className="text-sm text-[var(--hm-subtext)]">{store.phone}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <Camera className="mx-auto text-[var(--hm-accent-gold)]" size={28} aria-hidden="true" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-accent-gold)]">
              INSTAGRAM
            </p>
            <h2 className="hm-serif mt-3 text-2xl font-bold text-[var(--hm-primary)]">
              화목의 일상을 만나보세요
            </h2>
          </div>
          <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {instagramImages.map((src, index) => (
              <div
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-[18px] border border-[var(--hm-border)] bg-[var(--hm-card)]"
              >
                <Image
                  src={src}
                  alt={`화목 이미지 ${index + 1}`}
                  fill
                  sizes="(min-width: 768px) 20vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <ButtonLink href="/events" variant="secondary">
              인스타그램 더보기
              <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </main>
  );
}
