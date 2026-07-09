"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { adminNavItems } from "@/components/admin/admin-nav-items";
import { cn } from "@/lib/utils";

// 모바일·태블릿용 관리자 네비: 긴 가로 스크롤 대신
// 현재 섹션을 보여주고, 탭하면 전체 메뉴가 그리드로 펼쳐진다.
export function AdminMobileNav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const current =
    adminNavItems.find((item) => item.key === active) ?? adminNavItems[0];
  const CurrentIcon = current.icon;

  return (
    <nav className="mb-5 rounded-[20px] border border-[rgba(255,255,255,.08)] bg-black/30 p-2 xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="hm-link-focus flex min-h-11 w-full items-center justify-between gap-3 rounded-[14px] px-3 text-left"
      >
        <span className="flex items-center gap-2.5 text-sm font-extrabold text-[var(--hm-primary)]">
          <CurrentIcon className="h-[17px] w-[17px]" strokeWidth={1.9} aria-hidden="true" />
          {current.label}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-bold text-white/45">
          전체 메뉴
          <ChevronDown
            size={15}
            className={cn("transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </span>
      </button>

      {open ? (
        <div className="mt-1 grid grid-cols-2 gap-1 border-t border-[rgba(255,255,255,.06)] pt-2 sm:grid-cols-3">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const selected = item.key === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "hm-link-focus flex min-h-11 items-center gap-2.5 rounded-[12px] px-3 text-[13px] font-bold text-white/62 transition hover:bg-white/[0.05] hover:text-[var(--hm-primary)]",
                  selected && "bg-[var(--hm-primary)] text-[#0d0d0d] hover:bg-[var(--hm-primary)] hover:text-[#0d0d0d]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </nav>
  );
}
