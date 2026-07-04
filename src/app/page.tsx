import { ArrowRight, ScanLine, ShieldCheck, Ticket } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { couponIssues, menuItems } from "@/lib/site-data";
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

export default function HomePage() {
  const featuredMenu = menuItems.filter((item) => item.featured);
  const activeCoupon = couponIssues.find((issue) => issue.status === "issuing");

  return (
    <main>
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
        </div>
      </section>
    </main>
  );
}
