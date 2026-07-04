const requiredServerEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
] as const;

export type RequiredServerEnv = (typeof requiredServerEnv)[number];

export function getMissingServerEnv(): RequiredServerEnv[] {
  return requiredServerEnv.filter((key) => !process.env[key]);
}

export function getPublicSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function assertPublicSupabaseEnv() {
  const env = getPublicSupabaseEnv();

  if (!env.url || !env.anonKey) {
    throw new Error("Supabase public environment variables are required.");
  }

  return {
    url: env.url,
    anonKey: env.anonKey,
  } satisfies { url: string; anonKey: string };
}
