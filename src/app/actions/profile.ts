"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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
