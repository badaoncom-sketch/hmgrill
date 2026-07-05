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
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
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
  "/images/menu/1783221305205.png",
  "/images/brand/brand-sign-collage.jpg",
  "/images/menu/1783221305136.png",
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
      <section className="relative -mt-20 min-h-screen overflow-hidden bg-[var(--hm-background)] text-white lg:min-h-[860px]">
        <Image
          src="/images/brand/brand-hero-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-[1.08] object-cover object-[69%_center]"
        />
        <div className="absolute inset-0 bg-[rgba(0,0,0,.38)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.9)_0%,rgba(0,0,0,.72)_33%,rgba(0,0,0,.2)_62%,rgba(0,0,0,.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(180deg,transparent,rgba(13,13,13,.82)_72%,#0d0d0d)]" />
        <Container className="relative flex min-h-screen flex-col pb-10 pt-20 lg:min-h-[860px]">
          <div className="flex flex-1 items-center pt-4">
            <div className="hm-hero-shadow hm-reveal w-full max-w-[34rem] py-16 lg:w-[39%]">
              <h1 className="hm-serif text-[44px] font-bold leading-[1.27] tracking-normal text-[var(--hm-primary)] md:text-[64px] lg:text-[78px]">
                참나무 장작의 깊은 향,
                <br />
                화목의 시간
              </h1>
              <p className="mt-8 max-w-md text-lg leading-[1.8] text-white/78 lg:text-[20px]">
                좋은 사람과 함께하는 시간.
                <br />
                정성으로 구워낸 특별한 맛을 전합니다.
              </p>
              <div className="mt-11">
                <ButtonLink href="/menu" className="min-h-14 rounded-[14px] px-7 py-4 text-[15px]">
                  화목 둘러보기
                  <ArrowRight size={17} aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="hm-card-hover rounded-[20px] border border-[var(--hm-border)] bg-[rgba(18,18,18,.78)] p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,.3)]"
                >
                  <Icon className="mx-auto text-[var(--hm-accent-gold)]" size={40} aria-hidden="true" />
                  <h2 className="mt-6 text-[20px] font-bold text-[var(--hm-primary)]">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-7 text-white/66">{item.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {activePopup ? (
        <section className="hm-section-separator bg-[#100e0b]">
          <Container className="flex flex-col gap-3 py-5 text-sm text-[var(--hm-subtext)] sm:flex-row sm:items-center sm:justify-between">
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

      <Section className="hm-section-band">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[0.42fr_0.58fr] lg:items-center">
            <div className="hm-reveal">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--hm-accent-gold)]">
                ABOUT HWAMOK
              </p>
              <h2 className="hm-serif mt-5 text-[34px] font-bold leading-tight text-[var(--hm-primary)] sm:text-[48px]">
                화목, 그 특별한 이야기
              </h2>
              <p className="mt-7 max-w-md text-[17px] leading-9 text-[var(--hm-subtext)]">
                화목은 참나무 장작구이를 통해 음식 본연의 맛과 향을 살리고,
                좋은 사람들과 함께하는 소중한 시간을 만들어가는 공간입니다.
              </p>
              <ButtonLink href="/about" variant="ghost" className="mt-8 px-0 text-[15px] text-[var(--hm-primary)]">
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
                  <h3 className="text-[20px] font-bold text-[var(--hm-text)]">{item.name}</h3>
                  <p className="min-h-14 text-[15px] leading-7 text-[var(--hm-subtext)]">
                    {item.description}
                  </p>
                  <p className="pt-1 text-[18px] font-bold text-[var(--hm-primary)]">
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
            {promotions.map((item) => (
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
                  <h3 className="text-[21px] font-bold text-[var(--hm-primary)]">{item.title}</h3>
                  <p className="mt-3 min-h-14 text-[15px] leading-7 text-[var(--hm-subtext)]">{item.body}</p>
                  <ButtonLink href={item.href} variant="ghost" className="mt-5 h-auto min-h-0 px-0 py-0 text-[var(--hm-primary)]">
                    자세히 보기
                    <ArrowRight size={14} aria-hidden="true" />
                  </ButtonLink>
                </div>
              </article>
            ))}
            {activeCoupon ? (
              <article className="hm-card-hover rounded-[20px] border border-[rgba(247,230,193,.24)] bg-[linear-gradient(135deg,rgba(35,35,35,.96),rgba(26,18,12,.95))] p-7">
                <div className="grid h-20 w-20 place-items-center rounded-[20px] bg-[var(--hm-primary)] text-[var(--hm-background)]">
                  <Gift size={32} aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-[21px] font-bold text-[var(--hm-primary)]">{activeCoupon.name}</h3>
                <p className="mt-3 text-3xl font-bold text-white">
                  {formatCurrency(activeCoupon.amount)}
                </p>
                <p className="mt-4 text-[15px] leading-7 text-[var(--hm-subtext)]">
                  다운로드 후 {activeCoupon.validityDays}일 사용 가능
                </p>
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
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {storeCards.map((store) => (
              <article
                key={store.id}
                className="hm-card-hover group overflow-hidden rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)]"
              >
                <div className="hm-image-zoom relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={store.imageUrl}
                    alt={store.name}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.46))]" />
                </div>
                <div className="grid gap-3 p-6">
                  <h3 className="text-[19px] font-bold text-[var(--hm-primary)]">{store.name}</h3>
                  <p className="flex gap-2 text-[14px] leading-6 text-[var(--hm-subtext)]">
                    <MapPin size={16} aria-hidden="true" />
                    {store.address}
                  </p>
                  <p className="text-[14px] text-[var(--hm-subtext)]">{store.phone}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="hm-section-band">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <Camera className="mx-auto text-[var(--hm-accent-gold)]" size={30} aria-hidden="true" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--hm-accent-gold)]">
              INSTAGRAM
            </p>
            <h2 className="hm-serif mt-4 text-[30px] font-bold text-[var(--hm-primary)] sm:text-[40px]">
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
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--hm-accent-gold)]">
          {eyebrow}
        </p>
        <h2 className="hm-serif mt-4 text-[34px] font-bold leading-tight text-[var(--hm-primary)] sm:text-[48px]">
          {title}
        </h2>
      </div>
      <ButtonLink href={href} variant="ghost" className="px-0 text-[var(--hm-primary)]">
        {linkLabel}
        <ArrowRight size={16} aria-hidden="true" />
      </ButtonLink>
    </div>
  );
}
