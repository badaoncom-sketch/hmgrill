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

type VerifiedProfile = {
  id: string;
  role: "member" | "staff" | "admin";
  email_verified: boolean;
  name: string | null;
  phone: string | null;
  address: string | null;
  privacy_accepted_at: string | null;
  profile_completed_at: string | null;
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
    .select("id,role,email_verified,name,phone,address,privacy_accepted_at,profile_completed_at")
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

function hasCouponProfile(profile: VerifiedProfile) {
  return Boolean(
    profile.name?.trim() &&
      profile.phone?.trim() &&
      profile.address?.trim() &&
      profile.privacy_accepted_at,
  );
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

  if (!auth.user || !auth.profile) {
    return { ok: false, message: auth.message };
  }

  const issueId = readString(formData, "issueId");

  if (!issueId) {
    return { ok: false, message: "쿠폰 정보를 찾을 수 없습니다." };
  }

  const admin = createAdminClient();

  if (!hasCouponProfile(auth.profile as VerifiedProfile)) {
    const name = readString(formData, "name");
    const phone = readString(formData, "phone");
    const baseAddress = readString(formData, "address");
    const addressDetail = readString(formData, "addressDetail");
    // 주소 검색으로 고른 기본 주소 뒤에 상세주소를 붙여 한 필드로 저장한다.
    const address = addressDetail
      ? `${baseAddress}, ${addressDetail}`
      : baseAddress;
    const privacyAccepted = formData.get("privacyAccepted") === "yes";
    // 마케팅 수신 동의는 선택 사항이다.
    const marketingAccepted = formData.get("marketingAccepted") === "yes";

    if (!name || !phone || !address || !privacyAccepted) {
      return {
        ok: false,
        message: "쿠폰을 받으려면 이름, 연락처, 주소와 개인정보처리 안내 동의가 필요합니다.",
      };
    }

    if (phone.replace(/\D/g, "").length < 9) {
      return {
        ok: false,
        message: "연락 가능한 휴대폰번호를 입력해 주세요.",
      };
    }

    const now = new Date().toISOString();
    const { error: profileUpdateError } = await admin
      .from("profiles")
      .update({
        name,
        phone,
        address,
        privacy_accepted_at: now,
        profile_completed_at: now,
        marketing_accepted_at: marketingAccepted ? now : null,
        updated_at: now,
      })
      .eq("id", auth.user.id);

    if (profileUpdateError) {
      return { ok: false, message: profileUpdateError.message };
    }
  } else if (formData.get("marketingAccepted") === "yes") {
    // 미동의 회원이 다운로드하면서 선택 동의한 경우. 기존 동의일은 덮어쓰지 않는다.
    await admin
      .from("profiles")
      .update({
        marketing_accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", auth.user.id)
      .is("marketing_accepted_at", null);
  }

  const token = `cpn_${randomBytes(24).toString("base64url")}`;
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
