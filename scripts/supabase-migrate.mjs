import { spawnSync } from "node:child_process";

const isDryRun = process.argv.includes("--dry-run");

function getProjectRefFromUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    return undefined;
  }

  try {
    const host = new URL(url).hostname;
    return host.endsWith(".supabase.co") ? host.split(".")[0] : undefined;
  } catch {
    return undefined;
  }
}

function getDatabaseUrl() {
  if (process.env.SUPABASE_POOLER_DB_URL) {
    return process.env.SUPABASE_POOLER_DB_URL;
  }

  if (process.env.SUPABASE_DB_URL) {
    return process.env.SUPABASE_DB_URL;
  }

  const projectRef = process.env.SUPABASE_PROJECT_REF || getProjectRefFromUrl();
  const password = process.env.SUPABASE_DB_PASSWORD;

  if (!projectRef || !password) {
    return undefined;
  }

  return `postgresql://postgres:${encodeURIComponent(
    password,
  )}@db.${projectRef}.supabase.co:5432/postgres`;
}

function runSupabase(args) {
  const result = spawnSync("supabase", args, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const dbUrl = getDatabaseUrl();

if (!dbUrl) {
  console.error(
    [
      "Missing Supabase migration credentials.",
      "Set SUPABASE_POOLER_DB_URL, SUPABASE_DB_URL, or set SUPABASE_PROJECT_REF and SUPABASE_DB_PASSWORD in .env.local.",
    ].join("\n"),
  );
  process.exit(1);
}

runSupabase(["--version"]);

const pushArgs = ["db", "push", "--db-url", dbUrl, "--yes"];

if (isDryRun) {
  pushArgs.push("--dry-run");
}

runSupabase(pushArgs);
runSupabase(["migration", "list", "--db-url", dbUrl]);

if (!isDryRun) {
  runSupabase([
    "db",
    "query",
    "--db-url",
    dbUrl,
    "select to_regclass('public.coupon_issues') as coupon_issues_table;",
  ]);
}
