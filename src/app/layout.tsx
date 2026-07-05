import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Menu, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  description: "장작불의 온기로 고기를 연구하는 화목 장작구이 전문점",
};

const navItems = [
  { href: "/about", label: "화목소개" },
  { href: "/menu", label: "메뉴" },
  { href: "/coupons", label: "쿠폰" },
  { href: "/events", label: "이벤트" },
  { href: "/notices", label: "공지사항" },
  { href: "/support", label: "고객센터" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <header className="sticky top-0 z-40 border-b border-[#f7e6c10f] bg-[#050403bf] text-[#faf7f2] backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2 sm:px-6 md:py-4 lg:px-8">
            <Link href="/" className="hm-link-focus flex items-center gap-3">
              <span className="relative block h-14 w-20 sm:h-16 sm:w-24 lg:h-20 lg:w-28">
                <Image
                  src="/images/brand/brand-logo-transparent.png"
                  alt="화목"
                  fill
                  sizes="(min-width: 1024px) 112px, 96px"
                  className="object-contain drop-shadow-[0_10px_26px_rgba(0,0,0,0.55)]"
                />
              </span>
            </Link>
            <nav className="col-span-3 row-start-2 flex items-center gap-4 overflow-x-auto border-t border-[#f7e6c114] pt-2 text-xs font-medium text-[#faf7f2] md:col-auto md:row-auto md:justify-center md:gap-8 md:overflow-visible md:border-0 md:pt-0 md:text-base lg:gap-12">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hm-link-focus shrink-0 rounded-md px-1 py-2 transition hover:text-[#f7e6c1]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center justify-end gap-2">
              <Link
                href="/login"
                className="hm-link-focus grid h-10 w-10 place-items-center rounded-md text-[#faf7f2] transition hover:bg-[#f7e6c114] hover:text-[#f7e6c1]"
                aria-label="로그인"
              >
                <UserRound size={22} aria-hidden="true" />
              </Link>
              <Link
                href="/menu"
                className="hm-link-focus grid h-10 w-10 place-items-center rounded-md text-[#faf7f2] transition hover:bg-[#f7e6c114] hover:text-[#f7e6c1]"
                aria-label="메뉴 보기"
              >
                <Menu size={26} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </header>
        <div className="hm-surface min-h-screen">{children}</div>
        <footer className="border-t border-[#f7e6c11f] bg-[#0d0d0d] text-[#f7e6c1cc]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
            <div>
              <p className="text-lg font-semibold text-[#f7e6c1]">화목</p>
              <p className="mt-2 leading-6 text-[#f7e6c199]">
                고기의 맛은 불에서 결정된다. 화목은 장작불의 온기와 숙성 고기의
                결을 연구하는 장작구이 전문점입니다.
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#f7e6c1]">브랜드 키워드</p>
              <p className="mt-2 leading-6 text-[#f7e6c199]">
                장작구이, 좋은 재료, 숙성 고기, 편안한 공간
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#f7e6c1]">운영</p>
              <div className="mt-2 flex gap-3">
                <Link href="/admin" className="hm-link-focus hover:text-white">
                  관리자
                </Link>
                <Link href="/staff" className="hm-link-focus hover:text-white">
                  직원모드
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
