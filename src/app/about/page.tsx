import Image from "next/image";
import { Flame, MapPin, Store, Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    title: "불의 온도",
    description: "장작불의 세기와 시간으로 고기의 겉면과 육즙을 조율합니다.",
    icon: Flame,
  },
  {
    title: "공간의 무드",
    description: "검은 표면과 금빛 조명으로 식사에 집중하는 차분한 분위기를 만듭니다.",
    icon: Store,
  },
  {
    title: "한 끼의 완성",
    description: "숙성 고기, 구운 채소, 곁들임을 한 판의 흐름으로 구성합니다.",
    icon: Utensils,
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-[var(--hm-background)] text-[var(--hm-primary)]">
        <div className="hm-container grid gap-8 py-[120px] lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--hm-accent-gold)]">
              ABOUT
            </p>
            <h1 className="hm-serif mt-4 text-3xl font-bold tracking-normal text-[var(--hm-text)] sm:text-4xl">
              화목소개
            </h1>
            <p className="mt-4 text-base leading-7 text-[var(--hm-subtext)]">
              화목은 장작불의 온기, 숙성 고기의 밀도, 조용한 식사 공간을
              하나의 브랜드 경험으로 설계합니다.
            </p>
          </div>
          <div className="relative min-h-72 overflow-hidden rounded-[24px] border border-[var(--hm-border)]">
            <Image
              src="/images/brand/brand-fire-wall.png"
              alt="화목 브랜드 월"
              fill
              sizes="(min-width: 1024px) 56vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="hm-container grid gap-8 py-[120px]">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <CardContent>
                  <Icon className="text-[var(--hm-accent-gold)]" size={28} aria-hidden="true" />
                  <h2 className="mt-4 text-xl font-bold text-[var(--hm-text)]">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--hm-subtext)]">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-80 overflow-hidden rounded-[24px]">
            <Image
              src="/images/brand/brand-sign-collage.jpg"
              alt="화목 로고 응용"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <Card>
            <CardContent className="grid content-center gap-5">
              <MapPin className="text-[var(--hm-accent-gold)]" size={28} aria-hidden="true" />
              <h2 className="text-2xl font-bold text-[var(--hm-text)]">오시는 길</h2>
              <p className="leading-7 text-[var(--hm-subtext)]">
                실제 매장 주소와 지도 연동은 운영 정보 확정 후 연결합니다.
                그 전까지는 브랜드와 메뉴 중심의 탐색 흐름을 우선 제공합니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
