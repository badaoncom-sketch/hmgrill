"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useMounted } from "@/lib/use-mounted";

// 손을 뗐을 때 이 거리(px)를 넘게 끌어내렸으면 시트를 닫는다.
const DISMISS_THRESHOLD = 90;

// 모바일·태블릿은 아래에서 올라오는 시트(아래로 스와이프해 닫기 지원),
// PC(1024px+)는 중앙 다이얼로그로 상세 내용을 보여준다.
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const mounted = useMounted();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const dragYRef = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [snapping, setSnapping] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // 아래로 스와이프해 닫기 — 내용 스크롤이 맨 위일 때만 시트가 손가락을 따라 내려간다.
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;

    const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

    function onTouchStart(event: TouchEvent) {
      if (isDesktop() || event.touches.length !== 1) return;
      if ((scrollRef.current?.scrollTop ?? 0) > 0) {
        startYRef.current = null;
        return;
      }
      startYRef.current = event.touches[0].clientY;
      dragYRef.current = 0;
      setSnapping(false);
    }

    function onTouchMove(event: TouchEvent) {
      if (startYRef.current === null) return;
      const dy = event.touches[0].clientY - startYRef.current;
      const next = Math.max(0, dy);
      dragYRef.current = next;
      setDragY(next);
    }

    function onTouchEnd() {
      if (startYRef.current === null) return;
      startYRef.current = null;
      const distance = dragYRef.current;
      dragYRef.current = 0;

      if (distance > DISMISS_THRESHOLD) {
        onClose();
        setDragY(0);
      } else if (distance > 0) {
        setSnapping(true);
        setDragY(0);
      }
    }

    panel.addEventListener("touchstart", onTouchStart, { passive: true });
    panel.addEventListener("touchmove", onTouchMove, { passive: true });
    panel.addEventListener("touchend", onTouchEnd, { passive: true });
    panel.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      panel.removeEventListener("touchstart", onTouchStart);
      panel.removeEventListener("touchmove", onTouchMove);
      panel.removeEventListener("touchend", onTouchEnd);
      panel.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[75]">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-[2px]"
        style={{ opacity: dragY > 0 ? Math.max(0.35, 1 - dragY / 480) : undefined }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-[24px] border-t border-[rgba(247,230,193,.18)] bg-[var(--hm-background)] max-lg:animate-[hm-sheet-up_.26s_ease] lg:inset-auto lg:left-1/2 lg:top-1/2 lg:max-h-[86vh] lg:w-[min(680px,92vw)] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[24px] lg:border lg:shadow-[0_30px_90px_rgba(0,0,0,.6)]"
        style={
          dragY > 0 || snapping
            ? {
                transform: `translateY(${dragY}px)`,
                transition: snapping ? "transform 200ms ease" : "none",
              }
            : undefined
        }
        onTransitionEnd={() => setSnapping(false)}
      >
        <div className="shrink-0">
          <span
            aria-hidden="true"
            className="mx-auto mt-3 block h-1 w-10 rounded-full bg-white/20 lg:hidden"
          />
          <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-3 lg:pt-4">
            <p className="text-sm font-bold text-[var(--hm-primary)]">{title}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="hm-link-focus grid size-8 place-items-center rounded-full text-[var(--hm-subtext)] transition hover:bg-white/[0.06] hover:text-[var(--hm-primary)]"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(20px,env(safe-area-inset-bottom))] lg:px-6 lg:pb-6"
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
