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
            className="hm-link-focus hm-card-hover relative overflow-hidden rounded-[18px] border border-[rgba(247,230,193,.22)] bg-[var(--hm-surface)] p-4 text-left shadow-[var(--hm-shadow)] active:scale-[0.98]"
          >
            <QrCode
              size={60}
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-2.5 -right-2.5 rotate-[-8deg] text-white/[0.06]"
            />
            <Badge tone="green">사용 가능</Badge>
            <p className="mt-2.5 text-[21px] font-bold leading-none text-[var(--hm-primary)]">
              {item.amountText}
            </p>
            <p className="mt-1.5 line-clamp-2 text-[13px] font-bold leading-snug text-white/85">
              {item.name}
            </p>
            <p className="mt-1.5 text-[11px] font-semibold text-white/42">
              {item.remainingText}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-[var(--hm-accent-gold)]">
              <QrCode size={13} aria-hidden="true" />
              탭하여 QR 보기
            </p>
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
