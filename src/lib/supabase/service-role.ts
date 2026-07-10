import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv, getServerEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Service-role client — bypasses RLS entirely. Never import this from anything a client
 * component could pull in; `server-only` makes that a build error, not just a lint warning.
 *
 * Reserve this for operations RLS structurally can't express: CSV import bulk-upsert commits,
 * the historical-stats import, and true system/background operations with no authenticated
 * user context. Normal admin CRUD should go through lib/supabase/server.ts instead, so RLS's
 * is_admin() check remains a real security boundary rather than something only the app layer
 * enforces.
 */
export function createServiceRoleClient() {
  const publicEnv = getPublicEnv();
  const serverEnv = getServerEnv();

  return createSupabaseClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
