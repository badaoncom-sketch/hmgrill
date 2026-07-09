"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// 관리자 콘솔에서는 공개 사이트 크롬(푸터 등)을 렌더링하지 않는다.
// usePathname은 SSR에서도 값이 채워지므로 첫 화면부터 깜빡임 없이 적용된다.
export function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }
  return <>{children}</>;
}
