"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { seasonFormSchema, divisionFormSchema } from "@/lib/validation/season";
import { flattenZodFieldErrors } from "@/lib/validation/shared";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createSeason(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const parsed = seasonFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("seasons").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/seasons");
  redirect("/admin/seasons");
}

export async function updateSeason(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing season id." };

  const parsed = seasonFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("seasons").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/seasons");
  revalidatePath(`/admin/seasons/${id}`);
  redirect("/admin/seasons");
}

export async function setSeasonPlayoffsActive(id: string, active: boolean): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("seasons").update({ playoffs_active: active }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/seasons");
  return {};
}

export async function deleteSeason(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("seasons").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/seasons");
  return {};
}

export async function createDivision(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const seasonId = String(formData.get("season_id") ?? "");
  if (!seasonId) return { error: "Missing season id." };

  const parsed = divisionFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase
    .from("divisions")
    .insert({ ...parsed.data, season_id: seasonId });
  if (error) return { error: error.message };

  revalidatePath("/admin/seasons");
  redirect("/admin/seasons");
}

export async function updateDivision(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing division id." };

  const parsed = divisionFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("divisions").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/seasons");
  redirect("/admin/seasons");
}

export async function deleteDivision(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("divisions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/seasons");
  return {};
}
