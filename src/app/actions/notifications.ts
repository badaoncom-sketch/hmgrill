"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function markNotificationReadAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { supabase, user } = await requireUser();

  if (id) {
    await supabase
      .from("member_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("member_id", user.id)
      .is("read_at", null);
  }

  revalidatePath("/", "layout");
}

export async function toggleNotificationArchiveAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const toArchive = String(formData.get("archived") ?? "") === "1";
  const { supabase, user } = await requireUser();

  if (id) {
    const now = new Date().toISOString();
    await supabase
      .from("member_notifications")
      .update({ archived_at: toArchive ? now : null })
      .eq("id", id)
      .eq("member_id", user.id);

    if (toArchive) {
      // 보관한 알림은 읽은 것으로 간주해 뱃지에서 제외한다.
      await supabase
        .from("member_notifications")
        .update({ read_at: now })
        .eq("id", id)
        .eq("member_id", user.id)
        .is("read_at", null);
    }
  }

  revalidatePath("/", "layout");
}

export async function deleteNotificationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { supabase, user } = await requireUser();

  if (id) {
    await supabase
      .from("member_notifications")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("member_id", user.id);
  }

  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  const { supabase, user } = await requireUser();

  await supabase
    .from("member_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("member_id", user.id)
    .is("read_at", null)
    .is("deleted_at", null);

  revalidatePath("/", "layout");
}
