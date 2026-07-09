"use client";

import { useState } from "react";
import { Check, ImageDown, Link2, Share2, X } from "lucide-react";

// 비회원 쿠폰 보관 수단 3종: 이미지 저장(갤러리) / 기기 공유(카카오톡 등) / 링크 복사.
export function GuestCouponActions({
  couponName,
  amountText,
  couponNumber,
  validUntilText,
  conditionText,
  qrDataUrl,
  shareUrl,
}: {
  couponName: string;
  amountText: string;
  couponNumber: string;
  validUntilText: string;
  conditionText: string;
  qrDataUrl: string;
  shareUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  // 공유·다운로드가 막힌 인앱 브라우저(카카오톡 등)용: 이미지를 띄우고 길게 눌러 저장하게 한다.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 브랜드 티켓 디자인의 쿠폰 이미지를 캔버스로 합성해 갤러리에 저장한다.
  async function downloadImage() {
    setSaving(true);
    try {
      const width = 720;
      const height = 1000;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#211a11");
      gradient.addColorStop(0.6, "#0f0d0a");
      gradient.addColorStop(1, "#171009");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(247,230,193,.35)";
      ctx.lineWidth = 3;
      ctx.strokeRect(24, 24, width - 48, height - 48);

      const sans = "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#b8821e";
      ctx.font = `bold 26px ${sans}`;
      ctx.fillText("HWAMOK · 참나무 장작구이", width / 2, 92);

      ctx.fillStyle = "#ffffff";
      ctx.font = `bold 34px ${sans}`;
      ctx.fillText(couponName, width / 2, 156);

      ctx.fillStyle = "#f7e6c1";
      ctx.font = `bold 76px ${sans}`;
      ctx.fillText(amountText, width / 2, 248);

      // QR
      const qrSize = 340;
      const qrX = (width - qrSize) / 2;
      const qrY = 296;
      ctx.fillStyle = "#ffffff";
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 20);
        ctx.fill();
      } else {
        // 구형 브라우저: 둥근 모서리 미지원 시 일반 사각형으로 대체
        ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
      }

      const qrImage = new Image();
      qrImage.src = qrDataUrl;
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
      });
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = "rgba(255,255,255,.45)";
      ctx.font = `bold 22px ${sans}`;
      ctx.fillText("COUPON NO.", width / 2, qrY + qrSize + 70);
      ctx.fillStyle = "#f7e6c1";
      ctx.font = `bold 44px 'Courier New', monospace`;
      ctx.fillText(couponNumber.split("").join(" "), width / 2, qrY + qrSize + 122);

      ctx.fillStyle = "rgba(255,255,255,.6)";
      ctx.font = `bold 26px ${sans}`;
      ctx.fillText(`유효기간 ${validUntilText}`, width / 2, qrY + qrSize + 176);

      if (conditionText) {
        ctx.fillStyle = "rgba(255,255,255,.42)";
        ctx.font = `20px ${sans}`;
        const lines = conditionText.split("\n").slice(0, 2);
        lines.forEach((line, index) => {
          ctx.fillText(line.slice(0, 34), width / 2, qrY + qrSize + 216 + index * 30);
        });
      }

      ctx.fillStyle = "rgba(255,255,255,.3)";
      ctx.font = `18px ${sans}`;
      ctx.fillText("방문 시 이 이미지의 QR을 직원에게 보여주세요", width / 2, height - 56);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) return;

      const fileName = `화목-감사쿠폰-${couponNumber}.png`;
      const dataUrl = canvas.toDataURL("image/png");
      const isTouchDevice = navigator.maxTouchPoints > 0;
      // 카카오톡 등 인앱 브라우저는 파일 공유·download 링크를 지원하지 않는다.
      const isInAppBrowser = /KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\//i.test(
        navigator.userAgent,
      );

      // ① 데스크톱: 일반 다운로드
      if (!isTouchDevice) {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        // 다운로드가 시작되기 전에 URL을 해제하면 실패하는 브라우저가 있다.
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        return;
      }

      // ② 휴대폰(일반 브라우저): 파일 공유 시트 → '이미지 저장'으로 갤러리 저장
      if (
        !isInAppBrowser &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [new File([blob], fileName, { type: "image/png" })] })
      ) {
        try {
          await navigator.share({
            files: [new File([blob], fileName, { type: "image/png" })],
            title: "화목 감사쿠폰",
          });
          return;
        } catch (error) {
          if ((error as DOMException)?.name === "AbortError") {
            return; // 사용자가 공유 시트를 닫은 경우
          }
          // 공유가 거부되면 아래 길게 눌러 저장으로 폴백
        }
      }

      // ③ 인앱 브라우저·공유 미지원: 이미지를 전체 화면으로 띄워 길게 눌러 저장
      setPreviewUrl(dataUrl);
    } finally {
      setSaving(false);
    }
  }

  async function share() {
    const text = `화목 감사쿠폰 ${amountText} (${validUntilText})`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "화목 감사쿠폰", text, url: shareUrl });
        return;
      } catch {
        // 사용자가 공유를 취소한 경우 등 — 조용히 무시
        return;
      }
    }
    await copyLink();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="mt-5 grid grid-cols-3 gap-2">
      <button
        type="button"
        onClick={downloadImage}
        disabled={saving}
        className="hm-link-focus flex min-h-[74px] flex-col items-center justify-center gap-1.5 rounded-[16px] bg-[var(--hm-primary)] text-[12px] font-extrabold text-[#171009] transition hover:bg-[var(--hm-accent-gold)] hover:text-white disabled:opacity-60"
      >
        <ImageDown size={20} aria-hidden="true" />
        {saving ? "저장 중" : "이미지 저장"}
      </button>
      <button
        type="button"
        onClick={share}
        className="hm-link-focus flex min-h-[74px] flex-col items-center justify-center gap-1.5 rounded-[16px] border border-[rgba(247,230,193,.3)] text-[12px] font-extrabold text-[var(--hm-primary)] transition hover:bg-white/[0.05]"
      >
        <Share2 size={20} aria-hidden="true" />
        공유하기
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="hm-link-focus flex min-h-[74px] flex-col items-center justify-center gap-1.5 rounded-[16px] border border-[var(--hm-border)] text-[12px] font-extrabold text-white/65 transition hover:border-[rgba(247,230,193,.3)] hover:text-[var(--hm-primary)]"
      >
        {copied ? <Check size={20} aria-hidden="true" /> : <Link2 size={20} aria-hidden="true" />}
        {copied ? "복사 완료" : "링크 복사"}
      </button>

      {previewUrl ? (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black/92 p-4 backdrop-blur-[3px]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-[var(--hm-primary)]">쿠폰 이미지 저장</p>
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              aria-label="닫기"
              className="hm-link-focus grid size-10 place-items-center rounded-full bg-white/[0.08] text-white/70"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center py-4">
            {/* 길게 눌러 저장해야 하므로 next/image 대신 원본 img를 그대로 노출한다 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={`화목 감사쿠폰 ${couponNumber}`}
              className="max-h-full w-auto max-w-full rounded-[14px] shadow-[0_24px_80px_rgba(0,0,0,.6)]"
            />
          </div>
          <div className="rounded-[16px] border border-[rgba(247,230,193,.28)] bg-[#171009] p-4 text-center">
            <p className="text-[15px] font-bold text-[var(--hm-primary)]">
              위 이미지를 길게 눌러 주세요
            </p>
            <p className="mt-1.5 text-xs leading-5 text-white/60">
              메뉴가 뜨면 <span className="font-bold text-white/85">&lsquo;이미지 저장&rsquo;(사진에 저장)</span>을
              선택하면 갤러리에 저장됩니다.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
