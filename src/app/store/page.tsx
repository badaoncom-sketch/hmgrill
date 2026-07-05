import Image from "next/image";
import { Clock, MapPin, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/layout";

const storeInfo = {
  name: "화목 본점",
  address: "서울 강남구 테헤란로 123",
  phone: "02-1234-5678",
  hours: ["평일 10:00 - 22:00", "주말 11:00 - 22:00", "라스트 오더 21:00"],
};

export default function StorePage() {
  return (
    <main className="py-[120px]">
      <Container className="grid gap-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-accent-gold)]">
            STORE
          </p>
          <h1 className="hm-serif mt-4 text-4xl font-bold text-[var(--hm-primary)]">
            매장 안내
          </h1>
          <p className="mt-4 leading-7 text-[var(--hm-subtext)]">
            화목의 따뜻한 장작불과 차분한 다이닝 공간을 만나보세요.
          </p>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
          <div className="relative min-h-[420px] overflow-hidden rounded-[24px] border border-[var(--hm-border)]">
            <Image
              src="/images/brand/brand-storefront.png"
              alt="화목 매장 입구"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>
          <Card>
            <CardContent className="flex h-full flex-col justify-center gap-7">
              <div>
                <h2 className="hm-serif text-3xl font-bold text-[var(--hm-primary)]">
                  {storeInfo.name}
                </h2>
                <p className="mt-3 text-[var(--hm-subtext)]">
                  화목의 기준이 되는 장작구이 공간입니다.
                </p>
              </div>
              <div className="grid gap-4 text-sm text-[var(--hm-subtext)]">
                <p className="flex gap-3">
                  <MapPin size={18} className="text-[var(--hm-accent-gold)]" aria-hidden="true" />
                  {storeInfo.address}
                </p>
                <p className="flex gap-3">
                  <Phone size={18} className="text-[var(--hm-accent-gold)]" aria-hidden="true" />
                  {storeInfo.phone}
                </p>
                <div className="flex gap-3">
                  <Clock size={18} className="mt-0.5 text-[var(--hm-accent-gold)]" aria-hidden="true" />
                  <div className="grid gap-1">
                    {storeInfo.hours.map((hour) => (
                      <p key={hour}>{hour}</p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/support">문의하기</ButtonLink>
                <ButtonLink href="/menu" variant="outline">
                  메뉴 보기
                </ButtonLink>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid min-h-[360px] place-items-center rounded-[24px] border border-[var(--hm-border)] bg-[var(--hm-card)] text-center">
          <div>
            <MapPin className="mx-auto text-[var(--hm-accent-gold)]" size={32} aria-hidden="true" />
            <h2 className="hm-serif mt-4 text-2xl font-bold text-[var(--hm-primary)]">
              지도 영역
            </h2>
            <p className="mt-3 text-sm text-[var(--hm-subtext)]">
              운영 주소 확정 후 Google Map 또는 Naver Map을 연결합니다.
            </p>
          </div>
        </section>
      </Container>
    </main>
  );
}
