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
const password = `Hm${randomUUID()}!1`;
const users = [
  { key: "admin", role: "admin", name: "E2E 관리자" },
  { key: "member", role: "member", name: "E2E 회원" },
  { key: "staff", role: "staff", name: "E2E 직원" },
];
const createdUsers = new Map();
let issueId;
let memberCouponId;
let token;

async function assertOk(label, result) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  return result.data;
}

async function createUser(user) {
  const email = `hmgrill-e2e-${runId}-${user.key}@example.com`;
  const data = await assertOk(
    `create ${user.key}`,
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: user.role },
    }),
  );

  createdUsers.set(user.key, { ...user, id: data.user.id, email });

  await assertOk(
    `insert profile ${user.key}`,
    await supabase.from("profiles").insert({
      id: data.user.id,
      role: user.role,
      name: user.name,
      phone: "010-0000-0000",
      address: "E2E 테스트 주소",
      privacy_accepted_at: new Date().toISOString(),
      profile_completed_at: new Date().toISOString(),
      email,
      email_verified: true,
    }),
  );
}

async function cleanup() {
  if (issueId) {
    await supabase.from("coupon_events").delete().eq("issue_id", issueId);
    await supabase.from("member_coupons").delete().eq("issue_id", issueId);
    await supabase.from("coupon_issues").delete().eq("id", issueId);
  }

  for (const user of createdUsers.values()) {
    await supabase.auth.admin.deleteUser(user.id);
  }
}

try {
  for (const user of users) {
    await createUser(user);
  }

  const admin = createdUsers.get("admin");
  const member = createdUsers.get("member");
  const staff = createdUsers.get("staff");

  issueId = await assertOk(
    "issue coupon",
    await supabase.rpc("issue_coupon", {
      p_admin_id: admin.id,
      p_name: `E2E 쿠폰 ${runId}`,
      p_amount: 1000,
      p_quantity: 3,
      p_validity_days: 7,
      p_condition_text: "E2E 테스트 조건",
      p_qr_notice: "E2E 테스트 QR 안내",
      p_redownload_policy: "after_use_allowed",
      p_use_flow: "staff_confirm",
    }),
  );

  await assertOk(
    "stop coupon",
    await supabase.rpc("stop_coupon_issue", {
      p_admin_id: admin.id,
      p_issue_id: issueId,
    }),
  );

  await assertOk(
    "resume coupon",
    await supabase.rpc("resume_coupon_issue", {
      p_admin_id: admin.id,
      p_issue_id: issueId,
    }),
  );

  token = `cpn_e2e_${runId}`;
  memberCouponId = await assertOk(
    "download coupon",
    await supabase.rpc("download_coupon", {
      p_member_id: member.id,
      p_issue_id: issueId,
      p_token: token,
    }),
  );

  await assertOk(
    "use coupon",
    await supabase.rpc("use_coupon", {
      p_staff_id: staff.id,
      p_token: token,
    }),
  );

  const issue = await assertOk(
    "read issue",
    await supabase
      .from("coupon_issues")
      .select("downloaded_count,used_count,status,end_reason")
      .eq("id", issueId)
      .single(),
  );
  const memberCoupon = await assertOk(
    "read member coupon",
    await supabase
      .from("member_coupons")
      .select("status,used_by_staff_id,coupon_number")
      .eq("id", memberCouponId)
      .single(),
  );
  const memberProfile = await assertOk(
    "read member profile",
    await supabase
      .from("profiles")
      .select("member_uid")
      .eq("id", member.id)
      .single(),
  );
  const events = await assertOk(
    "read events",
    await supabase
      .from("coupon_events")
      .select("event_type")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true }),
  );

  const eventTypes = events.map((event) => event.event_type);
  const requiredEvents = [
    "issue_created",
    "issue_stopped",
    "issue_resumed",
    "coupon_downloaded",
    "coupon_used",
  ];
  const missingEvents = requiredEvents.filter((event) => !eventTypes.includes(event));

  if (
    issue.downloaded_count !== 1 ||
    issue.used_count !== 1 ||
    issue.status !== "issuing" ||
    memberCoupon.status !== "used" ||
    memberCoupon.used_by_staff_id !== staff.id ||
    !/^[0-9]{8}$/.test(memberCoupon.coupon_number) ||
    !/^[0-9]{8}$/.test(memberProfile.member_uid) ||
    missingEvents.length > 0
  ) {
    throw new Error(
      `Unexpected E2E state: ${JSON.stringify({
        issue,
        memberCoupon,
        memberProfile,
        eventTypes,
        missingEvents,
      })}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        issueId,
        memberCouponId,
        memberUid: memberProfile.member_uid,
        couponNumber: memberCoupon.coupon_number,
        eventTypes,
        cleanup: "pending",
      },
      null,
      2,
    ),
  );
} finally {
  await cleanup();
  console.log(JSON.stringify({ cleanup: "complete", runId }, null, 2));
}
