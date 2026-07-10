import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * RSC / Server Action client — anon key + the caller's session cookie, RLS-enforced.
 * This is the default client for admin/scorekeeper mutations: routing them through RLS
 * (rather than the service-role client) means a bug that reaches this code path with the
 * wrong role still gets blocked at the database layer.
 */
export async function createClient() {
  const env = getPublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component that can't set cookies — safe to ignore
            // as long as middleware.ts is refreshing the session on every request.
          }
        },
      },
    },
  );
}
