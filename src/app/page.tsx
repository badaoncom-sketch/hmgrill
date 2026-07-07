import Image from "next/image";
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
import { MenuCard } from "@/components/menu-card";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";
import {
  mapMenuItem,
  mapSiteBanner,
  menuItemSelect,
  siteBannerSelect,
} from "@/lib/content/db";
import { couponIssueSelect, mapCouponIssue } from "@/lib/coupons/db";
import { siteContact } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MenuItem } from "@/lib/types";
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

const fallbackFeaturedMenu: MenuItem[] = [
  {
    id: "fallback-1",
    category: "대표메뉴",
    name: "참나무 장작구이 모둠",
    description: "엄선한 숙성육을 장작불 향으로 구워낸 구성",
    price: 68000,
    imageUrl: "/images/menu/1783221304773.png",
    featured: true,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "fallback-2",
    category: "대표메뉴",
    name: "화목 숙성 꽃갈비살",
    description: "부드러운 식감과 진한 육향을 살린 한 접시",
    price: 42000,
    imageUrl: "/images/menu/1783221304868.png",
    featured: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "fallback-3",
    category: "대표메뉴",
    name: "참나무 통삼겹",
    description: "겉은 바삭하고 속은 촉촉한 장작구이",
    price: 38000,
    imageUrl: "/images/menu/1783221304957.png",
    featured: true,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "fallback-4",
    category: "대표메뉴",
    name: "한우 안심",
    description: "부드러운 결과 은은한 불향이 조화로운 메뉴",
    price: 55000,
    imageUrl: "/images/menu/1783221305035.png",
    featured: true,
    isActive: true,
    sortOrder: 4,
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
  address: siteContact.address,
  phone: siteContact.phoneDisplay,
  hours: [siteContact.hoursWeekday, siteContact.hoursWeekend],
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
      <section className="relative -mt-16 min-h-[calc(100svh-40px)] overflow-hidden bg-[var(--hm-background)] text-white sm:min-h-[620px] md:-mt-20 lg:min-h-[640px] xl:mt-0 xl:h-[min(700px,calc(100svh-96px))] xl:min-h-[600px]">
        <Image
          src="/images/brand/brand-hero-mobile.png"
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 100vw, 0px"
          className="object-contain object-center brightness-[1.1] saturate-[1.05] md:hidden"
        />
        <Image
          src="/images/brand/brand-hero-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hm-hero-image hidden object-cover object-center md:block"
        />
        <div className="hm-hero-overlay absolute inset-0" />
        <div className="hm-hero-gradient absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(180deg,transparent,rgba(13,13,13,.82)_72%,#0d0d0d)]" />
        <Container className="relative flex min-h-[calc(100svh-40px)] flex-col pb-[96px] pt-20 sm:min-h-[620px] sm:pb-8 lg:min-h-[640px] xl:h-full xl:min-h-0 xl:pb-6 xl:pt-0">
          <div className="flex flex-1 items-start pt-16 sm:items-center sm:pt-0">
            <div className="hm-hero-shadow hm-reveal w-full max-w-[48rem] py-6 sm:py-10 lg:w-[54%] xl:py-4">
              <h1 className="hm-display-title">
                <span className="hidden whitespace-nowrap xl:block">참나무 장작의 깊은 향,</span>
                <span className="block xl:hidden">
                  참나무 장작의
                  <br />
                  깊은 향,
                </span>
                <span className="block">화목의 시간</span>
              </h1>
              <p className="hm-body-lg mt-5 max-w-[29rem] text-white/74">
                좋은 사람과 함께하는 시간.
                <br />
                정성으로 구워낸 특별한 맛을 전합니다.
              </p>
              <div className="mt-8">
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
                  className="hm-card-hover rounded-[16px] border border-[var(--hm-border)] bg-[rgba(18,18,18,.78)] p-3 text-center shadow-[0_24px_70px_rgba(0,0,0,.3)] sm:rounded-[20px] sm:p-6"
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
          <div className="grid gap-10 lg:grid-cols-[0.48fr_0.52fr] lg:items-center">
            <div className="hm-reveal">
              <p className="hm-eyebrow">
                ABOUT HWAMOK
              </p>
              <h2 className="hm-section-title mt-5 sm:whitespace-nowrap">
                화목, 그 특별한 이야기
              </h2>
              <p className="hm-body mt-5 max-w-md text-[var(--hm-subtext)]">
                화목은 참나무 장작구이를 통해 음식 본연의 맛과 향을 살리고,
                좋은 사람들과 함께하는 소중한 시간을 만들어가는 공간입니다.
              </p>
              <ButtonLink href="/about" variant="ghost" className="mt-6 px-0 text-[15px] font-bold text-[var(--hm-primary)]">
                더 알아보기
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
            </div>
            <div className="grid gap-5 sm:grid-cols-[1.3fr_.7fr]">
              <div className="hm-image-zoom relative min-h-[340px] overflow-hidden rounded-[24px] border border-[var(--hm-border)] shadow-[var(--hm-shadow-strong)]">
                <Image
                  src="/images/brand/brand-storefront.png"
                  alt="화목 매장 분위기"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.38))]" />
              </div>
              <div className="hm-image-zoom relative min-h-[340px] overflow-hidden rounded-[24px] border border-[var(--hm-border)] shadow-[var(--hm-shadow)]">
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
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
            {homeMenus.map((item, index) => (
              <MenuCard key={item.id} item={item} priority={index === 0} />
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
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
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
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_.75fr] lg:items-stretch">
            <div className="hm-image-zoom relative min-h-[360px] overflow-hidden rounded-[24px] border border-[var(--hm-border)] bg-[var(--hm-card)] shadow-[var(--hm-shadow-strong)]">
              <Image
                src={storeInfo.imageUrl}
                alt={`${storeInfo.name} 공간`}
                fill
                sizes="(min-width: 1024px) 62vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.42))]" />
            </div>
            <article className="flex flex-col justify-between rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-6 shadow-[var(--hm-shadow)]">
              <div>
                <p className="hm-eyebrow">MAIN STORE</p>
                <h3 className="hm-subsection-title mt-5">{storeInfo.name}</h3>
                <p className="hm-body mt-4 text-[var(--hm-subtext)]">
                  장작불의 온기와 차분한 조명을 중심으로 설계한 화목의 대표 공간입니다.
                </p>
              </div>
              <div className="mt-7 grid gap-4">
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
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/store">오시는 길</ButtonLink>
                <ButtonLink href="/support" variant="outline">문의하기</ButtonLink>
              </div>
            </article>
          </div>
        </Container>
      </Section>

      <Section className="hm-section-band pb-16 lg:pb-20">
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
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
          <div className="mt-7 text-center">
            <ButtonLink href="/events" variant="secondary" className="px-7">
              인스타그램 더보기
              <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </main>
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
        <h2 className="hm-section-title mt-3">
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
