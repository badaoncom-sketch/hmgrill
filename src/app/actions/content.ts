"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAccess } from "@/lib/auth/access";
import { SITE_SETTINGS_CACHE_TAG, siteSettingKeys } from "@/lib/site-settings";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContentPostType, ContentStatus, InquiryStatus } from "@/lib/types";

const contentTypes = new Set<ContentPostType>(["event", "notice"]);
const contentStatuses = new Set<ContentStatus>([
  "draft",
  "published",
  "archived",
]);
const inquiryStatuses = new Set<InquiryStatus>(["open", "answered", "closed"]);

async function assertMenuCategory(category: string) {
  const { data, error } = await createAdminClient()
    .from("menu_categories")
    .select("id")
    .eq("name", category)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("존재하지 않는 카테고리입니다. 카테고리를 먼저 등록해 주세요.");
  }
}

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

function readImagePath(formData: FormData, key: string) {
  const value = readString(formData, key);

  if (!value) {
    return null;
  }

  if (!value.startsWith("/images/") && !value.startsWith("https://")) {
    throw new Error("이미지 경로는 /images/ 또는 https:// 로 시작해야 합니다.");
  }

  return value;
}

const MAX_UPLOAD_IMAGE_BYTES = 8 * 1024 * 1024;

// 파일을 지정 버킷에 올리고 공개 URL을 돌려준다.
async function uploadImageFile(bucket: string, file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    throw new Error("이미지는 8MB 이하만 업로드할 수 있습니다.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type });

  if (error) {
    throw new Error(`이미지 업로드에 실패했습니다: ${error.message}`);
  }

  return admin.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// 폼에 업로드 파일이 있으면 스토리지에 올리고 공개 URL을 돌려준다. 없으면 null.
async function uploadMenuImage(formData: FormData, key: string) {
  const file = formData.get(key);

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return uploadImageFile("menu-images", file);
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
  const uploadedUrl = await uploadMenuImage(formData, "imageFile");
  const imageUrl = uploadedUrl ?? readImagePath(formData, "imageUrl");

  if (!name || price < 0) {
    throw new Error("메뉴 입력값을 확인해 주세요.");
  }
  await assertMenuCategory(category);

  const { error } = await createAdminClient().from("menu_items").insert({
    category,
    name,
    description,
    price,
    image_url: imageUrl,
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
  const uploadedUrl = await uploadMenuImage(formData, "imageFile");
  const imageUrl = uploadedUrl ?? readImagePath(formData, "imageUrl");

  if (!id || !name || price < 0) {
    throw new Error("메뉴 수정값을 확인해 주세요.");
  }
  await assertMenuCategory(category);

  const { error } = await createAdminClient()
    .from("menu_items")
    .update({
      category,
      name,
      description,
      price,
      image_url: imageUrl,
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

export async function deleteMenuItemAction(formData: FormData) {
  await requireContentAdmin();
  const id = readString(formData, "id");

  if (!id) {
    throw new Error("삭제할 메뉴를 찾을 수 없습니다.");
  }

  const { error } = await createAdminClient()
    .from("menu_items")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin/menu");
}

function revalidateMenuPaths() {
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin/menu");
}

export async function createMenuCategoryAction(formData: FormData) {
  await requireContentAdmin();
  const name = readString(formData, "name");

  if (!name) {
    throw new Error("카테고리 이름을 입력해 주세요.");
  }

  const admin = createAdminClient();
  const { data: last } = await admin
    .from("menu_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await admin.from("menu_categories").insert({
    name,
    sort_order: (last?.sort_order ?? -1) + 1,
  });

  if (error) {
    throw new Error(
      error.code === "23505" ? "이미 존재하는 카테고리입니다." : error.message,
    );
  }

  revalidateMenuPaths();
}

export async function renameMenuCategoryAction(formData: FormData) {
  await requireContentAdmin();
  const id = readString(formData, "id");
  const name = readString(formData, "name");

  if (!id || !name) {
    throw new Error("카테고리 이름을 입력해 주세요.");
  }

  const admin = createAdminClient();
  const { data: current, error: currentError } = await admin
    .from("menu_categories")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  if (currentError || !current) {
    throw currentError ?? new Error("카테고리를 찾을 수 없습니다.");
  }
  if (current.name === name) {
    return;
  }

  const { error: renameError } = await admin
    .from("menu_categories")
    .update({ name })
    .eq("id", id);

  if (renameError) {
    throw new Error(
      renameError.code === "23505"
        ? "이미 존재하는 카테고리 이름입니다."
        : renameError.message,
    );
  }

  // 메뉴는 카테고리를 이름으로 참조하므로 함께 갱신한다.
  const { error: syncError } = await admin
    .from("menu_items")
    .update({ category: name, updated_at: new Date().toISOString() })
    .eq("category", current.name);

  if (syncError) {
    throw syncError;
  }

  revalidateMenuPaths();
}

export async function moveMenuCategoryAction(formData: FormData) {
  await requireContentAdmin();
  const id = readString(formData, "id");
  const direction = readString(formData, "direction");

  if (!id || (direction !== "up" && direction !== "down")) {
    throw new Error("이동 방향이 올바르지 않습니다.");
  }

  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("menu_categories")
    .select("id,sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !rows) {
    throw error ?? new Error("카테고리를 불러오지 못했습니다.");
  }

  const index = rows.findIndex((row) => row.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || targetIndex < 0 || targetIndex >= rows.length) {
    return;
  }

  const current = rows[index];
  const neighbor = rows[targetIndex];
  // 정렬값을 인덱스 기준으로 재부여하며 두 항목을 교환한다.
  const updates = rows.map((row, rowIndex) => {
    const order =
      row.id === current.id ? targetIndex : row.id === neighbor.id ? index : rowIndex;
    return { id: row.id, order };
  });

  for (const update of updates) {
    const { error: updateError } = await admin
      .from("menu_categories")
      .update({ sort_order: update.order })
      .eq("id", update.id);

    if (updateError) {
      throw updateError;
    }
  }

  revalidateMenuPaths();
}

export async function deleteMenuCategoryAction(formData: FormData) {
  await requireContentAdmin();
  const id = readString(formData, "id");

  if (!id) {
    throw new Error("삭제할 카테고리를 찾을 수 없습니다.");
  }

  const admin = createAdminClient();
  const { data: category, error: categoryError } = await admin
    .from("menu_categories")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  if (categoryError || !category) {
    throw categoryError ?? new Error("카테고리를 찾을 수 없습니다.");
  }

  const { count } = await admin
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("category", category.name);

  if ((count ?? 0) > 0) {
    throw new Error(
      `'${category.name}' 카테고리를 사용하는 메뉴가 ${count}개 있습니다. 메뉴의 카테고리를 먼저 변경해 주세요.`,
    );
  }

  const { error } = await admin.from("menu_categories").delete().eq("id", id);

  if (error) {
    throw error;
  }

  revalidateMenuPaths();
}

export async function updateMenuCopyAction(formData: FormData) {
  await requireContentAdmin();
  const title = readString(formData, "title");
  const body = readString(formData, "body");

  if (!title) {
    throw new Error("메뉴 페이지 제목을 입력해 주세요.");
  }

  const { error } = await createAdminClient().from("site_copy").upsert({
    key: "menu",
    title,
    body: nullable(body),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  revalidateMenuPaths();
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireContentAdmin();
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const updates: { key: string; value: string; updated_at: string }[] = [];
  const resets: string[] = [];

  for (const key of siteSettingKeys) {
    // 업로드 파일이 있으면 그 값이 우선한다.
    const file = formData.get(`image:${key}`);
    if (file instanceof File && file.size > 0) {
      const url = await uploadImageFile("site-images", file);
      updates.push({ key, value: url, updated_at: now });
      continue;
    }

    if (formData.has(`text:${key}`)) {
      const value = readString(formData, `text:${key}`);
      if (value) {
        updates.push({ key, value, updated_at: now });
      } else {
        // 비우면 기본값으로 복원한다.
        resets.push(key);
      }
    }
  }

  if (updates.length > 0) {
    const { error } = await admin.from("site_settings").upsert(updates);
    if (error) {
      throw error;
    }
  }

  if (resets.length > 0) {
    const { error } = await admin
      .from("site_settings")
      .delete()
      .in("key", resets);
    if (error) {
      throw error;
    }
  }

  // 레이아웃·메타데이터가 쓰는 서버 캐시를 무효화해 저장 즉시 반영한다.
  updateTag(SITE_SETTINGS_CACHE_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/admin/home");
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
  const website = readString(formData, "website");

  if (website) {
    redirect("/support?sent=1");
  }

  if (
    !name ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    message.length < 10 ||
    message.length > 2000
  ) {
    throw new Error("문의 입력값을 확인해 주세요.");
  }

  const { error } = await createAdminClient().from("inquiries").insert({
    name,
    email: email.toLowerCase(),
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
