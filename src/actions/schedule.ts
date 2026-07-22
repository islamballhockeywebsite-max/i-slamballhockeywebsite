"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { gameFormSchema } from "@/lib/validation/schedule";
import { flattenZodFieldErrors } from "@/lib/validation/shared";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createGame(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const parsed = gameFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("games").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/schedule");
  redirect("/admin/schedule");
}

export async function updateGame(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing game id." };

  const parsed = gameFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("games").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/schedule");
  redirect("/admin/schedule");
}

export async function deleteGame(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("games").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/schedule");
  return {};
}

export async function assignScorekeeper(
  gameId: string,
  scorekeeperId: string | null,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("games")
    .update({ scorekeeper_id: scorekeeperId })
    .eq("id", gameId);
  if (error) return { error: error.message };
  revalidatePath("/admin/schedule");
  return {};
}

export async function postponeGame(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("games").update({ status: "postponed" }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/schedule");
  return {};
}

/**
 * Forfeits a game: winner + is_forfeit are the authoritative signal (no events are ever
 * logged, so recompute_game()'s event-count-derived score naturally comes out 0-0 — the
 * spec's "default score" — and the UI shows "Forfeit" instead of a real score). Setting
 * status to 'final' fires the same finalize/recompute trigger a normal game does, so the
 * team's W/L is picked up in standings exactly like any other result.
 */
export async function forfeitGame(
  gameId: string,
  winnerTeamId: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("games")
    .update({
      is_forfeit: true,
      status: "final",
      winner_team_id: winnerTeamId,
    })
    .eq("id", gameId);
  if (error) return { error: error.message };
  revalidatePath("/admin/schedule");
  return {};
}
