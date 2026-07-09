"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { getSiteUrl } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type GuestClaimQrState = {
  ok: boolean;
  message: string;
  issueId?: string;
  claimToken?: string;
  claimUrl?: string;
  qrDataUrl?: string;
  expiresAt?: string;
  issueName?: string;
  amount?: number;
};

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, message: "로그인이 필요합니다." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,email_verified")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile?.email_verified ||
    (profile.role !== "staff" && profile.role !== "admin")
  ) {
    return { user: null, message: "직원 또는 관리자 권한이 필요합니다." };
  }

  return { user, message: "" };
}

// 계산대: 감사쿠폰 발급 QR(1회용, 5분 유효)을 생성한다.
export async function createGuestClaimQrAction(
  _prevState: GuestClaimQrState,
  formData: FormData,
): Promise<GuestClaimQrState> {
  const auth = await requireStaff();
  if (!auth.user) return { ok: false, message: auth.message };

  const issueId = String(formData.get("issueId") ?? "").trim();
  if (!issueId) {
    return { ok: false, message: "발급할 캠페인을 선택해 주세요." };
  }

  const claimToken = `gcl_${randomBytes(16).toString("base64url")}`;
  const admin = createAdminClient();
  const { data: expiresAt, error } = await admin.rpc("create_guest_claim_token", {
    p_staff_id: auth.user.id,
    p_issue_id: issueId,
    p_token: claimToken,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  const { data: issue } = await admin
    .from("coupon_issues")
    .select("name,amount")
    .eq("id", issueId)
    .maybeSingle();

  const claimUrl = `${getSiteUrl()}/claim/${claimToken}`;
  const qrDataUrl = await QRCode.toDataURL(claimUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 420,
    color: { dark: "#171717", light: "#ffffff" },
  });

  return {
    ok: true,
    message: "",
    issueId,
    claimToken,
    claimUrl,
    qrDataUrl,
    expiresAt: String(expiresAt),
    issueName: issue?.name ?? "감사쿠폰",
    amount: issue?.amount ?? 0,
  };
}

// 키오스크가 발급 완료를 감지해 화면을 자동으로 닫을 수 있게 상태를 알려준다.
export async function checkGuestClaimAction(claimToken: string) {
  const auth = await requireStaff();
  if (!auth.user) return { claimed: false };

  const { data } = await createAdminClient()
    .from("guest_claim_tokens")
    .select("claimed_at")
    .eq("token", claimToken)
    .maybeSingle();

  return { claimed: Boolean(data?.claimed_at) };
}

// 손님: 발급 QR 스캔 후 [쿠폰 받기] — 성공하면 쿠폰 페이지로 이동한다.
export async function claimGuestCouponAction(
  _prevState: { ok: boolean; message: string },
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const claimToken = String(formData.get("claimToken") ?? "").trim();
  if (!claimToken) {
    return { ok: false, message: "유효하지 않은 발급 코드입니다." };
  }

  const couponToken = `cpn_${randomBytes(24).toString("base64url")}`;
  const { data, error } = await createAdminClient().rpc("claim_guest_coupon", {
    p_claim_token: claimToken,
    p_coupon_token: couponToken,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  redirect(`/c/${data}`);
}

export type GuestCouponStatusState = {
  ok: boolean;
  message: string;
  result?: {
    couponName: string;
    amount: number;
    statusLabel: "사용 가능" | "사용 완료" | "기간 만료";
    statusTone: "green" | "neutral" | "red";
    validUntil: string;
    usedAt: string | null;
    checkedAt: string;
  };
};

// 비회원 감사쿠폰 상태 조회: 쿠폰번호 8자리만으로 상태를 확인한다.
// QR·링크(소지자 비밀)는 노출하지 않고 상태 정보만 돌려준다.
export async function lookupGuestCouponStatusAction(
  _prevState: GuestCouponStatusState,
  formData: FormData,
): Promise<GuestCouponStatusState> {
  const number = String(formData.get("couponNumber") ?? "").replace(/\D/g, "");

  if (!/^[0-9]{8}$/.test(number)) {
    return { ok: false, message: "쿠폰번호 8자리를 입력해 주세요." };
  }

  const { data } = await createAdminClient()
    .from("member_coupons")
    .select("status,valid_until,used_at,revoked_at,source,coupon_issues(name,amount)")
    .eq("coupon_number", number)
    .eq("source", "guest_claim")
    .maybeSingle();

  if (!data) {
    return {
      ok: false,
      message: "해당 번호의 감사쿠폰을 찾을 수 없습니다. 번호를 다시 확인해 주세요.",
    };
  }

  const issue = Array.isArray(data.coupon_issues)
    ? data.coupon_issues[0]
    : data.coupon_issues;
  const expired =
    data.status === "expired" || new Date(data.valid_until) < new Date();
  const statusLabel =
    data.status === "used" ? "사용 완료" : expired ? "기간 만료" : "사용 가능";

  return {
    ok: true,
    message: "",
    result: {
      couponName: issue?.name ?? "감사쿠폰",
      amount: issue?.amount ?? 0,
      statusLabel,
      statusTone:
        statusLabel === "사용 가능"
          ? "green"
          : statusLabel === "사용 완료"
            ? "neutral"
            : "red",
      validUntil: data.valid_until,
      usedAt: data.used_at,
      checkedAt: new Date().toISOString(),
    },
  };
}
