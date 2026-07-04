const apiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

if (!apiKey || !emailFrom) {
  console.error("Missing RESEND_API_KEY or EMAIL_FROM in .env.local.");
  process.exit(1);
}

function extractEmailAddress(value) {
  const unquoted = value.trim().replace(/^['"]|['"]$/g, "");
  const angleMatch = unquoted.match(/<([^>]+)>/);
  return (angleMatch?.[1] ?? unquoted).trim();
}

function getDomain(value) {
  const email = extractEmailAddress(value);
  const domain = email.split("@")[1]?.toLowerCase();
  return domain || "";
}

const fromDomain = getDomain(emailFrom);

if (!fromDomain) {
  console.error("EMAIL_FROM must contain a valid email address.");
  process.exit(1);
}

if (fromDomain === "example.com" || fromDomain.endsWith(".example.com")) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        domain: fromDomain,
        status: "placeholder_domain",
        message: "EMAIL_FROM still uses example.com. Set a real sending domain.",
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const response = await fetch("https://api.resend.com/domains?limit=100", {
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
});

if (!response.ok) {
  const body = await response.text();
  console.error(
    JSON.stringify(
      {
        ok: false,
        domain: fromDomain,
        status: "api_error",
        httpStatus: response.status,
        message: body.slice(0, 500),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const payload = await response.json();
const domains = Array.isArray(payload.data) ? payload.data : [];
const matchedDomain = domains.find((domain) => domain.name === fromDomain);

if (!matchedDomain) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        domain: fromDomain,
        status: "not_found",
        message: "No matching domain found in Resend for EMAIL_FROM.",
        availableDomains: domains.map((domain) => ({
          name: domain.name,
          status: domain.status,
          sending: domain.capabilities?.sending,
        })),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const ok =
  matchedDomain.status === "verified" &&
  matchedDomain.capabilities?.sending === "enabled";

console.log(
  JSON.stringify(
    {
      ok,
      domain: fromDomain,
      status: matchedDomain.status,
      sending: matchedDomain.capabilities?.sending,
      receiving: matchedDomain.capabilities?.receiving,
      region: matchedDomain.region,
    },
    null,
    2,
  ),
);

if (!ok) {
  process.exit(1);
}
