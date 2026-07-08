"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MoreVertical } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui/spinner";

const MenuCloseContext = createContext<() => void>(() => {});

// 행 우측의 ⋯ 버튼 하나로 액션(서버 액션 폼)들을 모아 보여주는 팝오버.
export function RowActionsMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="알림 관리"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="hm-link-focus grid h-9 w-9 place-items-center rounded-[10px] text-white/40 transition hover:bg-white/[0.06] hover:text-[var(--hm-primary)]"
      >
        <MoreVertical size={17} aria-hidden="true" />
      </button>
      {open ? (
        <MenuCloseContext.Provider value={() => setOpen(false)}>
          <div className="absolute right-0 top-[calc(100%+4px)] z-30 min-w-[160px] overflow-hidden rounded-[14px] border border-[rgba(247,230,193,.16)] bg-[#161310] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            {children}
          </div>
        </MenuCloseContext.Provider>
      ) : null}
    </div>
  );
}

export function MenuSubmitButton({
  children,
  danger = false,
}: {
  children: ReactNode;
  danger?: boolean;
}) {
  const { pending } = useFormStatus();
  const close = useContext(MenuCloseContext);

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={() => {
        // 제출이 먼저 시작되도록 잠시 뒤 메뉴를 닫는다.
        setTimeout(close, 250);
      }}
      className={`hm-link-focus flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[13px] font-semibold transition disabled:opacity-60 ${
        danger
          ? "text-[#f0a39b] hover:bg-[rgba(198,59,45,.12)]"
          : "text-white/75 hover:bg-white/[0.06] hover:text-[var(--hm-primary)]"
      }`}
    >
      {pending ? <Spinner className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}
