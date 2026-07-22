"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { historicalGoalieStatSchema, historicalSkaterStatSchema } from "@/lib/validation/historical-stats";
import { flattenZodFieldErrors } from "@/lib/validation/shared";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createSkaterStat(prevState: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const parsed = historicalSkaterStatSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase
    .from("historical_player_season_stats")
    .insert({ ...parsed.data, source: "manual", added_by: user.id });
  if (error) return { error: error.message };

  revalidatePath("/admin/historical-stats");
  redirect("/admin/historical-stats");
}

export async function updateSkaterStat(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing stat id." };

  const parsed = historicalSkaterStatSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("historical_player_season_stats").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/historical-stats");
  redirect("/admin/historical-stats");
}

export async function deleteSkaterStat(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("historical_player_season_stats").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/historical-stats");
  return {};
}

export async function createGoalieStat(prevState: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const parsed = historicalGoalieStatSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase
    .from("historical_goalie_season_stats")
    .insert({ ...parsed.data, source: "manual", added_by: user.id });
  if (error) return { error: error.message };

  revalidatePath("/admin/historical-stats");
  redirect("/admin/historical-stats");
}

export async function updateGoalieStat(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing stat id." };

  const parsed = historicalGoalieStatSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("historical_goalie_season_stats").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/historical-stats");
  redirect("/admin/historical-stats");
}

export async function deleteGoalieStat(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("historical_goalie_season_stats").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/historical-stats");
  return {};
}
