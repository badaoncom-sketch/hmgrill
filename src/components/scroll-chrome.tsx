"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

// 스크롤이 멈춘 뒤 이 시간(ms)이 지나면 상·하단 바를 다시 보여준다.
const IDLE_DELAY_MS = 260;
// 이 위치(px)보다 위에서는 바를 숨기지 않는다.
const HIDE_AFTER_Y = 90;
// 위로가기 버튼이 나타나는 스크롤 위치.
const TOP_BUTTON_Y = 600;

// 모바일·태블릿에서 스크롤 중에는 상단 헤더·하단 탭을 숨기고(globals.css의
// html[data-hm-scrolling] 규칙), 멈추면 스르륵 복귀시킨다. 위로가기 버튼도 함께 관리.
export function ScrollChrome() {
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const setScrolling = (on: boolean) => {
      document.documentElement.toggleAttribute("data-hm-scrolling", on);
    };

    function onScroll() {
      setScrolling(window.scrollY > HIDE_AFTER_Y);
      setShowTopButton(false);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setScrolling(false);
        setShowTopButton(window.scrollY > TOP_BUTTON_Y);
      }, IDLE_DELAY_MS);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // 새로고침 직후 이미 스크롤된 위치라면 버튼을 바로 보여준다.
    idleTimer = setTimeout(() => {
      setShowTopButton(window.scrollY > TOP_BUTTON_Y);
    }, 0);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idleTimer) clearTimeout(idleTimer);
      setScrolling(false);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="맨 위로"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] right-4 z-40 grid size-11 place-items-center rounded-full border border-[rgba(247,230,193,.3)] bg-[#161310]/95 text-[var(--hm-primary)] shadow-[0_14px_36px_rgba(0,0,0,.45)] backdrop-blur transition-all duration-300 lg:hidden ${
        showTopButton
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp size={19} aria-hidden="true" />
    </button>
  );
}
