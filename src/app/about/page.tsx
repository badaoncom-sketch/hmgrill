import { MapPin, Store } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="ABOUT"
        title="화목소개"
        description="브랜드 소개, 매장 소개, 오시는 길을 한 화면에서 확인할 수 있도록 구성했습니다."
      />
      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardContent>
            <Store className="text-red-700" size={28} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-neutral-950">
              브랜드 소개
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              화목은 단일 매장 운영에 집중하는 공식 홈페이지를 통해 매장
              정보와 쿠폰 혜택을 명확하게 제공합니다.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Store className="text-red-700" size={28} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-neutral-950">
              매장 소개
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              회원 쿠폰과 현장 직원 확인 흐름을 결합해 방문 고객에게 빠른
              할인 경험을 제공합니다.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <MapPin className="text-red-700" size={28} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-neutral-950">
              오시는 길
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              실제 매장 주소와 지도 연동은 운영 정보 확정 후 설정 파일 또는
              CMS 데이터로 연결합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
