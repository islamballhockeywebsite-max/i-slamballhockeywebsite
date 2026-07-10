import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "scorekeeper";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole(): Promise<AppRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return data?.role ?? null;
}

/**
 * Authoritative gate for /admin. Redirects to /login if unauthenticated, to /scorekeeper
 * if authenticated but not an admin. RLS remains the real backstop regardless.
 */
export async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect("/login?next=/admin");

  const role = await getUserRole();
  if (role !== "admin") redirect("/scorekeeper");

  return { user, role };
}

/** Admin implicitly has scorekeeper abilities, matching is_scorekeeper() in RLS. */
export async function requireScorekeeper() {
  const user = await getUser();
  if (!user) redirect("/login?next=/scorekeeper");

  const role = await getUserRole();
  if (role !== "admin" && role !== "scorekeeper") redirect("/login");

  return { user, role };
}
