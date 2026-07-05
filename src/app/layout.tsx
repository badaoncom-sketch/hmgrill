import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { Camera, CirclePlay, Menu, MessageCircle, Share2, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

const navItems = [
  { href: "/about", label: "화목소개" },
  { href: "/menu", label: "메뉴" },
  { href: "/coupons", label: "쿠폰" },
  { href: "/events", label: "이벤트" },
  { href: "/notices", label: "공지사항" },
  { href: "/support", label: "고객센터" },
];

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
        <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-[var(--hm-border-soft)] bg-[rgba(13,13,13,.24)] text-[var(--hm-text)] backdrop-blur-md">
          <div className="hm-container grid h-full grid-cols-[auto_1fr_auto] items-center gap-4">
            <Link href="/" className="hm-link-focus flex items-center gap-3">
              <span className="relative block h-[66px] w-[96px]">
                <Image
                  src="/images/brand/brand-logo-transparent.png"
                  alt="화목"
                  fill
                  sizes="96px"
                  className="object-contain drop-shadow-[0_10px_26px_rgba(0,0,0,0.55)]"
                />
              </span>
            </Link>
            <nav className="hidden min-w-0 items-center justify-center gap-8 text-[13px] font-semibold text-white/82 lg:flex lg:gap-11">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hm-link-focus shrink-0 rounded-[14px] px-1 py-2 transition hover:text-[var(--hm-primary)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center justify-end gap-2 text-sm font-semibold">
              {user ? (
                <Link
                  href="/mypage"
                  className="hm-link-focus hidden rounded-[14px] px-3 py-2 text-[var(--hm-text)] transition hover:bg-white/[0.04] hover:text-[var(--hm-primary)] sm:inline-flex"
                >
                  마이페이지
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hm-link-focus hidden rounded-[14px] px-3 py-2 text-white/82 transition hover:text-[var(--hm-primary)] sm:inline-flex"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="hm-link-focus hidden rounded-[14px] border border-[rgba(247,230,193,.28)] px-4 py-2 text-[var(--hm-primary)] transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-primary)] hover:text-[var(--hm-background)] sm:inline-flex"
                  >
                    회원가입
                  </Link>
                </>
              )}
              <Link
                href={user ? "/mypage" : "/login"}
                className="hm-link-focus grid h-10 w-10 place-items-center rounded-[14px] text-[var(--hm-text)] transition hover:bg-white/[0.04] hover:text-[var(--hm-primary)] sm:hidden"
                aria-label={user ? "마이페이지" : "로그인"}
              >
                <UserRound size={22} aria-hidden="true" />
              </Link>
              <Link
                href="/menu"
                className="hm-link-focus grid h-10 w-10 place-items-center rounded-[14px] text-[var(--hm-text)] transition hover:bg-white/[0.04] hover:text-[var(--hm-primary)] lg:hidden"
                aria-label="메뉴 보기"
              >
                <Menu size={26} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </header>
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
                <Link
                  href="https://www.instagram.com"
                  className="hm-link-focus grid h-9 w-9 place-items-center rounded-full border border-[var(--hm-warm-border)] bg-[#15120e] transition hover:border-[rgba(247,230,193,.3)] hover:text-[var(--hm-primary)]"
                  aria-label="Instagram"
                >
                  <Camera size={16} aria-hidden="true" />
                </Link>
                <Link
                  href="https://www.facebook.com"
                  className="hm-link-focus grid h-9 w-9 place-items-center rounded-full border border-[var(--hm-warm-border)] bg-[#15120e] transition hover:border-[rgba(247,230,193,.3)] hover:text-[var(--hm-primary)]"
                  aria-label="Facebook"
                >
                  <Share2 size={16} aria-hidden="true" />
                </Link>
                <Link
                  href="https://www.youtube.com"
                  className="hm-link-focus grid h-9 w-9 place-items-center rounded-full border border-[var(--hm-warm-border)] bg-[#15120e] transition hover:border-[rgba(247,230,193,.3)] hover:text-[var(--hm-primary)]"
                  aria-label="YouTube"
                >
                  <CirclePlay size={17} aria-hidden="true" />
                </Link>
                <Link
                  href="/support"
                  className="hm-link-focus grid h-9 w-9 place-items-center rounded-full border border-[var(--hm-warm-border)] bg-[#15120e] transition hover:border-[rgba(247,230,193,.3)] hover:text-[var(--hm-primary)]"
                  aria-label="문의"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                </Link>
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
