import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Mail,
  MapPin,
  Phone,
  Store,
  UserRound,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-hm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-hm-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "화목",
    template: "%s | 화목",
  },
  description: "장작불의 온기로 고기를 연구하는 화목 장작구이",
};

const socialLinks = [
  { href: "https://www.instagram.com", label: "Instagram", icon: "instagram" },
  { href: "https://www.facebook.com", label: "Facebook", icon: "facebook" },
  { href: "https://www.youtube.com", label: "YouTube", icon: "youtube" },
  { href: "https://section.blog.naver.com", label: "Naver Blog", icon: "blog" },
] as const;

const footerColumns = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "화목 소개" },
      { href: "/about", label: "인사말" },
      { href: "/store", label: "매장 안내" },
      { href: "/support", label: "오시는 길" },
      { href: "/support", label: "채용 안내" },
      { href: "/support", label: "제휴 문의" },
    ],
  },
  {
    title: "Customer",
    links: [
      { href: "/notices", label: "공지사항" },
      { href: "/events", label: "이벤트" },
      { href: "/support", label: "자주 묻는 질문" },
      { href: "/support", label: "1:1 문의" },
      { href: "/support", label: "고객 후기" },
    ],
  },
  {
    title: "Policy",
    links: [
      { href: "/support", label: "이용약관" },
      { href: "/support", label: "개인정보처리방침" },
      { href: "/coupons", label: "쿠폰 이용 안내" },
      { href: "/notices", label: "멤버십 안내" },
      { href: "/support", label: "위치기반 서비스 이용약관" },
    ],
  },
] as const;

