import { createClient } from "@supabase/supabase-js";

const allowedRoles = new Set(["member", "staff", "admin"]);
const email = process.argv[2]?.trim();
const role = process.argv[3]?.trim() || "admin";
const shouldVerifyEmail = process.argv.includes("--verify-email");

if (!email || !allowedRoles.has(role)) {
  console.error(
    [
      "Usage: npm run admin:promote -- <email> [member|staff|admin] [--verify-email]",
      "Example: npm run admin:promote -- owner@example.com admin",
    ].join("\n"),
  );
  process.exit(1);
}

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

const { data: profile, error: profileLookupError } = await supabase
  .from("profiles")
  .select("id,email,role,email_verified")
  .eq("email", email)
  .maybeSingle();

if (profileLookupError) {
  console.error(profileLookupError.message);
  process.exit(1);
}

if (!profile) {
  console.error(`No profile found for ${email}. Sign up first, then promote.`);
  process.exit(1);
}

const profileUpdate = {
  role,
  ...(shouldVerifyEmail ? { email_verified: true } : {}),
};
const { error: profileUpdateError } = await supabase
  .from("profiles")
  .update(profileUpdate)
  .eq("id", profile.id);

if (profileUpdateError) {
  console.error(profileUpdateError.message);
  process.exit(1);
}

const { data: userData, error: userLookupError } =
  await supabase.auth.admin.getUserById(profile.id);

if (userLookupError || !userData.user) {
  console.error(userLookupError?.message ?? "Auth user not found.");
  process.exit(1);
}

const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
  profile.id,
  {
    app_metadata: {
      ...(userData.user.app_metadata ?? {}),
      role,
    },
    ...(shouldVerifyEmail ? { email_confirm: true } : {}),
  },
);

if (authUpdateError) {
  console.error(authUpdateError.message);
  process.exit(1);
}

console.log(
  [
    `Updated ${email}`,
    `role: ${profile.role} -> ${role}`,
    `email_verified: ${
      shouldVerifyEmail ? `${profile.email_verified} -> true` : profile.email_verified
    }`,
  ].join("\n"),
);
