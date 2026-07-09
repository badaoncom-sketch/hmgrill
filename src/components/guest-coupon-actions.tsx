"use client";

import { useState } from "react";
import { Check, ImageDown, Link2, Share2 } from "lucide-react";

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

      // 휴대폰: 파일 공유 시트를 열어 '이미지 저장'으로 갤러리에 바로 저장하게 한다.
      // (iOS는 download 속성으로 사진첩 저장이 안 되므로 이 경로가 표준이다)
      const file = new File([blob], fileName, { type: "image/png" });
      const isTouchDevice = navigator.maxTouchPoints > 0;
      if (
        isTouchDevice &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({ files: [file], title: "화목 감사쿠폰" });
          return;
        } catch (error) {
          if ((error as DOMException)?.name === "AbortError") {
            return; // 사용자가 공유 시트를 닫은 경우
          }
          // 공유 실패 시 아래 다운로드로 폴백
        }
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // 다운로드가 시작되기 전에 URL을 해제하면 일부 모바일 브라우저에서 실패한다.
      setTimeout(() => URL.revokeObjectURL(url), 5000);
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
    </div>
  );
}
