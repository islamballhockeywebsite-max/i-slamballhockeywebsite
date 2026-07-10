"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";

export type AuthActionState = {
  next: string;
  error?: string;
};

export async function signIn(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const next = String(formData.get("next") ?? "/admin");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { next, error: error.message };
  }

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type ResetRequestState = { error?: string; success?: boolean };

export async function requestPasswordReset(
  prevState: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export type SetPasswordState = { error?: string };

export async function setNewPassword(
  prevState: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/login");
}
