"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  assignPlayerSchema,
  editRosterEntrySchema,
  tradeSchema,
} from "@/lib/validation/roster";
import { flattenZodFieldErrors } from "@/lib/validation/shared";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function assignPlayerToRoster(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const parsed = assignPlayerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("rosters").insert({
    ...parsed.data,
    joined_at: new Date().toISOString().slice(0, 10),
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/rosters");
  return {};
}

export async function updateRosterEntry(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing roster entry id." };

  const parsed = editRosterEntrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { error } = await supabase.from("rosters").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/rosters");
  return {};
}

export async function removeFromRoster(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("rosters").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/rosters");
  return {};
}

export async function setRosterSpare(id: string, isSpare: boolean): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("rosters").update({ is_spare: isSpare }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/rosters");
  return {};
}

/**
 * Trades a player: the current roster row is marked `traded` with `left_at` set, and a new
 * row is created for the destination team with `joined_at` — both rows are kept so team
 * history and the per-team stat split are preserved (stats key off game_events.team_id,
 * which never changes retroactively).
 */
export async function tradePlayer(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const rosterId = String(formData.get("roster_id") ?? "");
  const playerId = String(formData.get("player_id") ?? "");
  if (!rosterId || !playerId) return { error: "Missing roster entry." };

  const parsed = tradeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenZodFieldErrors(parsed.error) };

  const { destination_team_id, effective_date } = parsed.data;

  const { error: closeError } = await supabase
    .from("rosters")
    .update({ status: "traded", left_at: effective_date })
    .eq("id", rosterId);
  if (closeError) return { error: closeError.message };

  const { error: openError } = await supabase.from("rosters").insert({
    team_id: destination_team_id,
    player_id: playerId,
    joined_at: effective_date,
    status: "active",
  });
  if (openError) return { error: openError.message };

  revalidatePath("/admin/rosters");
  return {};
}
