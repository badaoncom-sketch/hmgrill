import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const runId = `${Date.now()}-${randomUUID().slice(0, 8)}`;
const created = {
  menuItemId: undefined,
  contentPostId: undefined,
  inquiryId: undefined,
  bannerId: undefined,
  popupId: undefined,
};

async function assertOk(label, result) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  return result.data;
}

async function cleanup() {
  if (created.menuItemId) {
    await supabase.from("menu_items").delete().eq("id", created.menuItemId);
  }
  if (created.contentPostId) {
    await supabase.from("content_posts").delete().eq("id", created.contentPostId);
  }
  if (created.inquiryId) {
    await supabase.from("inquiries").delete().eq("id", created.inquiryId);
  }
  if (created.bannerId) {
    await supabase.from("site_banners").delete().eq("id", created.bannerId);
  }
  if (created.popupId) {
    await supabase.from("site_popups").delete().eq("id", created.popupId);
  }
}

try {
  const menuItem = await assertOk(
    "create menu item",
    await supabase
      .from("menu_items")
      .insert({
        category: "사이드",
        name: `E2E 메뉴 ${runId}`,
        description: "E2E 생성",
        price: 1000,
        featured: false,
        is_active: true,
        sort_order: 990,
      })
      .select("id")
      .single(),
  );
  created.menuItemId = menuItem.id;

  await assertOk(
    "update menu item",
    await supabase
      .from("menu_items")
      .update({
        name: `E2E 메뉴 수정 ${runId}`,
        price: 2000,
        featured: true,
        is_active: false,
      })
      .eq("id", created.menuItemId),
  );

  const post = await assertOk(
    "create content post",
    await supabase
      .from("content_posts")
      .insert({
        type: "notice",
        title: `E2E 공지 ${runId}`,
        body: "E2E 생성",
        status: "draft",
        sort_order: 990,
      })
      .select("id")
      .single(),
  );
  created.contentPostId = post.id;

  await assertOk(
    "update content post",
    await supabase
      .from("content_posts")
      .update({
        title: `E2E 공지 수정 ${runId}`,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", created.contentPostId),
  );

  const inquiry = await assertOk(
    "create inquiry",
    await supabase
      .from("inquiries")
      .insert({
        name: `E2E 문의 ${runId}`,
        email: `hmgrill-content-e2e-${runId}@example.com`,
        message: "E2E 문의",
      })
      .select("id")
      .single(),
  );
  created.inquiryId = inquiry.id;

  await assertOk(
    "update inquiry",
    await supabase
      .from("inquiries")
      .update({
        status: "answered",
        admin_note: "E2E 답변",
        answered_at: new Date().toISOString(),
      })
      .eq("id", created.inquiryId),
  );

  const banner = await assertOk(
    "create banner",
    await supabase
      .from("site_banners")
      .insert({
        title: `E2E 배너 ${runId}`,
        body: "E2E 생성",
        placement: "home",
        is_active: true,
        sort_order: 990,
      })
      .select("id")
      .single(),
  );
  created.bannerId = banner.id;

  await assertOk(
    "update banner",
    await supabase
      .from("site_banners")
      .update({
        title: `E2E 배너 수정 ${runId}`,
        href: "/coupons",
        is_active: false,
      })
      .eq("id", created.bannerId),
  );

  const popup = await assertOk(
    "create popup",
    await supabase
      .from("site_popups")
      .insert({
        title: `E2E 팝업 ${runId}`,
        body: "E2E 생성",
        is_active: true,
        sort_order: 990,
      })
      .select("id")
      .single(),
  );
  created.popupId = popup.id;

  await assertOk(
    "update popup",
    await supabase
      .from("site_popups")
      .update({
        title: `E2E 팝업 수정 ${runId}`,
        href: "/support",
        is_active: false,
      })
      .eq("id", created.popupId),
  );

  const [updatedMenu, updatedPost, updatedInquiry, updatedBanner, updatedPopup] =
    await Promise.all([
      assertOk(
        "read updated menu",
        await supabase
          .from("menu_items")
          .select("name,price,featured,is_active")
          .eq("id", created.menuItemId)
          .single(),
      ),
      assertOk(
        "read updated post",
        await supabase
          .from("content_posts")
          .select("title,status")
          .eq("id", created.contentPostId)
          .single(),
      ),
      assertOk(
        "read updated inquiry",
        await supabase
          .from("inquiries")
          .select("status,admin_note")
          .eq("id", created.inquiryId)
          .single(),
      ),
      assertOk(
        "read updated banner",
        await supabase
          .from("site_banners")
          .select("title,href,is_active")
          .eq("id", created.bannerId)
          .single(),
      ),
      assertOk(
        "read updated popup",
        await supabase
          .from("site_popups")
          .select("title,href,is_active")
          .eq("id", created.popupId)
          .single(),
      ),
    ]);

  const ok =
    updatedMenu.name === `E2E 메뉴 수정 ${runId}` &&
    updatedMenu.price === 2000 &&
    updatedMenu.featured === true &&
    updatedMenu.is_active === false &&
    updatedPost.title === `E2E 공지 수정 ${runId}` &&
    updatedPost.status === "published" &&
    updatedInquiry.status === "answered" &&
    updatedInquiry.admin_note === "E2E 답변" &&
    updatedBanner.href === "/coupons" &&
    updatedBanner.is_active === false &&
    updatedPopup.href === "/support" &&
    updatedPopup.is_active === false;

  if (!ok) {
    throw new Error(
      `Unexpected content E2E state: ${JSON.stringify({
        updatedMenu,
        updatedPost,
        updatedInquiry,
        updatedBanner,
        updatedPopup,
      })}`,
    );
  }

  console.log(JSON.stringify({ ok: true, runId, created }, null, 2));
} finally {
  await cleanup();
  console.log(JSON.stringify({ cleanup: "complete", runId }, null, 2));
}
