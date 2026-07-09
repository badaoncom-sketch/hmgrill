"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { mapMemberCoupon, memberCouponSelect } from "@/lib/coupons/db";
import { normalizeScanInput } from "@/lib/scan-input";
import type { CouponUseFlow, MemberCoupon } from "@/lib/types";

type StaffCouponRow = {
  coupon_issues:
    | {
        use_flow: CouponUseFlow;
      }
    | {
        use_flow: CouponUseFlow;
      }[]
    | null;
};

type StaffActionState = {
  ok: boolean;
  message: string;
  coupon?: MemberCoupon;
  canUse?: boolean;
};

function readToken(formData: FormData) {
  const value = formData.get("token");
  return typeof value === "string" ? value.trim() : "";
}

async function getCurrentStaff() {
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
      message: "이메일 인증 후 직원모드를 사용할 수 있습니다.",
    };
  }

  if (profile.role !== "staff" && profile.role !== "admin") {
    return {
      user: null,
      profile: null,
      message: "직원 또는 관리자 권한이 필요합니다.",
    };
  }

  return { user, profile, message: "" };
}

function getUseFlow(row: unknown) {
  const issue = (row as StaffCouponRow).coupon_issues;
  const value = Array.isArray(issue) ? issue[0] : issue;
  return value?.use_flow ?? "staff_confirm";
}

async function fetchCouponByToken(tokenOrNumber: string) {
  const admin = createAdminClient();
  const select = memberCouponSelect.replace(
    "coupon_issues(name,amount,condition_text,qr_notice)",
    "coupon_issues(name,amount,condition_text,qr_notice,use_flow)",
  ); // memberCouponSelect에 source가 포함되어 지급 쿠폰 여부를 함께 조회한다.
  // 스캐너 공백 제거 + 한글 자판 상태로 입력된 토큰을 QWERTY로 역변환한다.
  const input = normalizeScanInput(tokenOrNumber);
  // QR은 토큰을, 수동 입력은 쿠폰 하단의 8자리 쿠폰번호를 쓸 수 있게 둘 다 지원한다.
  const isCouponNumber = /^[0-9]{8}$/.test(input);

  let { data, error } = await admin
    .from("member_coupons")
    .select(select)
    .eq(isCouponNumber ? "coupon_number" : "token", input)
    .maybeSingle();

  // 일부 QR 리더기는 대문자 변환/Caps Lock 상태로 입력한다.
  // 토큰은 24바이트 난수라 대소문자 무시 매칭으로도 충돌 위험이 사실상 없다.
  if (!error && !data && !isCouponNumber) {
    const escaped = input.replace(/[\\%_]/g, (ch) => `\\${ch}`);
    ({ data, error } = await admin
      .from("member_coupons")
      .select(select)
      .ilike("token", escaped)
      .maybeSingle());
  }

  if (error) {
    return { coupon: undefined, useFlow: "staff_confirm" as CouponUseFlow, error };
  }

  if (!data) {
    return {
      coupon: undefined,
      useFlow: "staff_confirm" as CouponUseFlow,
      error: null,
    };
  }

  return {
    coupon: mapMemberCoupon(data),
    useFlow: getUseFlow(data),
    error: null,
  };
}

function isCouponUsable(coupon: MemberCoupon) {
  return coupon.status === "available" && new Date(coupon.validUntil) >= new Date();
}

export async function lookupCouponAction(
  _prevState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const auth = await getCurrentStaff();

  if (!auth.user) {
    return { ok: false, message: auth.message };
  }

  const token = readToken(formData);

  if (!token) {
    return { ok: false, message: "QR 쿠폰 토큰을 입력해 주세요." };
  }

  const lookup = await fetchCouponByToken(token);

  if (lookup.error) {
    return { ok: false, message: lookup.error.message };
  }

  if (!lookup.coupon) {
    return { ok: false, message: "쿠폰을 찾을 수 없습니다." };
  }

  if (lookup.useFlow === "auto_complete" && isCouponUsable(lookup.coupon)) {
    const admin = createAdminClient();
    const { error } = await admin.rpc("use_coupon", {
      p_staff_id: auth.user.id,
      p_token: lookup.coupon.token,
    });

    if (error) {
      return { ok: false, message: error.message, coupon: lookup.coupon };
    }

    const refreshed = await fetchCouponByToken(token);

    return {
      ok: true,
      message: "자동 사용완료 처리했습니다.",
      coupon: refreshed.coupon ?? lookup.coupon,
      canUse: false,
    };
  }

  return {
    ok: true,
    message: isCouponUsable(lookup.coupon)
      ? "사용 가능한 쿠폰입니다."
      : "사용할 수 없는 쿠폰입니다.",
    coupon: lookup.coupon,
    canUse: isCouponUsable(lookup.coupon),
  };
}

export async function useCouponAction(
  _prevState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const auth = await getCurrentStaff();

  if (!auth.user) {
    return { ok: false, message: auth.message };
  }

  const token = readToken(formData);

  if (!token) {
    return { ok: false, message: "QR 쿠폰 토큰을 입력해 주세요." };
  }

  const admin = createAdminClient();
  const { error } = await admin.rpc("use_coupon", {
    p_staff_id: auth.user.id,
    p_token: token,
  });

  const lookup = await fetchCouponByToken(token);

  if (error) {
    return {
      ok: false,
      message: error.message,
      coupon: lookup.coupon,
      canUse: lookup.coupon ? isCouponUsable(lookup.coupon) : false,
    };
  }

  return {
    ok: true,
    message: "쿠폰을 사용 완료 처리했습니다.",
    coupon: lookup.coupon,
    canUse: false,
  };
}
