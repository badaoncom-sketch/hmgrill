import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
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
        <footer className="border-t border-[var(--hm-border-soft)] bg-[var(--hm-background)] text-[#f7e6c1cc]">
          <div className="hm-container grid gap-12 py-20 md:grid-cols-[1.15fr_.8fr_.8fr_.8fr_1.25fr] lg:gap-16">
            <div className="pt-1">
              <span className="relative block h-[172px] w-[148px]">
                <Image
                  src="/images/brand/brand-logo-transparent.png"
                  alt="화목"
                  fill
                  sizes="148px"
                  className="object-contain object-left"
                />
              </span>
            </div>
            <div>
              <p className="hm-footer-heading">Company</p>
              <div className="mt-7 grid gap-4">
                <Link href="/about" className="hm-link-focus hm-footer-link">화목 소개</Link>
                <Link href="/store" className="hm-link-focus hm-footer-link">인사말</Link>
                <Link href="/menu" className="hm-link-focus hm-footer-link">매장 안내</Link>
                <Link href="/support" className="hm-link-focus hm-footer-link">오시는 길</Link>
              </div>
            </div>
            <div>
              <p className="hm-footer-heading">Customer</p>
              <div className="mt-7 grid gap-4">
                <Link href="/notices" className="hm-link-focus hm-footer-link">공지사항</Link>
                <Link href="/events" className="hm-link-focus hm-footer-link">이벤트</Link>
                <Link href="/support" className="hm-link-focus hm-footer-link">자주 묻는 질문</Link>
                <Link href="/support" className="hm-link-focus hm-footer-link">1:1 문의</Link>
              </div>
            </div>
            <div>
              <p className="hm-footer-heading">Policy</p>
              <div className="mt-7 grid gap-4">
                <Link href="/support" className="hm-link-focus hm-footer-link">이용약관</Link>
                <Link href="/support" className="hm-link-focus hm-footer-link">개인정보처리방침</Link>
                <Link href="/coupons" className="hm-link-focus hm-footer-link">쿠폰 이용 안내</Link>
                <Link href="/notices" className="hm-link-focus hm-footer-link">멤버십 안내</Link>
              </div>
            </div>
            <div>
              <p className="hm-footer-heading">Customer Center</p>
              <p className="mt-5 text-[34px] font-bold leading-none tracking-normal text-white">02-1234-5678</p>
              <p className="hm-caption mt-4 text-white/45">
                평일 10:00 - 22:00
                <br />
                주말/공휴일 11:00 - 22:00
              </p>
              <div className="mt-7 flex gap-4 text-[#8b7a62]">
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
          </div>
          <div className="border-t border-[var(--hm-warm-border)]">
            <div className="hm-container flex min-h-32 flex-col justify-center gap-2 py-9 text-xs font-semibold leading-6 text-white/35">
              <p>
                상호명. 화목 | 대표. 홍길동 | 사업자등록번호. 123-45-67890
              </p>
              <p>
                주소. 서울특별시 강남구 테헤란로 123, 4층 | 대표메일. hwamok@hwamok.com
              </p>
              <p>Copyright HWAMOK. All rights reserved.</p>
            </div>
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
