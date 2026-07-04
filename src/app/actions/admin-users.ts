"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAccess } from "@/lib/auth/access";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/types";

const allowedRoles = new Set<UserRole>(["member", "staff", "admin"]);

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateUserRoleAction(formData: FormData) {
  const { canAccess } = await requireAdminAccess();

  if (!canAccess) {
    throw new Error("관리자 권한과 이메일 인증이 필요합니다.");
  }

  const userId = readString(formData, "userId");
  const role = readString(formData, "role") as UserRole;

  if (!userId || !allowedRoles.has(role)) {
    throw new Error("권한 변경 입력값을 확인해 주세요.");
  }

  const admin = createAdminClient();
  const { error: profileError } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (profileError) {
    throw profileError;
  }

  const { data: userData, error: userLookupError } =
    await admin.auth.admin.getUserById(userId);

  if (userLookupError || !userData.user) {
    throw userLookupError ?? new Error("Auth 사용자를 찾을 수 없습니다.");
  }

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...(userData.user.app_metadata ?? {}),
      role,
    },
  });

  if (authError) {
    throw authError;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/members");
  revalidatePath("/admin/staff");
}
