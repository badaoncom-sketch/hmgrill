"use client";

import { useState, type ReactNode } from "react";
import { QrCode } from "lucide-react";
import { BottomSheet } from "@/components/bottom-sheet";
import { Badge } from "@/components/ui/badge";

export type GalleryCoupon = {
  id: string;
  name: string;
  amountText: string;
  remainingText: string;
  couponNumber: string;
  gifted: boolean;
  detail: ReactNode;
};

// 발급받은 쿠폰을 썸네일 카드로 보여주고, 누르면 시트에서 QR 코드와 상세를 띄운다.
export function MyCouponGallery({ items }: { items: GalleryCoupon[] }) {
  const [selected, setSelected] = useState<GalleryCoupon | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item)}
            className="hm-link-focus hm-card-hover relative flex flex-col overflow-hidden rounded-[20px] border border-[rgba(247,230,193,.24)] bg-[linear-gradient(150deg,#211a11,#0e0c09_55%,#171009)] text-left shadow-[0_18px_50px_rgba(0,0,0,.38)] active:scale-[0.98]"
          >
            {/* 상단 골드 글로우 */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_60%_at_85%_0%,rgba(184,130,30,.16),transparent_70%)]"
            />

            <div className="relative flex-1 p-4">
              <div className="flex items-center justify-between gap-2">
                <Badge tone="green" className="whitespace-nowrap">
                  사용 가능
                </Badge>
                {item.gifted ? (
                  <span className="whitespace-nowrap text-[9px] font-bold text-[var(--hm-accent-gold)]">
                    화목이 드린 혜택
                  </span>
                ) : (
                  <span className="text-[9px] font-bold uppercase tracking-[0.26em] text-[var(--hm-accent-gold)]/85">
                    Hwamok
                  </span>
                )}
              </div>
              <p className="hm-serif mt-3.5 text-[24px] font-bold leading-none text-[var(--hm-primary)]">
                {item.amountText}
              </p>
              <p className="mt-2 line-clamp-2 text-[13px] font-bold leading-snug text-white/85">
                {item.name}
              </p>
            </div>

            {/* 절취선 + 펀치홀 */}
            <div className="relative" aria-hidden="true">
              <span className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[var(--hm-background)]" />
              <span className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[var(--hm-background)]" />
              <div className="mx-4 border-t border-dashed border-white/[0.16]" />
            </div>

            <div className="relative flex items-center justify-between gap-2 px-4 py-3">
              <span className="min-w-0 truncate text-[11px] font-semibold text-white/48">
                {item.remainingText}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-[var(--hm-primary)]">
                <span className="grid size-6 place-items-center rounded-[7px] bg-[var(--hm-primary)] text-[#171009]">
                  <QrCode size={14} aria-hidden="true" />
                </span>
                QR 보기
              </span>
            </div>
          </button>
        ))}
      </div>

      <BottomSheet
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `쿠폰 QR · No. ${selected.couponNumber}` : "쿠폰 QR"}
      >
        {selected?.detail}
      </BottomSheet>
    </>
  );
}
