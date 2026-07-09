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

const allowedStatuses = new Set(["active", "suspended", "withdrawn"]);

const statusBanDuration: Record<string, string> = {
  active: "none",
  suspended: "87600h", // 10년 — 해제 전까지 로그인 차단
  withdrawn: "87600h",
};

// 회원 계정 상태 변경: 정상/이용 중지/탈퇴.
// 정상이 아닌 상태는 Auth 차단(ban)까지 걸어 로그인 자체를 막는다.
export async function updateUserStatusAction(formData: FormData) {
  const access = await requireAdminAccess();

  if (!access.canAccess) {
    throw new Error("관리자 권한과 이메일 인증이 필요합니다.");
  }

  const userId = readString(formData, "userId");
  const status = readString(formData, "status");
  const note = readString(formData, "statusNote");

  if (!userId || !allowedStatuses.has(status)) {
    throw new Error("상태 변경 입력값을 확인해 주세요.");
  }

  if (userId === access.user.id) {
    throw new Error("본인 계정의 상태는 변경할 수 없습니다.");
  }

  const admin = createAdminClient();
  const { data: target } = await admin
    .from("profiles")
    .select("role,status")
    .eq("id", userId)
    .maybeSingle();

  if (!target) {
    throw new Error("대상 회원을 찾을 수 없습니다.");
  }

  if (target.role === "admin" && status !== "active") {
    throw new Error("관리자 계정은 먼저 권한을 회원/직원으로 변경한 뒤 상태를 바꿀 수 있습니다.");
  }

  const now = new Date().toISOString();
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      status,
      status_changed_at: now,
      status_note: note || null,
      updated_at: now,
    })
    .eq("id", userId);

  if (profileError) {
    throw profileError;
  }

  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: statusBanDuration[status],
  });

  if (banError) {
    throw banError;
  }

  revalidatePath("/admin/members");
  revalidatePath("/admin/staff");
}
