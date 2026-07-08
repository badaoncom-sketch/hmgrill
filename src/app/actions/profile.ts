"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatPhoneNumber } from "@/lib/utils";

export type ContactActionState = {
  ok: boolean;
  message: string;
};

// 마이페이지에서 연락처·주소를 수정한다. 이름과 동의 이력은 바꾸지 않는다.
export async function updateContactInfoAction(
  _prevState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "로그인이 필요합니다." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("privacy_accepted_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.privacy_accepted_at) {
    return {
      ok: false,
      message: "쿠폰 수령 정보를 먼저 입력한 뒤 수정할 수 있습니다.",
    };
  }

  // 어떤 형태로 입력해도 010-0000-0000 형식으로 저장한다.
  const phone = formatPhoneNumber(String(formData.get("phone") ?? ""));
  const baseAddress = String(formData.get("address") ?? "").trim();
  const addressDetail = String(formData.get("addressDetail") ?? "").trim();
  const address = addressDetail ? `${baseAddress}, ${addressDetail}` : baseAddress;

  if (phone.replace(/\D/g, "").length < 9) {
    return { ok: false, message: "연락 가능한 휴대폰번호를 입력해 주세요." };
  }

  if (!baseAddress) {
    return { ok: false, message: "주소를 입력해 주세요." };
  }

  const { error } = await createAdminClient()
    .from("profiles")
    .update({
      phone,
      address,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/mypage");

  return { ok: true, message: "연락처와 주소를 수정했습니다." };
}

// 마케팅 수신 동의(선택)를 마이페이지에서 언제든 변경할 수 있게 한다.
export async function updateMarketingConsentAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const consent = formData.get("consent") === "1";
  const { error } = await createAdminClient()
    .from("profiles")
    .update({
      marketing_accepted_at: consent ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    throw error;
  }

  revalidatePath("/mypage");
}
