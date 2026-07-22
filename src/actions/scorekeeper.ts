"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireScorekeeper } from "@/lib/auth/session";
import {
  finalizeGameSchema,
  goalEventSchema,
  penaltyEventSchema,
  type FinalizeGameInput,
  type GoalEventInput,
  type PenaltyEventInput,
} from "@/lib/validation/scorekeeper";

type ActionResult = { error?: string };

function revalidateGame(gameId: string) {
  revalidatePath(`/scorekeeper/${gameId}`);
  revalidatePath("/scorekeeper");
}

export type TeamLineupInput = {
  team_id: string;
  present_player_ids: string[];
  absent_player_ids: string[];
  starting_goalie_id: string;
};

/**
 * Confirms attendance + starting goalies for both teams and transitions the game to
 * in_progress. game_lineups is the source of truth for skater Games Played, so every
 * rostered player must get a row (present or not) rather than only recording who dressed.
 */
export async function startGame(gameId: string, teams: TeamLineupInput[]): Promise<ActionResult> {
  await requireScorekeeper();
  const supabase = await createClient();

  const lineupRows = teams.flatMap((t) => [
    ...t.present_player_ids.map((player_id) => ({
      game_id: gameId,
      team_id: t.team_id,
      player_id,
      is_present: true,
    })),
    ...t.absent_player_ids.map((player_id) => ({
      game_id: gameId,
      team_id: t.team_id,
      player_id,
      is_present: false,
    })),
  ]);

  if (lineupRows.length > 0) {
    const { error } = await supabase
      .from("game_lineups")
      .upsert(lineupRows, { onConflict: "game_id,player_id" });
    if (error) return { error: error.message };
  }

  for (const t of teams) {
    if (!t.starting_goalie_id) continue;
    const { error } = await supabase.from("goalie_appearances").upsert(
      { game_id: gameId, team_id: t.team_id, player_id: t.starting_goalie_id, is_starter: true },
      { onConflict: "game_id,player_id" },
    );
    if (error) return { error: error.message };
  }

  const { error: statusError } = await supabase
    .from("games")
    .update({ status: "in_progress" })
    .eq("id", gameId);
  if (statusError) return { error: statusError.message };

  revalidateGame(gameId);
  return {};
}

export async function addGoalEvent(gameId: string, input: GoalEventInput): Promise<ActionResult> {
  await requireScorekeeper();
  const parsed = goalEventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid goal" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("game_events").insert({
    game_id: gameId,
    event_type: "goal",
    created_by: user?.id ?? null,
    ...parsed.data,
  });
  if (error) return { error: error.message };

  revalidateGame(gameId);
  return {};
}

export async function updateGoalEvent(
  eventId: string,
  gameId: string,
  input: GoalEventInput,
): Promise<ActionResult> {
  await requireScorekeeper();
  const parsed = goalEventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid goal" };

  const supabase = await createClient();
  const { error } = await supabase.from("game_events").update(parsed.data).eq("id", eventId);
  if (error) return { error: error.message };

  revalidateGame(gameId);
  return {};
}

export async function addPenaltyEvent(gameId: string, input: PenaltyEventInput): Promise<ActionResult> {
  await requireScorekeeper();
  const parsed = penaltyEventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid penalty" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("game_events").insert({
    game_id: gameId,
    event_type: "penalty",
    created_by: user?.id ?? null,
    ...parsed.data,
  });
  if (error) return { error: error.message };

  revalidateGame(gameId);
  return {};
}

export async function updatePenaltyEvent(
  eventId: string,
  gameId: string,
  input: PenaltyEventInput,
): Promise<ActionResult> {
  await requireScorekeeper();
  const parsed = penaltyEventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid penalty" };

  const supabase = await createClient();
  const { error } = await supabase.from("game_events").update(parsed.data).eq("id", eventId);
  if (error) return { error: error.message };

  revalidateGame(gameId);
  return {};
}

