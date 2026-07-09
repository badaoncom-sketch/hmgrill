import { MapPin, Phone } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { siteContact } from "@/lib/navigation";

const fullAddress = `${siteContact.address} (우편번호 ${siteContact.postalCode})`;
const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(siteContact.address)}`;
const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(siteContact.address)}`;

// 비회원 쿠폰 화면 하단의 매장 안내: 지도 열기·전화·주소 복사를 한곳에서.
export function GuestStoreInfo() {
  return (
    <section className="mt-8 rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-[rgba(247,230,193,.24)] text-[var(--hm-accent-gold)]">
          <MapPin size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-[var(--hm-primary)]">
            화목 · 참나무 장작구이
          </p>
          <p className="mt-1 flex items-center gap-1 text-[13px] leading-5 text-[var(--hm-subtext)]">
            <span className="min-w-0">{fullAddress}</span>
            <CopyButton value={fullAddress} ariaLabel="주소 복사" />
          </p>
          <p className="mt-1 text-xs leading-5 text-white/45">
            {siteContact.hoursWeekday} · {siteContact.hoursWeekend}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <a
          href={kakaoMapUrl}
          target="_blank"
          rel="noreferrer"
          className="hm-link-focus inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[12px] bg-[#FEE500] text-[13px] font-extrabold text-[#191919] transition hover:brightness-95"
        >
          <MapPin size={15} aria-hidden="true" />
          카카오맵
        </a>
        <a
          href={naverMapUrl}
          target="_blank"
          rel="noreferrer"
          className="hm-link-focus inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[12px] bg-[#03C75A] text-[13px] font-extrabold text-white transition hover:brightness-95"
        >
          <MapPin size={15} aria-hidden="true" />
          네이버지도
        </a>
        <a
          href={siteContact.phoneHref}
          className="hm-link-focus inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[12px] border border-[rgba(247,230,193,.3)] text-[13px] font-extrabold text-[var(--hm-primary)] transition hover:bg-white/[0.05]"
        >
          <Phone size={15} aria-hidden="true" />
          전화 걸기
        </a>
      </div>
    </section>
  );
}
