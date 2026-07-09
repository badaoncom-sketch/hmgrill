"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type GrantActionState = {
  ok: boolean;
  message: string;
};

export type GrantMemberResult = {
  id: string;
  name: string;
  memberUid: string;
  email: string;
  phone: string | null;
  createdAt: string;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function requireAdmin() {
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

  if (profile?.role !== "admin" || !profile.email_verified) {
    return { user: null, message: "관리자 권한이 필요합니다." };
  }

  return { user, message: "" };
}

function escapeLike(value: string) {
  return value.replace(/[%_\\]/g, (char) => `\\${char}`);
}

// 지급 대상 회원 검색: UID·이름·이메일·전화번호로 찾는다.
export async function searchGrantMembersAction(
  query: string,
): Promise<GrantMemberResult[]> {
  const auth = await requireAdmin();
  if (!auth.user) return [];

  const needle = query.trim();
  if (needle.length < 2) return [];

  const escaped = escapeLike(needle);
  const { data } = await createAdminClient()
    .from("profiles")
    .select("id,name,member_uid,email,phone,created_at")
    .or(
      `member_uid.ilike.%${escaped}%,name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%`,
    )
    .order("created_at", { ascending: false })
    .limit(8);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name ?? "(이름 없음)",
    memberUid: row.member_uid,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
  }));
}

function grantToken() {
  return `cpn_${randomBytes(24).toString("base64url")}`;
}

// 사전 발행된 지급 전용 쿠폰을 회원에게 지급한다.
export async function grantCouponAction(
  _prevState: GrantActionState,
  formData: FormData,
): Promise<GrantActionState> {
  const auth = await requireAdmin();
  if (!auth.user) return { ok: false, message: auth.message };

  const memberId = readString(formData, "memberId");
  const issueId = readString(formData, "issueId");
  const note = readString(formData, "note");

  if (!memberId || !issueId) {
    return { ok: false, message: "지급 대상 회원과 쿠폰을 선택해 주세요." };
  }

  const { error } = await createAdminClient().rpc("grant_coupon", {
    p_admin_id: auth.user.id,
    p_member_id: memberId,
    p_issue_id: issueId,
    p_token: grantToken(),
    p_note: note || null,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/admin/coupons");
  revalidatePath("/admin/coupons/grant");
  revalidatePath("/admin/coupons/grants");
  revalidatePath("/coupons/my");

  return { ok: true, message: "쿠폰을 지급했습니다. 회원에게 알림이 발송되었습니다." };
}

// 금액·쿠폰명·유효기간·사용조건을 즉석에서 입력해 지급한다.
export async function grantAdhocCouponAction(
  _prevState: GrantActionState,
  formData: FormData,
): Promise<GrantActionState> {
  const auth = await requireAdmin();
  if (!auth.user) return { ok: false, message: auth.message };

  const memberId = readString(formData, "memberId");
  const name = readString(formData, "name");
  const amount = Number.parseInt(readString(formData, "amount").replace(/\D/g, ""), 10);
  const validityDays = Number.parseInt(readString(formData, "validityDays"), 10);
  const conditionText = readString(formData, "conditionText");
  const note = readString(formData, "note");

  if (!memberId) {
    return { ok: false, message: "지급 대상 회원을 선택해 주세요." };
  }

  if (!name || !Number.isFinite(amount) || !Number.isFinite(validityDays)) {
    return { ok: false, message: "쿠폰명, 금액, 유효기간을 확인해 주세요." };
  }

  const { error } = await createAdminClient().rpc("grant_adhoc_coupon", {
    p_admin_id: auth.user.id,
    p_member_id: memberId,
    p_name: name,
    p_amount: amount,
    p_validity_days: validityDays,
    p_condition_text: conditionText || null,
    p_token: grantToken(),
    p_note: note || null,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/admin/coupons");
  revalidatePath("/admin/coupons/grant");
  revalidatePath("/admin/coupons/grants");
  revalidatePath("/coupons/my");

  return { ok: true, message: "쿠폰을 지급했습니다. 회원에게 알림이 발송되었습니다." };
}

// 미사용 지급 쿠폰을 회수한다. 회원에게 회수 알림이 발송된다.
export async function revokeGrantedCouponAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.user) {
    throw new Error(auth.message);
  }

  const memberCouponId = readString(formData, "memberCouponId");
  if (!memberCouponId) {
    throw new Error("회수할 쿠폰을 찾을 수 없습니다.");
  }

  const { error } = await createAdminClient().rpc("revoke_granted_coupon", {
    p_admin_id: auth.user.id,
    p_member_coupon_id: memberCouponId,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/admin/coupons");
  revalidatePath("/admin/coupons/grant");
  revalidatePath("/admin/coupons/grants");
  revalidatePath("/coupons/my");
}
