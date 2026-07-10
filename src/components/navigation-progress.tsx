"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// 페이지 이동이 시작되면 상단에 진행 바를 띄워
// "멈춘 것 같은" 순간에도 사이트가 동작 중임을 보여준다.
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const activeRef = useRef(false);
  const trickleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearTimers() {
      if (trickleTimer.current) clearInterval(trickleTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      trickleTimer.current = null;
      safetyTimer.current = null;
      hideTimer.current = null;
    }

    function finish() {
      if (!activeRef.current) return;
      activeRef.current = false;
      if (trickleTimer.current) clearInterval(trickleTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      setProgress(100);
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 260);
    }

    function start() {
      if (activeRef.current) return;
      activeRef.current = true;
      clearTimers();
      setVisible(true);
      setProgress(12);
      trickleTimer.current = setInterval(() => {
        setProgress((value) => value + (88 - value) * 0.12);
      }, 220);
      // 알 수 없는 이유로 완료 신호를 놓쳐도 바가 영원히 남지 않게 한다.
      safetyTimer.current = setTimeout(finish, 12_000);
    }

    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) return;

      const url = new URL(href, window.location.href);
      const samePath =
        url.pathname === window.location.pathname &&
        url.search === window.location.search;
      if (samePath) return;

      start();
    }

    function onPopState() {
      start();
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    window.__hmNavigationFinish = finish;
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      delete window.__hmNavigationFinish;
      clearTimers();
    };
  }, []);

  // 경로/쿼리가 실제로 바뀌면 이동 완료로 간주한다.
  useEffect(() => {
    const timer = setTimeout(() => {
      window.__hmNavigationFinish?.();
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]">
      {/* 그라데이션을 화면 폭 기준(100vw)으로 고정해, 바가 짧은 초반에도
          왼쪽은 항상 골드로 시작하고 밝은 크림 끝은 완료 직전에만 보인다. */}
      <div
        className="h-full rounded-r-full bg-[linear-gradient(90deg,var(--hm-accent-gold),var(--hm-primary))] bg-no-repeat [background-size:100vw_100%] shadow-[0_0_12px_rgba(184,130,30,.55)] transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

declare global {
  interface Window {
    __hmNavigationFinish?: () => void;
  }
}
