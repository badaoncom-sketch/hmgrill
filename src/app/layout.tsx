import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  { href: "/", label: "HOME" },
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
        <header className="sticky top-0 z-40 border-b border-[#f7e6c11f] bg-[#0d0d0df2] text-[#f7e6c1] backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <Link href="/" className="hm-link-focus flex items-center gap-3">
              <span className="relative grid h-11 w-11 overflow-hidden rounded-md border border-[#f7e6c133] bg-[#f7e6c1]">
                <Image
                  src="/images/brand/brand-logo-white.jpg"
                  alt="화목"
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </span>
              <span>
                <span className="block text-lg font-semibold text-[#f7e6c1]">
                  화목
                </span>
                <span className="block text-xs text-[#f7e6c1b3]">
                  장작구이 전문점
                </span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto pb-1 text-sm text-[#f7e6c1cc] lg:flex-wrap lg:overflow-visible lg:pb-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hm-link-focus shrink-0 rounded-md px-3 py-2 transition hover:bg-[#f7e6c11a] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="hm-link-focus shrink-0 rounded-md border border-[#f7e6c14d] px-3 py-2 text-[#f7e6c1] transition hover:border-[#f7e6c1] hover:bg-[#f7e6c114]"
              >
                로그인
              </Link>
            </nav>
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
