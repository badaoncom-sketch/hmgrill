"use client";

import { useState, type ReactNode } from "react";
import { CheckCircle2, Ticket } from "lucide-react";
import Link from "next/link";
import { BottomSheet } from "@/components/bottom-sheet";
import { Badge } from "@/components/ui/badge";

export type ShowcaseCoupon = {
  id: string;
  name: string;
  amountText: string;
  caption: string;
  lowStock: boolean;
  received: boolean;
  detail: ReactNode;
};

function CouponThumbnail({
  item,
  onSelect,
}: {
  item: ShowcaseCoupon;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`hm-link-focus relative overflow-hidden rounded-[18px] border p-4 text-left transition active:scale-[0.98] ${
        item.received
          ? "border-[var(--hm-border)] bg-[var(--hm-surface)] opacity-80"
          : "border-[rgba(247,230,193,.22)] bg-[var(--hm-surface)] shadow-[var(--hm-shadow)]"
      }`}
    >
      <Ticket
        size={64}
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-3 -right-3 rotate-[-12deg] text-white/[0.05]"
      />
      <div className="flex flex-wrap items-center gap-1.5">
        {item.received ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-200/80">
            <CheckCircle2 size={13} aria-hidden="true" />
            받음
          </span>
        ) : (
          <Badge tone="green">발행중</Badge>
        )}
        {item.lowStock && !item.received ? <Badge tone="red">마감 임박</Badge> : null}
      </div>
      <p className="mt-2.5 text-[21px] font-bold leading-none text-[var(--hm-primary)]">
        {item.amountText}
      </p>
      <p className="mt-1.5 line-clamp-2 text-[13px] font-bold leading-snug text-white/85">
        {item.name}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold text-white/42">{item.caption}</p>
    </button>
  );
}

// 모바일·태블릿용 쿠폰 썸네일 그리드. 카드를 누르면 시트에서 사용조건과 함께 상세를 보여준다.
export function CouponShowcase({
  newItems,
  receivedItems,
}: {
  newItems: ShowcaseCoupon[];
  receivedItems: ShowcaseCoupon[];
}) {
  const [selected, setSelected] = useState<ShowcaseCoupon | null>(null);

  return (
    <div>
      {newItems.length > 0 ? (
        <section>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-bold text-[var(--hm-text)]">
              받을 수 있는 쿠폰
            </h2>
            <p className="font-mono text-xs tracking-[0.12em] text-[var(--hm-accent-gold)]">
              {String(newItems.length).padStart(2, "0")}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {newItems.map((item) => (
              <CouponThumbnail
                key={item.id}
                item={item}
                onSelect={() => setSelected(item)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {receivedItems.length > 0 ? (
        <section className={newItems.length > 0 ? "mt-8" : ""}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-bold text-white/65">이미 받은 쿠폰</h2>
            <Link
              href="/coupons/my"
              className="hm-link-focus text-xs font-bold text-[var(--hm-accent-gold)] transition hover:text-[var(--hm-primary)]"
            >
              내 쿠폰에서 QR 보기
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {receivedItems.map((item) => (
              <CouponThumbnail
                key={item.id}
                item={item}
                onSelect={() => setSelected(item)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <BottomSheet
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="쿠폰 상세"
      >
        {selected?.detail}
      </BottomSheet>
    </div>
  );
}
