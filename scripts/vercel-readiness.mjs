import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "EMAIL_FROM",
];

function readLocalEnv() {
  if (!existsSync(".env.local")) {
    return new Map();
  }

  const env = new Map();
  const text = readFileSync(".env.local", "utf8");

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match) {
      env.set(match[1], match[2].trim().replace(/^['"]|['"]$/g, ""));
    }
  }

  return env;
}

function extractEmailAddress(value) {
  const angleMatch = value.match(/<([^>]+)>/);
  return (angleMatch?.[1] ?? value).trim();
}

function getEmailDomain(value) {
  return extractEmailAddress(value).split("@")[1]?.toLowerCase() ?? "";
}

const localEnv = readLocalEnv();
const missingEnv = requiredEnv.filter((key) => !localEnv.get(key));
const siteUrl = localEnv.get("NEXT_PUBLIC_SITE_URL") ?? "";
const emailFrom = localEnv.get("EMAIL_FROM") ?? "";
const emailFromDomain = getEmailDomain(emailFrom);
const vercelCli = spawnSync("vercel", ["--version"], {
  encoding: "utf8",
});
const hasVercelProject = existsSync(".vercel/project.json");

const checks = {
  requiredEnv: missingEnv.length === 0,
  productionSiteUrl:
    Boolean(siteUrl) &&
    !siteUrl.includes("localhost") &&
    !siteUrl.includes("127.0.0.1"),
  productionEmailFrom:
    Boolean(emailFrom) &&
    Boolean(emailFromDomain) &&
    emailFromDomain !== "example.com" &&
    !emailFromDomain.endsWith(".example.com"),
  vercelCliInstalled: vercelCli.status === 0,
  vercelProjectLinked: hasVercelProject,
};

console.log(
  JSON.stringify(
    {
      ok: Object.values(checks).every(Boolean),
      checks,
      missingEnv,
      siteUrl: siteUrl ? siteUrl.replace(/:\/\/.*$/, "://***") : "",
      emailFromDomain,
      vercelCliVersion:
        vercelCli.status === 0 ? vercelCli.stdout.trim() || vercelCli.stderr.trim() : null,
    },
    null,
    2,
  ),
);

if (!Object.values(checks).every(Boolean)) {
  process.exit(1);
}
