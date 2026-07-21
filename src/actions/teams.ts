"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { teamFormSchema } from "@/lib/validation/team";
import { flattenZodFieldErrors } from "@/lib/validation/shared";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createTeam(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const parsed = teamFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("teams").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/teams");
  redirect("/admin/teams");
}

export async function updateTeam(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing team id." };

  const parsed = teamFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("teams").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/teams");
  revalidatePath(`/admin/teams/${id}`);
  redirect("/admin/teams");
}

export async function deleteTeam(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/teams");
  return {};
}
