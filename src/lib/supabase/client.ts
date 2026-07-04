"use client";

import { createBrowserClient } from "@supabase/ssr";
import { assertPublicSupabaseEnv } from "@/lib/env";

export function createClient() {
  const env = assertPublicSupabaseEnv();

  return createBrowserClient(env.url, env.anonKey);
}
