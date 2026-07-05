import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Clock,
  Flame,
  Gift,
  Leaf,
  MapPin,
  Phone,
  UsersRound,
  Utensils,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";
import {
  mapMenuItem,
  mapSiteBanner,
  menuItemSelect,
  siteBannerSelect,
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
    title: "최상급 재료",
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

const storeInfo = {
  name: "화목 본점",
  address: "서울 강남구 테헤란로 123",
  phone: "02-1234-5678",
  hours: ["평일 10:00 - 22:00", "주말/공휴일 11:00 - 22:00"],
  imageUrl: "/images/brand/brand-storefront.png",
};

const instagramImages = [
  "/images/menu/1783221305383.png",
  "/images/brand/brand-fire-wall.png",
  "/images/brand/brand-storefront.png",
  "/images/menu/1783221305470.png",
  "/images/menu/1783221305545.png",
  "/images/menu/1783221305205.png",
  "/images/brand/brand-sign-collage.jpg",
  "/images/menu/1783221305136.png",
];

type HomeMenuCardItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
};

type HomePromotionCardItem = {
  id: string;
  title: string;
  body: string;
  href: string;
  imageUrl: string;
};

type HomeStoreInfo = typeof storeInfo;

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: menuRows }, { data: couponRows }, { data: bannerRows }] =
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
    ]);

  const featuredMenu = (menuRows ?? []).map(mapMenuItem);
  const activeCoupon = (couponRows ?? []).map(mapCouponIssue)[0];
  const banners = (bannerRows ?? []).map(mapSiteBanner);
  const homeMenus = featuredMenu.length > 0 ? featuredMenu.slice(0, 4) : fallbackFeaturedMenu;
  const cmsPromotions =
    banners.length > 0
      ? banners.map((banner, index) => ({
          id: banner.id,
          title: banner.title,
          body: banner.body,
          href: banner.href ?? "/events",
          imageUrl: fallbackPromotions[index % fallbackPromotions.length].imageUrl,
        }))
      : [];
  const promotions = [
    ...cmsPromotions,
    ...fallbackPromotions.filter(
      (fallback) => !cmsPromotions.some((item) => item.title === fallback.title),
    ),
  ].slice(0, 3);
  const promotionCards = activeCoupon ? promotions.slice(0, 2) : promotions.slice(0, 3);

  return (
    <main>
      <TabletHome homeMenus={homeMenus} promotions={promotions} storeInfo={storeInfo} />

      <div className="md:hidden xl:block">
      <section className="relative -mt-20 min-h-screen overflow-hidden bg-[var(--hm-background)] text-white lg:min-h-[860px]">
        <Image
          src="/images/brand/brand-hero-mobile.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[1.1] saturate-[1.05] md:hidden"
        />
        <Image
          src="/images/brand/brand-hero-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hm-hero-image hidden object-cover md:block"
        />
        <div className="hm-hero-overlay absolute inset-0" />
        <div className="hm-hero-gradient absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(180deg,transparent,rgba(13,13,13,.82)_72%,#0d0d0d)]" />
        <Container className="relative flex min-h-screen flex-col pb-[108px] pt-20 sm:pb-10 lg:min-h-[860px]">
          <div className="flex flex-1 items-start pt-24 sm:items-center sm:pt-4">
            <div className="hm-hero-shadow hm-reveal w-full max-w-[48rem] py-8 sm:py-16 lg:w-[54%]">
              <h1 className="hm-display-title">
                <span className="hidden whitespace-nowrap xl:block">참나무 장작의 깊은 향,</span>
                <span className="block xl:hidden">
                  참나무 장작의
                  <br />
                  깊은 향,
                </span>
                <span className="block">화목의 시간</span>
              </h1>
              <p className="hm-body-lg mt-8 max-w-[29rem] text-white/74">
                좋은 사람과 함께하는 시간.
                <br />
                정성으로 구워낸 특별한 맛을 전합니다.
              </p>
              <div className="mt-12">
                <ButtonLink href="/menu" className="min-h-14 rounded-[14px] px-7 py-4 text-[15px] font-bold">
                  화목 둘러보기
                  <ArrowRight size={17} aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {featureCards.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="hm-card-hover rounded-[16px] border border-[var(--hm-border)] bg-[rgba(18,18,18,.78)] p-3 text-center shadow-[0_24px_70px_rgba(0,0,0,.3)] sm:rounded-[20px] sm:p-8"
                >
                  <Icon className="mx-auto h-7 w-7 text-[var(--hm-accent-gold)] sm:h-[42px] sm:w-[42px]" aria-hidden="true" />
                  <h2 className="mt-3 whitespace-nowrap text-[11px] font-bold leading-tight text-[var(--hm-text)] sm:mt-6 sm:whitespace-normal sm:text-[var(--hm-type-card-title)] sm:leading-[1.38]">
                    {item.title}
                  </h2>
                  <p className="hm-caption mt-3 hidden text-white/60 sm:block">{item.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <Section className="hm-section-band">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[0.48fr_0.52fr] lg:items-center">
            <div className="hm-reveal">
              <p className="hm-eyebrow">
                ABOUT HWAMOK
              </p>
              <h2 className="hm-section-title mt-5 sm:whitespace-nowrap">
                화목, 그 특별한 이야기
              </h2>
              <p className="hm-body mt-7 max-w-md text-[var(--hm-subtext)]">
                화목은 참나무 장작구이를 통해 음식 본연의 맛과 향을 살리고,
                좋은 사람들과 함께하는 소중한 시간을 만들어가는 공간입니다.
              </p>
              <ButtonLink href="/about" variant="ghost" className="mt-8 px-0 text-[15px] font-bold text-[var(--hm-primary)]">
                더 알아보기
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
            </div>
            <div className="grid gap-5 sm:grid-cols-[1.3fr_.7fr]">
              <div className="hm-image-zoom relative min-h-[460px] overflow-hidden rounded-[24px] border border-[var(--hm-border)] shadow-[var(--hm-shadow-strong)]">
                <Image
                  src="/images/brand/brand-storefront.png"
                  alt="화목 매장 분위기"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.38))]" />
              </div>
              <div className="hm-image-zoom relative min-h-[460px] overflow-hidden rounded-[24px] border border-[var(--hm-border)] shadow-[var(--hm-shadow)]">
                <Image
                  src="/images/brand/brand-fire-wall.png"
                  alt="화목 장작불 공간"
                  fill
                  sizes="(min-width: 1024px) 24vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.34))]" />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="hm-section-deep hm-section-separator">
        <Container>
          <SectionHeader
            eyebrow="SIGNATURE MENU"
            title="화목의 대표 메뉴"
            href="/menu"
            linkLabel="전체 메뉴 보기"
          />
          <div className="mt-16 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {homeMenus.map((item, index) => (
              <article
                key={item.id}
                className="hm-card-hover group overflow-hidden rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)]"
              >
                <div className="hm-image-zoom relative aspect-[4/3] overflow-hidden bg-[var(--hm-card)]">
                  <Image
                    src={item.imageUrl ?? "/images/menu/1783221304773.png"}
                    alt={item.name}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1280px) 280px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="grid gap-3 p-6">
                  <Badge tone="neutral" className="w-fit">{item.category}</Badge>
                  <h3 className="hm-card-title">{item.name}</h3>
                  <p className="hm-caption min-h-14 text-[var(--hm-subtext)]">
                    {item.description}
                  </p>
                  <p className="pt-1 text-[19px] font-bold leading-none text-[var(--hm-primary)]">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="hm-section-band">
        <Container>
          <SectionHeader
            eyebrow="PROMOTION"
            title="이벤트 & 쿠폰"
            href="/events"
            linkLabel="전체 보기"
          />
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {promotionCards.map((item) => (
              <article
                key={item.id}
                className="hm-card-hover group overflow-hidden rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)]"
              >
                <div className="hm-image-zoom relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.48))]" />
                </div>
                <div className="p-7">
                  <h3 className="hm-card-title text-[var(--hm-primary)]">{item.title}</h3>
                  <p className="hm-caption mt-3 min-h-14 text-[var(--hm-subtext)]">{item.body}</p>
                  <ButtonLink href={item.href} variant="ghost" className="mt-5 h-auto min-h-0 px-0 py-0 text-[15px] font-bold text-[var(--hm-primary)]">
                    자세히 보기
                    <ArrowRight size={14} aria-hidden="true" />
                  </ButtonLink>
                </div>
              </article>
            ))}
            {activeCoupon ? (
              <article className="hm-card-hover group overflow-hidden rounded-[20px] border border-[rgba(247,230,193,.22)] bg-[var(--hm-surface)]">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src="/images/brand/brand-fire-wall.png"
                    alt={activeCoupon.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.72))]" />
                  <div className="absolute left-6 top-6 grid h-14 w-14 place-items-center rounded-[18px] bg-[var(--hm-primary)] text-[var(--hm-background)]">
                    <Gift size={26} aria-hidden="true" />
                  </div>
                </div>
                <div className="p-7">
                  <h3 className="hm-card-title text-[var(--hm-primary)]">{activeCoupon.name}</h3>
                  <p className="mt-3 text-[30px] font-bold leading-tight text-white">
                    {formatCurrency(activeCoupon.amount)}
                  </p>
                  <p className="hm-caption mt-4 text-[var(--hm-subtext)]">
                    다운로드 후 {activeCoupon.validityDays}일 사용 가능
                  </p>
                  <ButtonLink href="/coupons" variant="ghost" className="mt-5 h-auto min-h-0 px-0 py-0 text-[15px] font-bold text-[var(--hm-primary)]">
                    쿠폰 보기
                    <ArrowRight size={14} aria-hidden="true" />
                  </ButtonLink>
                </div>
              </article>
            ) : null}
          </div>
        </Container>
      </Section>

      <Section className="hm-section-deep hm-section-separator">
        <Container>
          <SectionHeader
            eyebrow="STORE"
            title="화목 매장 안내"
            href="/store"
            linkLabel="매장 정보 보기"
          />
          <div className="mt-16 grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-stretch">
            <div className="hm-image-zoom relative min-h-[500px] overflow-hidden rounded-[24px] border border-[var(--hm-border)] bg-[var(--hm-card)] shadow-[var(--hm-shadow-strong)]">
              <Image
                src={storeInfo.imageUrl}
                alt={`${storeInfo.name} 공간`}
                fill
                sizes="(min-width: 1024px) 62vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.42))]" />
            </div>
            <article className="flex flex-col justify-between rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-8 shadow-[var(--hm-shadow)]">
              <div>
                <p className="hm-eyebrow">MAIN STORE</p>
                <h3 className="hm-subsection-title mt-5">{storeInfo.name}</h3>
                <p className="hm-body mt-5 text-[var(--hm-subtext)]">
                  장작불의 온기와 차분한 조명을 중심으로 설계한 화목의 대표 공간입니다.
                </p>
              </div>
              <div className="mt-10 grid gap-5">
                <div className="flex gap-3 text-[var(--hm-subtext)]">
                  <MapPin className="mt-1 shrink-0 text-[var(--hm-accent-gold)]" size={18} aria-hidden="true" />
                  <p className="hm-caption">{storeInfo.address}</p>
                </div>
                <div className="flex gap-3 text-[var(--hm-subtext)]">
                  <Phone className="mt-1 shrink-0 text-[var(--hm-accent-gold)]" size={18} aria-hidden="true" />
                  <p className="hm-caption">{storeInfo.phone}</p>
                </div>
                <div className="flex gap-3 text-[var(--hm-subtext)]">
                  <Clock className="mt-1 shrink-0 text-[var(--hm-accent-gold)]" size={18} aria-hidden="true" />
                  <div className="grid gap-1">
                    {storeInfo.hours.map((hour) => (
                      <p key={hour} className="hm-caption">{hour}</p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <ButtonLink href="/store">오시는 길</ButtonLink>
                <ButtonLink href="/support" variant="outline">문의하기</ButtonLink>
              </div>
            </article>
          </div>
        </Container>
      </Section>

      <Section className="hm-section-band">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <Camera className="mx-auto text-[var(--hm-accent-gold)]" size={30} aria-hidden="true" />
            <p className="hm-eyebrow mt-4">
              INSTAGRAM
            </p>
            <h2 className="hm-section-title mt-4">
              화목의 일상을 만나보세요
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {instagramImages.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="hm-image-zoom group relative aspect-[4/3] overflow-hidden rounded-[18px] border border-[var(--hm-border)] bg-[var(--hm-card)]"
              >
                <Image
                  src={src}
                  alt={`화목 이미지 ${index + 1}`}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/28" />
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href="/events" variant="secondary" className="px-7">
              인스타그램 더보기
              <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </div>
        </Container>
      </Section>
      </div>
    </main>
  );
}

function TabletHome({
  homeMenus,
  promotions,
  storeInfo,
}: {
  homeMenus: HomeMenuCardItem[];
  promotions: HomePromotionCardItem[];
  storeInfo: HomeStoreInfo;
}) {
  const tabletMenus = homeMenus.slice(0, 4);
  const tabletPromotions = promotions.slice(0, 3);
  const tabletInstagram = instagramImages.slice(0, 4);

  return (
    <div className="hidden min-h-[calc(100svh-80px)] bg-[var(--hm-background)] px-3 pb-[94px] pt-3 md:block xl:hidden">
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-2">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]">
            <article className="hm-tablet-panel relative h-[360px] overflow-hidden">
              <Image
                src="/images/brand/brand-hero-background.png"
                alt=""
                fill
                priority
                sizes="55vw"
                className="object-cover object-[72%_center]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.86),rgba(0,0,0,.38)_72%,rgba(0,0,0,.12))]" />
              <div className="relative flex h-full flex-col justify-center p-8">
                <h1 className="hm-serif text-[clamp(34px,3.6vw,44px)] font-bold leading-[1.28] text-[var(--hm-primary)]">
                  <span className="block whitespace-nowrap">참나무 장작의</span>
                  <span className="block whitespace-nowrap">깊은 향,</span>
                  <span className="block whitespace-nowrap">화목의 시간</span>
                </h1>
                <p className="mt-7 text-[15px] font-semibold leading-7 text-white/72">
                  좋은 사람과 함께하는 시간,
                  <br />
                  정성으로 구워낸 특별한 맛을 전합니다.
                </p>
                <ButtonLink href="/menu" className="mt-8 w-fit min-h-11 px-5 text-[13px] font-bold">
                  화목 둘러보기
                  <ArrowRight size={14} aria-hidden="true" />
                </ButtonLink>
              </div>
            </article>

            <article className="hm-tablet-panel h-[360px] overflow-hidden p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="hm-serif text-[22px] font-bold text-[var(--hm-primary)]">화목의 대표 메뉴</h2>
                <ButtonLink href="/menu" variant="ghost" className="h-auto min-h-0 px-0 py-0 text-[12px] font-bold">
                  전체 메뉴 보기
                  <ArrowRight size={13} aria-hidden="true" />
                </ButtonLink>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {tabletMenus.slice(0, 3).map((item, index) => (
                  <TabletMenuCard key={item.id} item={item} priority={index === 0} />
                ))}
                {tabletMenus[3] ? <TabletMenuCard item={tabletMenus[3]} /> : null}
                <div className="grid min-h-[126px] place-items-center rounded-[14px] border border-[var(--hm-border)] bg-[rgba(255,255,255,.025)] p-4 text-center text-[12px] font-semibold leading-5 text-white/42">
                  더 많은 메뉴를
                  <br />
                  준비 중입니다.
                </div>
              </div>
            </article>
          </div>

          <div className="grid gap-2 lg:grid-cols-[1fr_1fr]">
            <article className="hm-tablet-panel h-[178px] overflow-hidden p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="hm-eyebrow">ABOUT HWAMOK</p>
                  <h2 className="hm-serif mt-2 text-[20px] font-bold text-[var(--hm-primary)]">화목, 그 특별한 이야기</h2>
                </div>
                <ButtonLink href="/about" variant="ghost" className="h-auto min-h-0 px-0 py-0 text-[12px] font-bold">
                  더 알아보기
                  <ArrowRight size={13} aria-hidden="true" />
                </ButtonLink>
              </div>
              <div className="relative h-[74px] overflow-hidden rounded-[14px] border border-[var(--hm-border)]">
                <Image
                  src="/images/brand/brand-storefront.png"
                  alt="화목 공간"
                  fill
                  sizes="45vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 line-clamp-2 text-[12px] font-medium leading-5 text-white/68">
                화목은 참나무 장작구이를 통해 음식 본연의 맛과 향을 살리고,
                좋은 사람들과 함께하는 소중한 시간을 만들어가는 공간입니다.
              </p>
            </article>

            <article className="hm-tablet-panel h-[178px] overflow-hidden p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="hm-serif text-[20px] font-bold text-[var(--hm-primary)]">이벤트 & 쿠폰</h2>
                <ButtonLink href="/events" variant="ghost" className="h-auto min-h-0 px-0 py-0 text-[12px] font-bold">
                  전체 보기
                  <ArrowRight size={13} aria-hidden="true" />
                </ButtonLink>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {tabletPromotions.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="hm-card-hover overflow-hidden rounded-[14px] border border-[var(--hm-border)] bg-[rgba(255,255,255,.035)]"
                  >
                    <div className="relative aspect-square">
                      <Image src={item.imageUrl} alt={item.title} fill sizes="16vw" className="object-cover" />
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-2 text-[13px] font-bold leading-5 text-white">{item.title}</h3>
                      <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-5 text-white/55">{item.body}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--hm-primary)]">
                        자세히 보기 <ArrowRight size={11} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </article>
          </div>
        </section>

        <aside className="grid gap-2">
          <article className="hm-tablet-panel h-[416px] overflow-hidden p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="hm-serif text-[24px] font-bold text-[var(--hm-primary)]">매장 안내</h2>
              <ButtonLink href="/store" variant="ghost" className="h-auto min-h-0 px-0 py-0 text-[12px] font-bold">
                전체 매장 보기
                <ArrowRight size={13} aria-hidden="true" />
              </ButtonLink>
            </div>
            <div
              className="h-[170px] overflow-hidden rounded-[14px] border border-[var(--hm-border)] bg-[url('/images/brand/brand-storefront.png')] bg-cover bg-center"
              role="img"
              aria-label={storeInfo.name}
            >
            </div>
            <div className="mt-5 rounded-[18px] border border-[var(--hm-border)] bg-[rgba(255,255,255,.035)] p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] font-bold text-white">{storeInfo.name}</h3>
                <span className="rounded-full bg-[rgba(70,155,90,.2)] px-3 py-1 text-[11px] font-bold text-[#77d091]">영업중</span>
              </div>
              <div className="mt-4 grid gap-3 text-[13px] font-medium text-white/68">
                <p className="flex gap-3">
                  <MapPin className="mt-0.5 shrink-0 text-[var(--hm-accent-gold)]" size={16} aria-hidden="true" />
                  {storeInfo.address}
                </p>
                <p className="flex gap-3">
                  <Phone className="mt-0.5 shrink-0 text-[var(--hm-accent-gold)]" size={16} aria-hidden="true" />
                  {storeInfo.phone}
                </p>
                <p className="flex gap-3">
                  <Clock className="mt-0.5 shrink-0 text-[var(--hm-accent-gold)]" size={16} aria-hidden="true" />
                  {storeInfo.hours.join(" / ")}
                </p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <ButtonLink href="/store" variant="outline" className="min-h-10 text-[12px]">길찾기</ButtonLink>
                <ButtonLink href="/support" variant="outline" className="min-h-10 text-[12px]">전화하기</ButtonLink>
              </div>
            </div>
          </article>

          <article className="hm-tablet-panel h-[126px] overflow-hidden p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="hm-serif text-[22px] font-bold text-[var(--hm-primary)]">인스타그램</h2>
              <ButtonLink href="/events" variant="ghost" className="h-auto min-h-0 px-0 py-0 text-[12px] font-bold">
                더보기
                <ArrowRight size={13} aria-hidden="true" />
              </ButtonLink>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {tabletInstagram.map((src, index) => (
                <div key={`${src}-${index}`} className="relative aspect-square overflow-hidden rounded-[12px] border border-[var(--hm-border)]">
                  <Image src={src} alt={`화목 이미지 ${index + 1}`} fill sizes="80px" className="object-cover" />
                </div>
              ))}
            </div>
          </article>

        </aside>
      </div>
    </div>
  );
}

function TabletMenuCard({
  item,
  priority = false,
}: {
  item: HomeMenuCardItem;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/menu/${item.id}`}
      className="hm-card-hover overflow-hidden rounded-[14px] border border-[var(--hm-border)] bg-[rgba(255,255,255,.035)]"
    >
      <div className="relative h-[78px]">
        <Image
          src={item.imageUrl ?? "/images/menu/1783221304773.png"}
          alt={item.name}
          fill
          priority={priority}
          sizes="18vw"
          className="object-cover"
        />
        <Badge tone="neutral" className="absolute left-2 top-2 text-[10px]">{item.category}</Badge>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-[13px] font-bold leading-5 text-white">{item.name}</h3>
        <p className="mt-1 line-clamp-1 text-[11px] font-medium leading-5 text-white/55">{item.description}</p>
        <p className="mt-2 text-[13px] font-bold text-[var(--hm-primary)]">{formatCurrency(item.price)}</p>
      </div>
    </Link>
  );
}

function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="hm-eyebrow">
          {eyebrow}
        </p>
        <h2 className="hm-section-title mt-4">
          {title}
        </h2>
      </div>
      <ButtonLink href={href} variant="ghost" className="px-0 text-[15px] font-bold text-[var(--hm-primary)]">
        {linkLabel}
        <ArrowRight size={16} aria-hidden="true" />
      </ButtonLink>
    </div>
  );
}
