"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";

// 당김 거리(px)가 이 값을 넘으면 손을 뗐을 때 새로고침한다.
const PULL_THRESHOLD = 72;
const MAX_PULL = 110;

// 모바일·태블릿에서 페이지 최상단을 아래로 당기면 서버 데이터를 다시 불러온다.
// 브라우저 기본 당김 새로고침은 globals.css의 overscroll-behavior로 꺼서 중복을 막는다.
export function PullToRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    function onTouchStart(event: TouchEvent) {
      if (
        refreshingRef.current ||
        event.touches.length !== 1 ||
        window.scrollY > 0 ||
        // 모달·드로어가 열려 본문 스크롤이 잠긴 동안에는 동작하지 않는다.
        document.body.style.overflow === "hidden"
      ) {
        startYRef.current = null;
        return;
      }
      startYRef.current = event.touches[0].clientY;
    }

    function onTouchMove(event: TouchEvent) {
      if (startYRef.current === null || refreshingRef.current) return;
      const dy = event.touches[0].clientY - startYRef.current;
      if (dy <= 0 || window.scrollY > 0) {
        if (pullRef.current > 0) {
          pullRef.current = 0;
          setPull(0);
        }
        return;
      }
      event.preventDefault();
      const next = Math.min(MAX_PULL, dy * 0.45);
      pullRef.current = next;
      setPull(next);
    }

    function onTouchEnd() {
      if (startYRef.current === null) return;
      startYRef.current = null;
      const distance = pullRef.current;
      pullRef.current = 0;

      if (distance >= PULL_THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        setPull(PULL_THRESHOLD);
        navigator.vibrate?.(10);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setPull(0);
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [router, startTransition]);

  // 서버 갱신이 끝나면 잠시 완료 상태를 보여준 뒤 접어 올린다.
  useEffect(() => {
    if (!refreshing || isPending) return;
    const timer = setTimeout(() => {
      refreshingRef.current = false;
      setRefreshing(false);
      setPull(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [refreshing, isPending]);

  const active = pull > 0 || refreshing;
  const progress = Math.min(1, pull / PULL_THRESHOLD);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-16 z-[45] flex justify-center md:top-20"
    >
      <div
        className={`grid size-11 place-items-center rounded-full border border-[rgba(247,230,193,.28)] bg-[#161310] text-[var(--hm-accent-gold)] shadow-[0_10px_30px_rgba(0,0,0,.45)] ${
          refreshing ? "" : "transition-transform duration-200"
        }`}
        style={{
          opacity: refreshing ? 1 : progress,
          transform: `translateY(${active ? pull - 48 : -56}px)`,
        }}
      >
        <RotateCw
          size={18}
          className={refreshing ? "animate-spin" : ""}
          style={refreshing ? undefined : { transform: `rotate(${pull * 2.4}deg)` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
