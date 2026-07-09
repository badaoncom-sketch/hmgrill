import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Image from "next/image";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";
import { siteContact } from "@/lib/navigation";

// 관리자(SEO 관리)에서 제목·설명·공유 이미지를 수정할 수 있다.
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("about");
}

const nameMeanings = [
  {
    hanja: "火木",
    reading: "불 화 · 나무 목",
    body: "참나무 장작의 불로 정직하게 굽는다는 화목의 약속입니다.",
  },
  {
    hanja: "和睦",
    reading: "화할 화 · 화목할 목",
    body: "좋은 사람들과 마주 앉는 따뜻한 시간을 뜻합니다.",
  },
];

const principles = [
  {
    number: "01",
    title: "불의 온도",
    body: "장작불의 세기와 시간으로 고기의 겉면과 육즙을 조율합니다. 불은 재료를 익히는 도구가 아니라 맛을 완성하는 언어입니다.",
  },
  {
    number: "02",
    title: "공간의 무드",
    body: "검은 표면과 금빛 조명으로 식사에 집중하는 차분한 분위기를 만듭니다. 빛과 소리까지 식사의 일부로 설계합니다.",
  },
  {
    number: "03",
    title: "한 끼의 완성",
    body: "숙성 고기, 구운 채소, 곁들임을 한 판의 흐름으로 구성합니다. 첫 점부터 마지막 한 점까지 온도를 지킵니다.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className="relative -mt-16 overflow-hidden bg-[var(--hm-background)] md:-mt-20">
        <Image
          src="/images/brand/brand-fire-wall.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,7,6,.9),rgba(8,7,6,.6)_46%,rgba(8,7,6,.24))]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,transparent,#0d0d0d)]" />
        <Container className="relative flex min-h-[500px] flex-col justify-center pb-24 pt-36 md:min-h-[580px]">
          <div className="hm-reveal max-w-2xl">
            <p className="hm-eyebrow">About Hwamok</p>
            <h1 className="hm-display-title hm-hero-shadow mt-6">
              고기의 맛은
              <br />
              불에서 결정된다
            </h1>
            <p className="hm-body-lg mt-6 max-w-xl text-white/80">
              화목은 불을 연구합니다. 참나무 장작의 온기와 숙성 고기의 밀도,
              조용한 식사 공간까지 — 한 끼의 경험을 처음부터 끝까지 설계합니다.
            </p>
          </div>
        </Container>
      </section>

      <Section className="hm-section-band">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="hm-eyebrow">Our Name</p>
            <h2 className="hm-section-title mt-5">화목이라는 이름</h2>
            <p className="hm-body mt-5 text-[var(--hm-subtext)]">
              화목은 두 가지 마음을 겹쳐 지은 이름입니다.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
            {nameMeanings.map((meaning) => (
              <article
                key={meaning.hanja}
                className="hm-card-hover rounded-[20px] border border-[var(--hm-warm-border)] bg-[var(--hm-surface)] px-8 py-11 text-center"
              >
                <p className="hm-serif text-[46px] font-bold leading-none text-[var(--hm-primary)]">
                  {meaning.hanja}
                </p>
                <p className="mt-5 text-[12px] font-bold tracking-[0.18em] text-[var(--hm-accent-gold)]">
                  {meaning.reading}
                </p>
                <p className="hm-caption mt-4 text-[var(--hm-subtext)]">{meaning.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="hm-section-deep hm-section-separator">
        <Container>
          <div className="max-w-2xl">
            <p className="hm-eyebrow">Philosophy</p>
            <h2 className="hm-section-title mt-5">화목이 지키는 세 가지</h2>
          </div>
          <div className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-3">
            {principles.map((principle) => (
              <article
                key={principle.number}
                className="border-t border-[var(--hm-border)] pt-7 transition-colors duration-300 hover:border-[rgba(247,230,193,.34)]"
              >
                <p className="font-mono text-[13px] tracking-[0.16em] text-[var(--hm-accent-gold)]">
                  {principle.number}
                </p>
                <h3 className="hm-serif mt-5 text-[24px] font-semibold leading-[1.3] text-[var(--hm-primary)]">
                  {principle.title}
                </h3>
                <p className="hm-caption mt-4 text-[var(--hm-subtext)]">{principle.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="hm-section-band">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.52fr_0.48fr] lg:items-center">
            <div className="order-2 grid gap-5 sm:grid-cols-[.7fr_1.3fr] lg:order-1">
              <div className="hm-image-zoom relative min-h-[300px] overflow-hidden rounded-[24px] border border-[var(--hm-border)] shadow-[var(--hm-shadow)]">
                <Image
                  src="/images/brand/brand-sign-collage.jpg"
                  alt="화목 브랜드 사인"
                  fill
                  sizes="(min-width: 1024px) 18vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.34))]" />
              </div>
              <div className="hm-image-zoom relative min-h-[300px] overflow-hidden rounded-[24px] border border-[var(--hm-border)] shadow-[var(--hm-shadow-strong)]">
                <Image
                  src="/images/brand/brand-storefront.png"
                  alt="화목 매장 외관"
                  fill
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.38))]" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="hm-eyebrow">Space</p>
              <h2 className="hm-section-title mt-5">검은 표면 위, 금빛의 온기</h2>
              <p className="hm-body mt-5 max-w-md text-[var(--hm-subtext)]">
                화목의 공간은 장작불을 닮았습니다. 어두운 벽과 낮은 조도 위에
                금빛 조명이 내려앉아, 접시와 대화에만 집중하게 됩니다.
              </p>
              <ButtonLink
                href="/store"
                variant="ghost"
                className="mt-6 px-0 text-[15px] font-bold text-[var(--hm-primary)]"
              >
                매장 둘러보기
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="hm-section-deep hm-section-separator">
        <Container>
          <div className="overflow-hidden rounded-[24px] border border-[var(--hm-warm-border)] bg-[var(--hm-surface)] shadow-[var(--hm-shadow)]">
            <div className="grid lg:grid-cols-[1.05fr_.95fr]">
              <div className="p-8 sm:p-10 lg:p-12">
                <p className="hm-eyebrow">Visit</p>
                <h2 className="hm-subsection-title mt-5">화목에서 만나요</h2>
                <p className="hm-body mt-4 max-w-md text-[var(--hm-subtext)]">
                  참나무 장작에 불을 올리고 기다리고 있습니다.
                  좋은 사람과의 화목한 시간을 예약해 보세요.
                </p>
                <div className="mt-8 grid gap-4">
                  <div className="flex gap-3 text-[var(--hm-subtext)]">
                    <MapPin className="mt-1 shrink-0 text-[var(--hm-accent-gold)]" size={18} aria-hidden="true" />
                    <p className="hm-caption">{siteContact.address}</p>
                  </div>
                  <div className="flex gap-3 text-[var(--hm-subtext)]">
                    <Phone className="mt-1 shrink-0 text-[var(--hm-accent-gold)]" size={18} aria-hidden="true" />
                    <p className="hm-caption">{siteContact.phoneDisplay}</p>
                  </div>
                  <div className="flex gap-3 text-[var(--hm-subtext)]">
                    <Clock className="mt-1 shrink-0 text-[var(--hm-accent-gold)]" size={18} aria-hidden="true" />
                    <div className="grid gap-1">
                      <p className="hm-caption">{siteContact.hoursWeekday}</p>
                      <p className="hm-caption">{siteContact.hoursWeekend}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-9 flex flex-wrap gap-3">
                  <ButtonLink href="/store">오시는 길</ButtonLink>
                  <ButtonLink href="/menu" variant="outline">
                    메뉴 보기
                  </ButtonLink>
                </div>
              </div>
              <div className="relative min-h-[280px] lg:min-h-full">
                <Image
                  src="/images/brand/brand-hero-background.png"
                  alt="화목 장작구이 상차림"
                  fill
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(26,26,26,.5),transparent_40%)]" />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
