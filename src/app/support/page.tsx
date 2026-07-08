import type { Metadata } from "next";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { submitInquiryAction } from "@/app/actions/content";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Container } from "@/components/ui/layout";
import { siteContact } from "@/lib/navigation";
import { faqs } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "고객센터",
  description: "방문 전 궁금한 내용을 확인하고 필요한 문의를 남겨 주세요.",
};

const quickActions = [
  {
    title: "전화 문의",
    body: "방문, 예약, 매장 이용 문의",
    href: siteContact.phoneHref,
    label: siteContact.phoneDisplay,
    icon: Phone,
  },
  {
    title: "매장 위치",
    body: "주소와 영업시간 확인",
    href: "/store",
    label: "오시는 길",
    icon: MapPin,
  },
  {
    title: "쿠폰 확인",
    body: "다운로드와 사용내역 확인",
    href: "/coupons",
    label: "쿠폰 보기",
    icon: Ticket,
  },
] as const;

const serviceNotes = [
  { label: "운영시간", value: siteContact.hoursWeekday, icon: Clock3 },
  { label: "주말/공휴일", value: siteContact.hoursWeekend, icon: Clock3 },
  { label: "이메일", value: siteContact.email, icon: Mail },
] as const;

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  const isSent = sent === "1";

  return (
    <main className="hm-page-main">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="hm-eyebrow">Support</p>
            <h1 className="hm-section-title mt-3 md:mt-5">고객센터</h1>
            <p className="hm-body mt-3 text-[var(--hm-subtext)] md:mt-5">
              방문 전 궁금한 내용은 빠르게 확인하고, 필요한 문의는 남겨 주세요.
            </p>
          </div>
          <ButtonLink href="#inquiry-form" variant="outline" className="w-fit shrink-0">
            문의 남기기
            <MessageSquareText size={16} aria-hidden="true" />
          </ButtonLink>
        </div>

        <div className="mt-7 grid gap-3 md:mt-12 md:grid-cols-3 md:gap-4">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="hm-link-focus hm-card-hover group flex items-center gap-3.5 rounded-[16px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-4 md:rounded-[20px] md:p-5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-[rgba(247,230,193,.18)] text-[var(--hm-primary)] transition group-hover:bg-[rgba(247,230,193,.08)] md:h-11 md:w-11 md:rounded-[14px]">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-[var(--hm-text)]">{item.title}</span>
                  <span className="mt-0.5 hidden text-sm leading-6 text-[var(--hm-subtext)] md:block">{item.body}</span>
                  <span className="mt-0.5 block text-xs font-bold text-[var(--hm-primary)] md:mt-1.5 md:text-sm">{item.label}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-white/30 md:hidden" aria-hidden="true" />
              </Link>
            );
          })}
        </div>

        <section className="mt-8 grid gap-4 md:mt-12 md:gap-5 lg:grid-cols-[minmax(0,.92fr)_minmax(420px,1.08fr)] lg:items-start">
          <div className="grid gap-5">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <HelpCircle size={22} className="text-[var(--hm-accent-gold)]" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-[var(--hm-text)]">자주 묻는 질문</h2>
                </div>
                <div className="mt-5 divide-y divide-[var(--hm-divider)]">
                  {faqs.map((item, index) => (
                    <details key={item.question} className="group py-4" open={index === 0}>
                      <summary className="hm-link-focus flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[var(--hm-text)] [&::-webkit-details-marker]:hidden">
                        {item.question}
                        <ChevronDown
                          size={18}
                          className="shrink-0 text-[var(--hm-primary)] transition group-open:rotate-180"
                          aria-hidden="true"
                        />
                      </summary>
                      <p className="mt-3 text-sm leading-6 text-[var(--hm-subtext)]">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {serviceNotes.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-[16px] border border-[var(--hm-border)] bg-black/20 px-4 py-3"
                  >
                    <Icon size={17} className="text-[var(--hm-accent-gold)]" aria-hidden="true" />
                    <p className="min-w-20 text-sm font-bold text-[var(--hm-text)]">{item.label}</p>
                    <p className="text-sm text-[var(--hm-subtext)]">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <Card id="inquiry-form" className="scroll-mt-28">
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="hm-eyebrow">Inquiry</p>
                  <h2 className="mt-3 text-2xl font-bold text-[var(--hm-text)]">문의 접수</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--hm-subtext)]">
                    이름과 회신 받을 이메일, 문의 내용을 남겨 주세요.
                  </p>
                </div>
                {isSent ? (
                  <div className="flex items-center gap-2 rounded-[999px] border border-[rgba(247,230,193,.22)] bg-[rgba(247,230,193,.08)] px-4 py-2 text-sm font-bold text-[var(--hm-primary)]">
                    <CheckCircle2 size={16} aria-hidden="true" />
                    접수 완료
                  </div>
                ) : null}
              </div>

              {isSent ? (
                <div className="mt-5 rounded-[16px] border border-[rgba(247,230,193,.18)] bg-[rgba(247,230,193,.07)] p-4 text-sm leading-6 text-[var(--hm-primary)]">
                  문의가 접수되었습니다. 확인 후 등록된 이메일 기준으로 안내드리겠습니다.
                </div>
              ) : null}

              <form action={submitInquiryAction} className="mt-6 grid gap-4">
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="이름">
                    <Input name="name" placeholder="홍길동" maxLength={80} required />
                  </Field>
                  <Field label="이메일">
                    <Input
                      name="email"
                      placeholder="member@example.com"
                      type="email"
                      maxLength={180}
                      required
                    />
                  </Field>
                </div>
                <Field label="문의내용">
                  <Textarea
                    name="message"
                    placeholder="방문 예정일, 인원, 쿠폰 사용 여부 등 문의 내용을 입력해 주세요."
                    className="min-h-40"
                    minLength={10}
                    maxLength={2000}
                    required
                  />
                </Field>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-[var(--hm-subtext)]">
                    문의 내용은 관리자 확인용으로만 사용됩니다.
                  </p>
                  <Button type="submit" className="w-full sm:w-fit">
                    문의 접수
                    <MessageSquareText size={16} aria-hidden="true" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </Container>
    </main>
  );
}
