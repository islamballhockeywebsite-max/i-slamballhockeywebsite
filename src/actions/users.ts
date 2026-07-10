"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getPublicEnv } from "@/lib/env";
import { requireAdmin } from "@/lib/auth/session";
import type { AppRole } from "@/lib/auth/session";

export type AppUserRow = {
  id: string;
  email: string | null;
  role: AppRole | null;
  createdAt: string;
  lastSignInAt: string | null;
};

/**
 * Listing auth users requires the Admin API (service role) — auth.users isn't exposed
 * through PostgREST. requireAdmin() gates this on the caller's RLS-verified role first.
 */
export async function listUsers(): Promise<AppUserRow[]> {
  await requireAdmin();
  const service = createServiceRoleClient();

  const { data: authUsers, error: authError } = await service.auth.admin.listUsers();
  if (authError) throw new Error(authError.message);

  const { data: roles, error: rolesError } = await service.from("user_roles").select("user_id, role");
  if (rolesError) throw new Error(rolesError.message);

  const roleByUserId = new Map(roles?.map((r) => [r.user_id, r.role as AppRole]));

  return authUsers.users
    .map((u) => ({
      id: u.id,
      email: u.email ?? null,
      role: roleByUserId.get(u.id) ?? null,
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
    }))
    .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));
}

export type InviteUserState = { error?: string; success?: boolean };

export async function inviteUser(
  prevState: InviteUserState,
  formData: FormData,
): Promise<InviteUserState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  if (!email) return { error: "Email is required." };
  if (role !== "admin" && role !== "scorekeeper") return { error: "Invalid role." };

  const service = createServiceRoleClient();
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

  const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  });
  if (error || !data.user) {
    return { error: error?.message ?? "Failed to invite user." };
  }

  const { error: roleError } = await service
    .from("user_roles")
    .upsert({ user_id: data.user.id, role });
  if (roleError) return { error: roleError.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export type AssignRoleState = { error?: string };

export async function assignRole(
  prevState: AssignRoleState,
  formData: FormData,
): Promise<AssignRoleState> {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userId || (role !== "admin" && role !== "scorekeeper")) {
    return { error: "Invalid request." };
  }

  const service = createServiceRoleClient();
  const { error } = await service.from("user_roles").upsert({ user_id: userId, role });
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return {};
}

/**
 * "Deactivate" removes the user_roles row rather than banning/deleting the auth account:
 * is_admin()/is_scorekeeper() immediately return false with no row, which is enough to
 * cut off all admin/scorekeeper access at the RLS layer without touching auth.users or
 * any historical actor_id references (audit_log, announcements.author_id, etc.).
 */
export async function deactivateUser(userId: string): Promise<void> {
  await requireAdmin();
  const service = createServiceRoleClient();
  const { error } = await service.from("user_roles").delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}
