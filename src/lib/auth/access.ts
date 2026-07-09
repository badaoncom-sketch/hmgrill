import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

type ProfileAccess = {
  user: User;
  profile: {
    role: UserRole;
    email_verified: boolean;
    status: "active" | "suspended" | "withdrawn";
  } | null;
};

export async function getCurrentProfileAccess(): Promise<ProfileAccess | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,email_verified,status")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile,
  };
}

export async function requireAdminAccess() {
  const access = await getCurrentProfileAccess();

  if (!access) {
    redirect("/login");
  }

  return {
    ...access,
    canAccess:
      access.profile?.email_verified === true &&
      access.profile.role === "admin" &&
      access.profile.status === "active",
  };
}

export async function requireStaffAccess() {
  const access = await getCurrentProfileAccess();

  if (!access) {
    redirect("/login");
  }

  return {
    ...access,
    canAccess:
      access.profile?.email_verified === true &&
      (access.profile.role === "staff" || access.profile.role === "admin") &&
      access.profile.status === "active",
  };
}
