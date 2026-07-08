"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useMounted } from "@/lib/use-mounted";

// 모바일은 아래에서 올라오는 시트, sm 이상은 중앙 다이얼로그로 상세 내용을 보여준다.
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

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[75]">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-[24px] border-t border-[rgba(247,230,193,.18)] bg-[var(--hm-background)] max-sm:animate-[hm-sheet-up_.26s_ease] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[86vh] sm:w-[min(680px,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px] sm:border sm:shadow-[0_30px_90px_rgba(0,0,0,.6)]"
      >
        <div className="shrink-0">
          <span
            aria-hidden="true"
            className="mx-auto mt-3 block h-1 w-10 rounded-full bg-white/20 sm:hidden"
          />
          <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-3 sm:pt-4">
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
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(20px,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
