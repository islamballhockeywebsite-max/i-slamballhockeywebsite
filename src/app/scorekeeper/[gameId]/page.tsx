import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireScorekeeper } from "@/lib/auth/session";
import { LineupConfirm } from "@/components/scorekeeper/lineup-confirm";
import { LiveConsole } from "@/components/scorekeeper/live-console";

export type RosterPlayer = {
  player_id: string;
  team_id: string;
  name: string;
  position: string | null;
  jersey_number: number | null;
};

export default async function ScorekeeperGamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const { user, role } = await requireScorekeeper();
  const supabase = await createClient();

  const { data: game } = await supabase.from("games").select("*").eq("id", gameId).maybeSingle();
  if (!game) notFound();
  if (role !== "admin" && game.scorekeeper_id !== user.id) notFound();

  const [{ data: teams }, { data: rosters }, { data: lineups }, { data: goalieAppearances }, { data: events }] =
    await Promise.all([
      supabase.from("teams").select("id, name").in("id", [game.home_team_id, game.away_team_id]),
      supabase
        .from("rosters")
        .select("player_id, team_id, jersey_number, position")
        .in("team_id", [game.home_team_id, game.away_team_id])
        .eq("status", "active"),
      supabase.from("game_lineups").select("*").eq("game_id", gameId),
      supabase.from("goalie_appearances").select("*").eq("game_id", gameId),
      supabase.from("game_events").select("*").eq("game_id", gameId).order("created_at", { ascending: true }),
    ]);

  const playerIds = Array.from(new Set((rosters ?? []).map((r) => r.player_id)));
  const { data: players } =
    playerIds.length > 0
      ? await supabase.from("players_public").select("id, first_name, last_name").in("id", playerIds)
      : { data: [] };
  const playerName = (id: string) => {
    const p = players?.find((pl) => pl.id === id);
    return p ? `${p.first_name} ${p.last_name}` : "Unknown player";
  };

  const roster: RosterPlayer[] = (rosters ?? []).map((r) => ({
    player_id: r.player_id,
    team_id: r.team_id,
    name: playerName(r.player_id),
    position: r.position,
    jersey_number: r.jersey_number,
  }));

  const homeTeam = teams?.find((t) => t.id === game.home_team_id) ?? { id: game.home_team_id, name: "Home" };
  const awayTeam = teams?.find((t) => t.id === game.away_team_id) ?? { id: game.away_team_id, name: "Away" };

  if (game.status === "scheduled" || game.status === "postponed") {
    return (
      <LineupConfirm
        gameId={game.id}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        roster={roster}
        existingLineups={lineups ?? []}
      />
    );
  }

  return (
    <LiveConsole
      game={game}
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      roster={roster}
      lineups={lineups ?? []}
      goalieAppearances={goalieAppearances ?? []}
      initialEvents={events ?? []}
    />
  );
}
