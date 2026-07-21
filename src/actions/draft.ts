"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";

export type FormState = {
  error?: string;
};

/** Bulk-enrolls the selected players into a season's draft pool (season_players). */
export async function enrollPlayers(prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();

  const seasonId = String(formData.get("season_id") ?? "");
  const divisionId = String(formData.get("division_id") ?? "") || null;
  const playerIds = formData.getAll("playerIds").map(String).filter(Boolean);

  if (!seasonId) return { error: "Missing season." };
  if (playerIds.length === 0) return { error: "Select at least one player to enroll." };

  const { error } = await supabase.from("season_players").insert(
    playerIds.map((playerId) => ({
      season_id: seasonId,
      division_id: divisionId,
      player_id: playerId,
    })),
  );
  if (error) return { error: error.message };

  revalidatePath("/admin/teams");
  return {};
}

export async function removeFromPool(seasonPlayerId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("season_players").delete().eq("id", seasonPlayerId);
  if (error) return { error: error.message };
  revalidatePath("/admin/teams");
  return {};
}

/** Assigns a pool player to a team — the actual "draft pick," writing a rosters row. */
export async function assignPlayerToTeam(
  playerId: string,
  teamId: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("rosters").insert({
    team_id: teamId,
    player_id: playerId,
    joined_at: new Date().toISOString().slice(0, 10),
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/teams");
  return {};
}
