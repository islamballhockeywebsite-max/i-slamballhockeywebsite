"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { playoffGameFormSchema, seriesFormSchema } from "@/lib/validation/playoff";
import { flattenZodFieldErrors } from "@/lib/validation/shared";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Replaces the full seed set for a season/division in one insert (after clearing the old
 * set) rather than upserting row-by-row — avoids transiently colliding with the
 * (season_id, division_id, seed) uniqueness constraint when two teams swap seed numbers.
 */
export async function setSeeds(
  seasonId: string,
  divisionId: string,
  seeds: { team_id: string; seed: number }[],
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("playoff_seeds")
    .delete()
    .eq("season_id", seasonId)
    .eq("division_id", divisionId);
  if (deleteError) return { error: deleteError.message };

  const rows = seeds.filter((s) => s.seed > 0);
  if (rows.length > 0) {
    const { error } = await supabase.from("playoff_seeds").insert(
      rows.map((s) => ({
        season_id: seasonId,
        division_id: divisionId,
        team_id: s.team_id,
        seed: s.seed,
      })),
    );
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/playoffs");
  return {};
}

export async function createSeries(
  seasonId: string,
  divisionId: string,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const parsed = seriesFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase
    .from("playoff_series")
    .insert({ ...parsed.data, season_id: seasonId, division_id: divisionId });
  if (error) return { error: error.message };

  revalidatePath("/admin/playoffs");
  return {};
}

export async function updateSeries(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing series id." };

  const parsed = seriesFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("playoff_series").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/playoffs");
  return {};
}

export async function deleteSeries(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("playoff_series").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/playoffs");
  return {};
}

export async function createPlayoffGame(
  seriesId: string,
  input: { home_team_id: string; away_team_id: string; scheduled_at?: string | null; location?: string | null },
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const parsed = playoffGameFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid game" };

  const { data: series, error: seriesError } = await supabase
    .from("playoff_series")
    .select("season_id, division_id")
    .eq("id", seriesId)
    .maybeSingle();
  if (seriesError) return { error: seriesError.message };
  if (!series) return { error: "Series not found" };

  const { error } = await supabase.from("games").insert({
    ...parsed.data,
    season_id: series.season_id,
    division_id: series.division_id,
    is_playoff: true,
    series_id: seriesId,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/playoffs");
  revalidatePath("/admin/schedule");
  return {};
}