/**
 * Works for both live entry and post-finalize corrections: the game_events_recompute
 * trigger re-runs recompute_game() automatically whenever the parent game is already
 * final, so no separate "corrected" code path is needed here.
 */
export async function deleteGameEvent(eventId: string, gameId: string): Promise<ActionResult> {
  await requireScorekeeper();
  const supabase = await createClient();
  const { error } = await supabase.from("game_events").delete().eq("id", eventId);
  if (error) return { error: error.message };

  revalidateGame(gameId);
  return {};
}

export async function changeGoalie(gameId: string, teamId: string, playerId: string): Promise<ActionResult> {
  await requireScorekeeper();
  const supabase = await createClient();

  const { error: eventError } = await supabase.from("game_events").insert({
    game_id: gameId,
    team_id: teamId,
    event_type: "goalie_change",
    goalie_id: playerId,
  });
  if (eventError) return { error: eventError.message };

  const { error: appearanceError } = await supabase.from("goalie_appearances").upsert(
    { game_id: gameId, team_id: teamId, player_id: playerId, is_starter: false },
    { onConflict: "game_id,player_id", ignoreDuplicates: true },
  );
  if (appearanceError) return { error: appearanceError.message };

  revalidateGame(gameId);
  return {};
}

export async function recordShot(
  gameId: string,
  goalieAppearanceId: string,
  delta: 1 | -1,
): Promise<ActionResult> {
  await requireScorekeeper();
  const supabase = await createClient();

  const { data: appearance, error: fetchError } = await supabase
    .from("goalie_appearances")
    .select("shots_against")
    .eq("id", goalieAppearanceId)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!appearance) return { error: "Goalie appearance not found" };

  const { error } = await supabase
    .from("goalie_appearances")
    .update({ shots_against: Math.max(0, appearance.shots_against + delta) })
    .eq("id", goalieAppearanceId);
  if (error) return { error: error.message };

  revalidateGame(gameId);
  return {};
}

export async function setCurrentPeriod(gameId: string, period: number): Promise<ActionResult> {
  await requireScorekeeper();
  const supabase = await createClient();
  const { error } = await supabase.from("games").update({ current_period: period }).eq("id", gameId);
  if (error) return { error: error.message };

  revalidateGame(gameId);
  return {};
}

/**
 * result_type + winner_team_id are the scorekeeper's authoritative submission — standings
 * trust these directly rather than deriving them from event counts (a shootout winner, for
 * instance, has no corresponding goal event). Setting status to 'final' fires
 * recompute_game() via the games_finalize_recompute trigger.
 */
export async function finalizeGame(gameId: string, input: FinalizeGameInput): Promise<ActionResult> {
  await requireScorekeeper();
  const parsed = finalizeGameSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid result" };

  const supabase = await createClient();
  const { data: game, error: fetchError } = await supabase
    .from("games")
    .select("home_team_id, away_team_id")
    .eq("id", gameId)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!game) return { error: "Game not found" };

  const { error } = await supabase
    .from("games")
    .update({
      status: "final",
      result_type: parsed.data.result_type,
      winner_team_id: parsed.data.winner_team_id,
    })
    .eq("id", gameId);
  if (error) return { error: error.message };

  // Best-effort: credit the starting goalie's decision from the team result. Relief
  // goalies are left as their default ('none') since there's no reliable signal for who
  // was in net at the deciding moment without shift-by-shift net time.
  const decisionFor = (teamId: string) =>
    parsed.data.winner_team_id === null ? "tie" : parsed.data.winner_team_id === teamId ? "win" : "loss";

  await supabase
    .from("goalie_appearances")
    .update({ decision: decisionFor(game.home_team_id) })
    .eq("game_id", gameId)
    .eq("team_id", game.home_team_id)
    .eq("is_starter", true);
  await supabase
    .from("goalie_appearances")
    .update({ decision: decisionFor(game.away_team_id) })
    .eq("game_id", gameId)
    .eq("team_id", game.away_team_id)
    .eq("is_starter", true);

  revalidateGame(gameId);
  return {};
}
