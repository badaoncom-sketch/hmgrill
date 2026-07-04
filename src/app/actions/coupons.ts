"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { CouponRedownloadPolicy, CouponUseFlow } from "@/lib/types";

type CouponActionState = {
  ok: boolean;
  message: string;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readInteger(formData: FormData, key: string) {
  const value = Number.parseInt(readString(formData, key), 10);
  return Number.isFinite(value) ? value : 0;
}

async function getCurrentVerifiedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, message: "로그인이 필요합니다." };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,role,email_verified")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { user: null, profile: null, message: error.message };
  }

  if (!profile?.email_verified) {
    return {
      user: null,
      profile: null,
      message: "이메일 인증 후 이용할 수 있습니다.",
    };
  }

  return { user, profile, message: "" };
}

export async function issueCouponAction(
  _prevState: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const auth = await getCurrentVerifiedUser();

  if (!auth.user || !auth.profile) {
    return { ok: false, message: auth.message };
  }

  if (auth.profile.role !== "admin") {
    return { ok: false, message: "관리자 권한이 필요합니다." };
  }

  const name = readString(formData, "name");
  const amount = readInteger(formData, "amount");
  const quantity = readInteger(formData, "quantity");
  const validityDays = readInteger(formData, "validityDays");
  const conditionText = readString(formData, "conditionText");
  const qrNotice = readString(formData, "qrNotice");
  const redownloadPolicy = readString(
    formData,
    "redownloadPolicy",
  ) as CouponRedownloadPolicy;
  const useFlow = readString(formData, "useFlow") as CouponUseFlow;

  if (!name || amount < 0 || quantity <= 0 || validityDays <= 0 || !qrNotice) {
    return { ok: false, message: "쿠폰 발행 입력값을 확인해 주세요." };
  }

  const admin = createAdminClient();
  const { error } = await admin.rpc("issue_coupon", {
    p_admin_id: auth.user.id,
    p_name: name,
    p_amount: amount,
    p_quantity: quantity,
    p_validity_days: validityDays,
    p_condition_text: conditionText,
    p_qr_notice: qrNotice,
    p_redownload_policy: redownloadPolicy,
    p_use_flow: useFlow,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/admin/coupons");
  revalidatePath("/coupons");

  return { ok: true, message: "쿠폰을 발행했습니다." };
}

export async function downloadCouponAction(
  _prevState: CouponActionState,
  formData: FormData,
): Promise<CouponActionState> {
  const auth = await getCurrentVerifiedUser();

  if (!auth.user) {
    return { ok: false, message: auth.message };
  }

  const issueId = readString(formData, "issueId");

  if (!issueId) {
    return { ok: false, message: "쿠폰 정보를 찾을 수 없습니다." };
  }

  const token = `cpn_${randomBytes(24).toString("base64url")}`;
  const admin = createAdminClient();
  const { error } = await admin.rpc("download_coupon", {
    p_member_id: auth.user.id,
    p_issue_id: issueId,
    p_token: token,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/coupons");
  revalidatePath("/coupons/my");
  revalidatePath("/coupons/history");

  return { ok: true, message: "쿠폰을 다운로드했습니다." };
}

export async function stopCouponIssueAction(formData: FormData) {
  const auth = await getCurrentVerifiedUser();

  if (!auth.user || auth.profile?.role !== "admin") {
    throw new Error(auth.message || "관리자 권한이 필요합니다.");
  }

  const issueId = readString(formData, "issueId");

  if (!issueId) {
    throw new Error("쿠폰 정보를 찾을 수 없습니다.");
  }

  const { error } = await createAdminClient().rpc("stop_coupon_issue", {
    p_admin_id: auth.user.id,
    p_issue_id: issueId,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/admin/coupons");
  revalidatePath("/coupons");
  revalidatePath("/");
}

export async function resumeCouponIssueAction(formData: FormData) {
  const auth = await getCurrentVerifiedUser();

  if (!auth.user || auth.profile?.role !== "admin") {
    throw new Error(auth.message || "관리자 권한이 필요합니다.");
  }

  const issueId = readString(formData, "issueId");

  if (!issueId) {
    throw new Error("쿠폰 정보를 찾을 수 없습니다.");
  }

  const { error } = await createAdminClient().rpc("resume_coupon_issue", {
    p_admin_id: auth.user.id,
    p_issue_id: issueId,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/admin/coupons");
  revalidatePath("/coupons");
  revalidatePath("/");
}
