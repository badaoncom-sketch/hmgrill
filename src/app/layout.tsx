import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Menu, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
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
          <div className="hm-container grid gap-10 py-24 text-sm lg:grid-cols-[1.3fr_.75fr_.75fr_.75fr_1fr]">
            <div className="max-w-sm">
              <span className="relative block h-24 w-32">
                <Image
                  src="/images/brand/brand-logo-transparent.png"
                  alt="화목"
                  fill
                  sizes="128px"
                  className="object-contain object-left"
                />
              </span>
              <p className="mt-5 leading-7 text-[var(--hm-subtext)]">
                참나무 장작의 온기와 숙성 고기의 결을 연구하는 화목의 시간.
                따뜻한 불빛 아래에서 한 끼의 깊이를 전합니다.
              </p>
              <p className="mt-8 text-xs leading-6 text-white/38">
                상호명. 화목 | 대표. 홍길동 | 사업자등록번호. 123-45-67890
                <br />
                주소. 서울특별시 강남구 테헤란로 123
                <br />
                Copyright HWAMOK. All rights reserved.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-accent-gold)]">Company</p>
              <div className="mt-5 grid gap-3 text-[var(--hm-subtext)]">
                <Link href="/about" className="hm-link-focus hover:text-[var(--hm-primary)]">화목 소개</Link>
                <Link href="/store" className="hm-link-focus hover:text-[var(--hm-primary)]">매장 안내</Link>
                <Link href="/menu" className="hm-link-focus hover:text-[var(--hm-primary)]">대표 메뉴</Link>
                <Link href="/support" className="hm-link-focus hover:text-[var(--hm-primary)]">오시는 길</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-accent-gold)]">Customer</p>
              <div className="mt-5 grid gap-3 text-[var(--hm-subtext)]">
                <Link href="/notices" className="hm-link-focus hover:text-[var(--hm-primary)]">공지사항</Link>
                <Link href="/events" className="hm-link-focus hover:text-[var(--hm-primary)]">이벤트</Link>
                <Link href="/coupons" className="hm-link-focus hover:text-[var(--hm-primary)]">쿠폰</Link>
                <Link href="/support" className="hm-link-focus hover:text-[var(--hm-primary)]">1:1 문의</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-accent-gold)]">Policy</p>
              <div className="mt-5 grid gap-3 text-[var(--hm-subtext)]">
                <Link href="/support" className="hm-link-focus hover:text-[var(--hm-primary)]">이용약관</Link>
                <Link href="/support" className="hm-link-focus hover:text-[var(--hm-primary)]">개인정보처리방침</Link>
                <Link href="/support" className="hm-link-focus hover:text-[var(--hm-primary)]">쿠폰 이용 안내</Link>
                <Link href="/admin" className="hm-link-focus hover:text-[var(--hm-primary)]">운영 관리</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-accent-gold)]">Customer Center</p>
              <p className="mt-5 text-3xl font-bold text-[var(--hm-primary)]">02-1234-5678</p>
              <p className="mt-3 leading-6 text-[var(--hm-subtext)]">
                평일 10:00 - 22:00
                <br />
                주말 11:00 - 22:00
              </p>
              <div className="mt-5 flex gap-3 text-xs font-semibold text-[var(--hm-subtext)]">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--hm-border)]">IG</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--hm-border)]">FB</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--hm-border)]">YT</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
