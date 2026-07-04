"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAccess } from "@/lib/auth/access";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContentPostType, ContentStatus, InquiryStatus } from "@/lib/types";

const contentTypes = new Set<ContentPostType>(["event", "notice"]);
const contentStatuses = new Set<ContentStatus>([
  "draft",
  "published",
  "archived",
]);
const inquiryStatuses = new Set<InquiryStatus>(["open", "answered", "closed"]);
const menuCategories = new Set(["대표메뉴", "전체메뉴", "세트메뉴", "사이드", "음료"]);

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readInteger(formData: FormData, key: string) {
  const value = Number.parseInt(readString(formData, key), 10);
  return Number.isFinite(value) ? value : 0;
}

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function nullable(value: string) {
  return value ? value : null;
}

async function requireContentAdmin() {
  const { user, canAccess } = await requireAdminAccess();

  if (!canAccess) {
    throw new Error("관리자 권한과 이메일 인증이 필요합니다.");
  }

  return user;
}

export async function createMenuItemAction(formData: FormData) {
  const user = await requireContentAdmin();
  const category = readString(formData, "category");
  const name = readString(formData, "name");
  const description = readString(formData, "description");
  const price = readInteger(formData, "price");

  if (!menuCategories.has(category) || !name || price < 0) {
    throw new Error("메뉴 입력값을 확인해 주세요.");
  }

  const { error } = await createAdminClient().from("menu_items").insert({
    category,
    name,
    description,
    price,
    featured: readBoolean(formData, "featured"),
    is_active: readBoolean(formData, "isActive"),
    sort_order: readInteger(formData, "sortOrder"),
    created_by: user.id,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/admin/menu");
}

export async function updateMenuItemStatusAction(formData: FormData) {
  await requireContentAdmin();
  const id = readString(formData, "id");

  if (!id) {
    throw new Error("메뉴 정보를 찾을 수 없습니다.");
  }

  const { error } = await createAdminClient()
    .from("menu_items")
    .update({
      is_active: readBoolean(formData, "isActive"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/admin/menu");
}

export async function updateMenuItemAction(formData: FormData) {
  await requireContentAdmin();
  const id = readString(formData, "id");
  const category = readString(formData, "category");
  const name = readString(formData, "name");
  const description = readString(formData, "description");
  const price = readInteger(formData, "price");

  if (!id || !menuCategories.has(category) || !name || price < 0) {
    throw new Error("메뉴 수정값을 확인해 주세요.");
  }

  const { error } = await createAdminClient()
    .from("menu_items")
    .update({
      category,
      name,
      description,
      price,
      featured: readBoolean(formData, "featured"),
      is_active: readBoolean(formData, "isActive"),
      sort_order: readInteger(formData, "sortOrder"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin/menu");
}

export async function createContentPostAction(formData: FormData) {
  const user = await requireContentAdmin();
  const type = readString(formData, "type") as ContentPostType;
  const status = readString(formData, "status") as ContentStatus;
  const title = readString(formData, "title");
  const body = readString(formData, "body");

  if (!contentTypes.has(type) || !contentStatuses.has(status) || !title) {
    throw new Error("콘텐츠 입력값을 확인해 주세요.");
  }

  const { error } = await createAdminClient().from("content_posts").insert({
    type,
    title,
    body,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    starts_at: nullable(readString(formData, "startsAt")),
    ends_at: nullable(readString(formData, "endsAt")),
    sort_order: readInteger(formData, "sortOrder"),
    created_by: user.id,
  });

  if (error) {
    throw error;
  }

  revalidatePath(type === "event" ? "/events" : "/notices");
  revalidatePath(type === "event" ? "/admin/events" : "/admin/notices");
}

export async function updateContentPostStatusAction(formData: FormData) {
  await requireContentAdmin();
  const id = readString(formData, "id");
  const type = readString(formData, "type") as ContentPostType;
  const status = readString(formData, "status") as ContentStatus;

  if (!id || !contentTypes.has(type) || !contentStatuses.has(status)) {
    throw new Error("콘텐츠 상태값을 확인해 주세요.");
  }

  const { error } = await createAdminClient()
    .from("content_posts")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath(type === "event" ? "/events" : "/notices");
  revalidatePath(type === "event" ? "/admin/events" : "/admin/notices");
}

export async function updateContentPostAction(formData: FormData) {
  await requireContentAdmin();
  const id = readString(formData, "id");
  const type = readString(formData, "type") as ContentPostType;
  const status = readString(formData, "status") as ContentStatus;
  const title = readString(formData, "title");
  const body = readString(formData, "body");

  if (!id || !contentTypes.has(type) || !contentStatuses.has(status) || !title) {
    throw new Error("콘텐츠 수정값을 확인해 주세요.");
  }

  const { error } = await createAdminClient()
    .from("content_posts")
    .update({
      title,
      body,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      starts_at: nullable(readString(formData, "startsAt")),
      ends_at: nullable(readString(formData, "endsAt")),
      sort_order: readInteger(formData, "sortOrder"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath(type === "event" ? "/events" : "/notices");
  revalidatePath(type === "event" ? "/admin/events" : "/admin/notices");
}

export async function submitInquiryAction(formData: FormData) {
  const name = readString(formData, "name");
  const email = readString(formData, "email");
  const message = readString(formData, "message");

  if (!name || !email || !message) {
    throw new Error("문의 입력값을 확인해 주세요.");
  }

  const { error } = await createAdminClient().from("inquiries").insert({
    name,
    email,
    message,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/admin/inquiries");
  redirect("/support?sent=1");
}

export async function updateInquiryStatusAction(formData: FormData) {
  await requireContentAdmin();
  const id = readString(formData, "id");
  const status = readString(formData, "status") as InquiryStatus;
  const adminNote = readString(formData, "adminNote");

  if (!id || !inquiryStatuses.has(status)) {
    throw new Error("문의 상태값을 확인해 주세요.");
  }

  const { error } = await createAdminClient()
    .from("inquiries")
    .update({
      status,
      admin_note: nullable(adminNote),
      answered_at: status === "answered" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/admin/inquiries");
}

export async function createSiteBannerAction(formData: FormData) {
  const user = await requireContentAdmin();
  const title = readString(formData, "title");

  if (!title) {
    throw new Error("배너 제목을 입력해 주세요.");
  }

  const { error } = await createAdminClient().from("site_banners").insert({
    title,
    body: readString(formData, "body"),
    image_url: nullable(readString(formData, "imageUrl")),
    href: nullable(readString(formData, "href")),
    placement: readString(formData, "placement") || "home",
    is_active: readBoolean(formData, "isActive"),
    starts_at: nullable(readString(formData, "startsAt")),
    ends_at: nullable(readString(formData, "endsAt")),
    sort_order: readInteger(formData, "sortOrder"),
    created_by: user.id,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin/banners");
}

export async function updateSiteBannerStatusAction(formData: FormData) {
  await requireContentAdmin();
  const id = readString(formData, "id");

  if (!id) {
    throw new Error("배너 정보를 찾을 수 없습니다.");
  }

  const { error } = await createAdminClient()
    .from("site_banners")
    .update({
      is_active: readBoolean(formData, "isActive"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin/banners");
}

export async function updateSiteBannerAction(formData: FormData) {
  await requireContentAdmin();
  const id = readString(formData, "id");
  const title = readString(formData, "title");

  if (!id || !title) {
    throw new Error("배너 수정값을 확인해 주세요.");
  }

  const { error } = await createAdminClient()
    .from("site_banners")
    .update({
      title,
      body: readString(formData, "body"),
      image_url: nullable(readString(formData, "imageUrl")),
      href: nullable(readString(formData, "href")),
      placement: readString(formData, "placement") || "home",
      is_active: readBoolean(formData, "isActive"),
      starts_at: nullable(readString(formData, "startsAt")),
      ends_at: nullable(readString(formData, "endsAt")),
      sort_order: readInteger(formData, "sortOrder"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin/banners");
}

export async function createSitePopupAction(formData: FormData) {
  const user = await requireContentAdmin();
  const title = readString(formData, "title");

  if (!title) {
    throw new Error("팝업 제목을 입력해 주세요.");
  }

  const { error } = await createAdminClient().from("site_popups").insert({
    title,
    body: readString(formData, "body"),
    href: nullable(readString(formData, "href")),
    is_active: readBoolean(formData, "isActive"),
    starts_at: nullable(readString(formData, "startsAt")),
    ends_at: nullable(readString(formData, "endsAt")),
    sort_order: readInteger(formData, "sortOrder"),
    created_by: user.id,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin/popups");
}

export async function updateSitePopupStatusAction(formData: FormData) {
  await requireContentAdmin();
  const id = readString(formData, "id");

  if (!id) {
    throw new Error("팝업 정보를 찾을 수 없습니다.");
  }

  const { error } = await createAdminClient()
    .from("site_popups")
    .update({
      is_active: readBoolean(formData, "isActive"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin/popups");
}

export async function updateSitePopupAction(formData: FormData) {
  await requireContentAdmin();
  const id = readString(formData, "id");
  const title = readString(formData, "title");

  if (!id || !title) {
    throw new Error("팝업 수정값을 확인해 주세요.");
  }

  const { error } = await createAdminClient()
    .from("site_popups")
    .update({
      title,
      body: readString(formData, "body"),
      href: nullable(readString(formData, "href")),
      is_active: readBoolean(formData, "isActive"),
      starts_at: nullable(readString(formData, "startsAt")),
      ends_at: nullable(readString(formData, "endsAt")),
      sort_order: readInteger(formData, "sortOrder"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin/popups");
}
