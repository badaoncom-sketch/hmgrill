import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertPublicSupabaseEnv } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const env = assertPublicSupabaseEnv();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Route Handlers and Server
          // Actions use this helper for session refresh flows.
        }
      },
    },
  });
}
