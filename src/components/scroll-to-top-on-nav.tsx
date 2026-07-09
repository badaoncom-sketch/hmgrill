"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// 페이지 이동 시 항상 최상단부터 보이게 한다.
// (고정 헤더 + loading 화면 조합에서 Next 기본 스크롤 리셋이 어중간하게 동작하는 문제 보완)
// 뒤로가기/앞으로가기는 브라우저의 위치 복원을 존중해 강제 이동하지 않는다.
export function ScrollToTopOnNav() {
  const pathname = usePathname();
  const isHistoryNavRef = useRef(false);

  useEffect(() => {
    function onPopState() {
      isHistoryNavRef.current = true;
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (isHistoryNavRef.current) {
      isHistoryNavRef.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
