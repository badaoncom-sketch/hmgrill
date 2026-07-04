import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  description: "단일 매장 운영을 위한 화목 공식 홈페이지와 QR 쿠폰 시스템",
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
        <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 text-sm font-bold text-white">
                HM
              </span>
              <span>
                <span className="block text-lg font-semibold text-neutral-950">
                  화목
                </span>
                <span className="block text-xs text-neutral-500">
                  QR 쿠폰 운영 홈페이지
                </span>
              </span>
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 transition hover:bg-neutral-100 hover:text-neutral-950"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 transition hover:border-neutral-950"
              >
                로그인
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t border-neutral-200 bg-neutral-950 text-neutral-300">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm sm:px-6 md:grid-cols-3 lg:px-8">
            <div>
              <p className="font-semibold text-white">화목</p>
              <p className="mt-2 text-neutral-400">
                단일 매장 운영에 맞춘 공식 홈페이지와 QR 쿠폰 시스템입니다.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white">운영 범위</p>
              <p className="mt-2 text-neutral-400">
                POS 연동 없이 직원모드에서 쿠폰 사용완료를 처리합니다.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white">관리</p>
              <div className="mt-2 flex gap-3">
                <Link href="/admin" className="hover:text-white">
                  관리자
                </Link>
                <Link href="/staff" className="hover:text-white">
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