const businessInfo = [
  { icon: Store, label: "상호명", value: "화목" },
  { icon: UserRound, label: "대표", value: "홍길동" },
  { icon: FileText, label: "사업자등록번호", value: "123-45-67890" },
  { icon: MapPin, label: "주소", value: "서울특별시 강남구 테헤란로 123, 4층" },
  { icon: Mail, label: "이메일", value: "hwamok@hwamok.com" },
  { icon: Phone, label: "팩스", value: "02-1234-5679" },
] as const;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="ko" className={`${notoSansKr.variable} ${notoSerifKr.variable} ${geistMono.variable}`}>
      <body>
        <SiteHeader isAuthenticated={Boolean(user)} />
        <div className="hm-surface min-h-screen pt-20">{children}</div>
        <footer className="bg-[var(--hm-background)] px-4 py-14 text-[#f7e6c1cc] md:px-6 md:py-24">
          <div className="mx-auto hidden max-w-[1600px] overflow-hidden rounded-[30px] border border-[rgba(184,130,30,.22)] bg-[radial-gradient(circle_at_18%_18%,rgba(247,230,193,.055),transparent_28%),linear-gradient(135deg,rgba(22,20,17,.94),rgba(9,9,8,.98))] shadow-[0_28px_90px_rgba(0,0,0,.45)] md:block">
            <div className="grid gap-10 px-9 py-12 lg:grid-cols-[.95fr_1.55fr] lg:gap-12 xl:grid-cols-[1.05fr_1.75fr_1.35fr] xl:px-16 xl:py-20 2xl:px-20">
              <div className="flex flex-col items-start">
                <span className="relative block h-[152px] w-[152px] xl:h-[174px] xl:w-[174px]">
                  <Image
                    src="/images/brand/brand-logo-transparent.png"
                    alt="화목"
                    fill
                    sizes="174px"
                    className="object-contain"
                  />
                </span>
                <p className="hm-serif mt-8 text-[25px] font-semibold leading-[1.7] text-[var(--hm-primary)] xl:text-[27px] 2xl:text-[30px]">
                  <span className="block whitespace-nowrap">참나무 장작의 깊은 향,</span>
                  <span className="block whitespace-nowrap">화목의 시간을 선사합니다.</span>
                </p>
                <p className="mt-6 max-w-[310px] text-[16px] font-medium leading-[1.9] text-white/58">
                  좋은 사람과 함께하는 시간,
                  <br />
                  정성으로 구워낸 특별한 맛을 전합니다.
                </p>
                <div className="mt-8 flex gap-4 text-[#b8821e]">
                  {socialLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="hm-social-link hm-link-focus"
                      aria-label={item.label}
                    >
                      <SocialLogoIcon name={item.icon} />
                    </Link>
                  ))}
                </div>
              </div>

              <nav className="grid gap-8 md:grid-cols-3">
                {footerColumns.map((column, index) => (
                  <div
                    key={column.title}
                    className={index === 0 ? "" : "border-l border-[rgba(255,255,255,.06)] pl-8"}
                  >
                    <p className="text-[16px] font-extrabold uppercase tracking-[.06em] text-[#c69a4a] 2xl:text-[18px]">
                      {column.title}
                    </p>
                    <div className="mt-10 grid gap-6">
                      {column.links.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="hm-link-focus text-[16px] font-semibold leading-none text-white/66 transition hover:text-[var(--hm-primary)] 2xl:text-[18px]"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="lg:col-span-2 xl:col-span-1 xl:border-l xl:border-[rgba(255,255,255,.06)] xl:pl-8">
                <p className="text-[16px] font-extrabold uppercase tracking-[.06em] text-[#c69a4a] 2xl:text-[18px]">
                  Customer Center
                </p>
                <div className="mt-9 flex items-center gap-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-[rgba(184,130,30,.48)] text-[var(--hm-primary)]">
                    <Phone aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <p className="whitespace-nowrap text-[34px] font-extrabold leading-none tracking-normal text-white 2xl:text-[46px]">
                    02-1234-5678
                  </p>
                </div>
                <p className="mt-8 text-[18px] font-medium leading-[1.85] text-white/52">
                  평일 10:00 - 22:00
                  <br />
                  주말/공휴일 11:00 - 22:00
                </p>
                <div className="mt-10 overflow-hidden rounded-[16px] border border-[rgba(184,130,30,.32)]">
                  <Link
                    href="tel:02-1234-5678"
                    className="hm-link-focus flex min-h-[72px] items-center justify-between px-6 text-[17px] font-bold text-white transition hover:bg-[rgba(247,230,193,.06)]"
                  >
                    <span className="flex items-center gap-4">
                      <Phone aria-hidden="true" className="h-6 w-6 text-[var(--hm-primary)]" strokeWidth={1.8} />
                      전화 문의
                    </span>
                    <ChevronRight aria-hidden="true" className="h-5 w-5 text-[var(--hm-primary)]" strokeWidth={1.8} />
                  </Link>
                  <Link
                    href="/store"
                    className="hm-link-focus flex min-h-[72px] items-center justify-between border-t border-[rgba(184,130,30,.18)] px-6 text-[17px] font-bold text-white transition hover:bg-[rgba(247,230,193,.06)]"
                  >
                    <span className="flex items-center gap-4">
                      <MapPin aria-hidden="true" className="h-6 w-6 text-[var(--hm-primary)]" strokeWidth={1.8} />
                      매장 찾기
                    </span>
                    <ChevronRight aria-hidden="true" className="h-5 w-5 text-[var(--hm-primary)]" strokeWidth={1.8} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-[rgba(184,130,30,.2)]">
              <div className="grid gap-8 px-9 py-10 xl:grid-cols-[1.4fr_1fr] xl:px-20 xl:py-12">
                <dl className="grid gap-x-10 gap-y-7 md:grid-cols-2">
                  {businessInfo.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="grid min-w-0 grid-cols-[128px_minmax(0,1fr)] items-center gap-5 xl:grid-cols-[150px_minmax(0,1fr)]">
                        <dt className="flex items-center gap-4 text-[17px] font-bold text-[#c69a4a]">
                          <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                          {item.label}
                        </dt>
                        <dd className="min-w-0 text-[17px] font-medium leading-7 text-white/62">{item.value}</dd>
                      </div>
                    );
                  })}
                </dl>
                <Link
                  href="/store"
                  className="hm-link-focus relative hidden min-h-[160px] overflow-hidden rounded-[18px] border border-[rgba(255,255,255,.06)] bg-[linear-gradient(135deg,rgba(247,230,193,.04),rgba(184,130,30,.02)),repeating-linear-gradient(28deg,rgba(255,255,255,.035)_0_1px,transparent_1px_34px),repeating-linear-gradient(118deg,rgba(255,255,255,.028)_0_1px,transparent_1px_40px)] xl:block"
                >
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_76%_44%,rgba(184,130,30,.24),transparent_26%)]" />
                  <span className="absolute right-[18%] top-1/2 flex -translate-y-1/2 items-center gap-4 text-[18px] font-bold text-[var(--hm-primary)]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f7e6c1,#b8821e)] text-[#0d0d0d] shadow-[0_16px_34px_rgba(184,130,30,.24)]">
                      <MapPin aria-hidden="true" className="h-6 w-6" strokeWidth={2} />
                    </span>
                    화목 본점
                  </span>
                </Link>
              </div>
              <p className="border-t border-[rgba(184,130,30,.12)] py-7 text-center text-[17px] font-medium text-white/42">
                Copyright HWAMOK. All rights reserved.
              </p>
            </div>
          </div>

          <div className="mx-auto block max-w-[560px] rounded-[26px] border border-[rgba(255,255,255,.14)] bg-[radial-gradient(circle_at_50%_0%,rgba(247,230,193,.045),transparent_32%),linear-gradient(180deg,rgba(21,20,18,.96),rgba(10,10,9,.98))] px-7 pb-[calc(118px+env(safe-area-inset-bottom))] pt-16 shadow-[0_24px_70px_rgba(0,0,0,.42)] md:hidden">
            <div className="flex justify-center">
              <span className="relative block h-[196px] w-[196px]">
                <Image
                  src="/images/brand/brand-logo-transparent.png"
                  alt="화목"
                  fill
                  sizes="196px"
                  className="object-contain"
                />
              </span>
            </div>

            <div className="mt-8 h-px bg-[rgba(184,130,30,.36)]" />

            <div className="mt-10 grid grid-cols-2 gap-4">
              <Link
                href="tel:02-1234-5678"
                className="hm-link-focus flex min-h-[92px] items-center justify-center gap-4 rounded-[16px] border border-[rgba(184,130,30,.48)] text-[23px] font-bold text-white transition hover:bg-[rgba(247,230,193,.06)]"
              >
                <Phone aria-hidden="true" className="h-9 w-9 text-[var(--hm-primary)]" strokeWidth={1.7} />
                전화하기
              </Link>
              <Link
                href="/store"
                className="hm-link-focus flex min-h-[92px] items-center justify-center gap-4 rounded-[16px] border border-[rgba(184,130,30,.48)] text-[23px] font-bold text-white transition hover:bg-[rgba(247,230,193,.06)]"
              >
                <MapPin aria-hidden="true" className="h-9 w-9 text-[var(--hm-primary)]" strokeWidth={1.7} />
                길찾기
              </Link>
            </div>

            <div className="mt-10 h-px bg-[rgba(184,130,30,.36)]" />

            <details className="group">
              <summary className="hm-link-focus flex min-h-[92px] cursor-pointer list-none items-center justify-between text-[23px] font-bold text-white [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-5">
                  <FileText aria-hidden="true" className="h-8 w-8 text-[var(--hm-primary)]" strokeWidth={1.7} />
                  사업자정보
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-7 w-7 text-[var(--hm-primary)] transition group-open:rotate-180"
                  strokeWidth={1.8}
                />
              </summary>
              <dl className="grid gap-3 border-t border-[rgba(184,130,30,.18)] pb-6 pt-4 text-[14px] leading-6 text-white/54">
                {businessInfo.map((item) => (
                  <div key={item.label} className="grid grid-cols-[104px_1fr] gap-3">
                    <dt className="font-semibold text-[#c69a4a]">{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </details>

            <div className="h-px bg-[rgba(184,130,30,.36)]" />

            <p className="py-11 text-center text-[12px] font-medium leading-none text-white/46 min-[420px]:text-[15px]">
              Copyright © HWAMOK. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

function SocialLogoIcon({ name }: { name: (typeof socialLinks)[number]["icon"] }) {
  if (name === "instagram") {
    return (
      <svg aria-hidden="true" className="h-[17px] w-[17px]" fill="none" viewBox="0 0 24 24">
        <rect height="15.5" rx="4.6" stroke="currentColor" strokeWidth="1.9" width="15.5" x="4.25" y="4.25" />
        <circle cx="12" cy="12" r="3.35" stroke="currentColor" strokeWidth="1.9" />
        <circle cx="16.9" cy="7.1" fill="currentColor" r="1.15" />
      </svg>
    );
  }

  if (name === "facebook") {
    return (
      <svg aria-hidden="true" className="h-[17px] w-[17px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.7 21v-7.4h2.5l.4-2.9h-2.9V8.8c0-.8.2-1.4 1.5-1.4h1.6V4.8c-.8-.1-1.6-.2-2.4-.2-2.4 0-4 1.5-4 4.1v2H7.8v2.9h2.6V21h3.3Z" />
      </svg>
    );
  }

  if (name === "youtube") {
    return (
      <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
        <path
          d="M21 8.2a3 3 0 0 0-2.1-2.1C17.1 5.6 12 5.6 12 5.6s-5.1 0-6.9.5A3 3 0 0 0 3 8.2a31 31 0 0 0-.5 3.8A31 31 0 0 0 3 15.8a3 3 0 0 0 2.1 2.1c1.8.5 6.9.5 6.9.5s5.1 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-3.8 31 31 0 0 0-.5-3.8Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path d="m10.3 14.8 4.4-2.8-4.4-2.8v5.6Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24">
      <path
        d="M5.8 5.2h12.4a2.2 2.2 0 0 1 2.2 2.2v7.5a2.2 2.2 0 0 1-2.2 2.2h-4.1L12 19.4 9.9 17H5.8a2.2 2.2 0 0 1-2.2-2.2V7.4a2.2 2.2 0 0 1 2.2-2.2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M8 9h3.2c1.2 0 1.9.7 1.9 1.6 0 .7-.3 1.2-.9 1.4.8.2 1.2.8 1.2 1.6 0 1.1-.8 1.8-2.2 1.8H8V9Zm2 2.4h.9c.4 0 .7-.2.7-.6s-.3-.6-.7-.6H10v1.2Zm0 2.8h1c.5 0 .8-.2.8-.7s-.3-.7-.8-.7h-1v1.4Zm5.1-5.2h1.7v6.4h-1.7V9Z" fill="currentColor" />
    </svg>
  );
}
