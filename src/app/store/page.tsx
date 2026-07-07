import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Clock, MapPin, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { siteContact } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "매장 안내",
  description: "화목의 따뜻한 장작불과 차분한 다이닝 공간을 안내합니다.",
};

const storeHours = [
  siteContact.hoursWeekday,
  siteContact.hoursWeekend,
  "라스트 오더 21:00",
];

const mapLinks = [
  {
    label: "네이버 지도",
    href: `https://map.naver.com/v5/search/${encodeURIComponent(siteContact.address)}`,
  },
  {
    label: "카카오맵",
    href: `https://map.kakao.com/link/search/${encodeURIComponent(siteContact.address)}`,
  },
];

export default function StorePage() {
  return (
    <main className="hm-page-main">
      <Container>
        <div className="max-w-2xl">
          <p className="hm-eyebrow">Store</p>
          <h1 className="hm-section-title mt-5">매장 안내</h1>
          <p className="hm-body mt-5 text-[var(--hm-subtext)]">
            화목의 따뜻한 장작불과 차분한 다이닝 공간을 만나보세요.
          </p>
        </div>

        <section className="mt-12 grid gap-5 lg:grid-cols-[1.25fr_.75fr] lg:items-stretch">
          <div className="hm-image-zoom relative min-h-[320px] overflow-hidden rounded-[24px] border border-[var(--hm-border)] shadow-[var(--hm-shadow-strong)] lg:min-h-[440px]">
            <Image
              src="/images/brand/brand-storefront.png"
              alt="화목 매장 입구"
              fill
              priority
              sizes="(min-width: 1024px) 62vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.06),rgba(0,0,0,.4))]" />
          </div>

          <article className="flex flex-col justify-between rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-7 shadow-[var(--hm-shadow)] lg:p-8">
            <div>
              <p className="hm-eyebrow">Main Store</p>
              <h2 className="hm-subsection-title mt-4">화목 본점</h2>
              <p className="hm-body mt-4 text-[var(--hm-subtext)]">
                장작불의 온기와 차분한 조명을 중심으로 설계한
                화목의 기준이 되는 장작구이 공간입니다.
              </p>
            </div>
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
                  {storeHours.map((hour) => (
                    <p key={hour} className="hm-caption">
                      {hour}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/support">문의하기</ButtonLink>
              <ButtonLink href="/menu" variant="outline">
                메뉴 보기
              </ButtonLink>
            </div>
          </article>
        </section>

        <section className="mt-14 overflow-hidden rounded-[24px] border border-[var(--hm-warm-border)] bg-[radial-gradient(58%_120%_at_50%_0%,rgba(184,130,30,.09),transparent_72%),var(--hm-surface)]">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <p className="hm-eyebrow">Directions</p>
              <h2 className="hm-subsection-title mt-4">오시는 길</h2>
              <p className="hm-body mt-4 text-[var(--hm-subtext)]">{siteContact.address}</p>
              <p className="hm-caption mt-2 text-white/40">
                아래 지도 서비스에서 위치와 길찾기를 확인할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {mapLinks.map((link) => (
                <ButtonLink
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  variant="outline"
                >
                  {link.label}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </ButtonLink>
              ))}
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
