"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startGame } from "@/actions/scorekeeper";
import type { RosterPlayer } from "@/app/scorekeeper/[gameId]/page";
import type { Database } from "@/lib/supabase/types";

type Team = { id: string; name: string };
type GameLineup = Database["public"]["Tables"]["game_lineups"]["Row"];

function TeamLineup({
  team,
  players,
  present,
  onTogglePresent,
  goalieId,
  onGoalieChange,
}: {
  team: Team;
  players: RosterPlayer[];
  present: Set<string>;
  onTogglePresent: (playerId: string) => void;
  goalieId: string;
  onGoalieChange: (id: string) => void;
}) {
  const presentPlayers = players.filter((p) => present.has(p.player_id));

  return (
    <AdminCard className="space-y-4">
      <span className="font-heading text-lg">{team.name}</span>

      <div className="space-y-1.5">
        {players.length === 0 && (
          <p className="text-sm text-muted-foreground">No active roster for this team.</p>
        )}
        {players.map((p) => (
          <label
            key={p.player_id}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-muted"
          >
            <input
              type="checkbox"
              checked={present.has(p.player_id)}
              onChange={() => onTogglePresent(p.player_id)}
              className="size-4"
            />
            <span>
              {p.jersey_number != null ? `#${p.jersey_number} ` : ""}
              {p.name}
              {p.position ? ` (${p.position})` : ""}
            </span>
          </label>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label>Starting goalie</Label>
        <Select
          value={goalieId}
          onValueChange={(v) => v && onGoalieChange(v)}
          items={presentPlayers.map((p) => ({ value: p.player_id, label: p.name }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select starting goalie" />
          </SelectTrigger>
          <SelectContent>
            {presentPlayers.map((p) => (
              <SelectItem key={p.player_id} value={p.player_id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </AdminCard>
  );
}

export function LineupConfirm({
  gameId,
  homeTeam,
  awayTeam,
  roster,
  existingLineups,
}: {
  gameId: string;
  homeTeam: Team;
  awayTeam: Team;
  roster: RosterPlayer[];
  existingLineups: GameLineup[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const initialPresent = (teamId: string) => {
    const teamPlayers = roster.filter((p) => p.team_id === teamId);
    const absentIds = new Set(
      existingLineups.filter((l) => l.team_id === teamId && !l.is_present).map((l) => l.player_id),
    );
    return new Set(teamPlayers.filter((p) => !absentIds.has(p.player_id)).map((p) => p.player_id));
  };

  const defaultGoalie = (teamId: string) =>
    roster.find((p) => p.team_id === teamId && p.position === "goalie")?.player_id ?? "";

  const [homePresent, setHomePresent] = useState(() => initialPresent(homeTeam.id));
  const [awayPresent, setAwayPresent] = useState(() => initialPresent(awayTeam.id));
  const [homeGoalie, setHomeGoalie] = useState(() => defaultGoalie(homeTeam.id));
  const [awayGoalie, setAwayGoalie] = useState(() => defaultGoalie(awayTeam.id));

  function toggle(setFn: React.Dispatch<React.SetStateAction<Set<string>>>, playerId: string) {
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }

  function handleStart() {
    startTransition(async () => {
      const teams = [
        {
          team_id: homeTeam.id,
          present_player_ids: Array.from(homePresent),
          absent_player_ids: roster
            .filter((p) => p.team_id === homeTeam.id && !homePresent.has(p.player_id))
            .map((p) => p.player_id),
          starting_goalie_id: homeGoalie,
        },
        {
          team_id: awayTeam.id,
          present_player_ids: Array.from(awayPresent),
          absent_player_ids: roster
            .filter((p) => p.team_id === awayTeam.id && !awayPresent.has(p.player_id))
            .map((p) => p.player_id),
          starting_goalie_id: awayGoalie,
        },
      ];

      const result = await startGame(gameId, teams);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Confirm Lineups</h1>
      <p className="text-sm text-muted-foreground">
        Confirm who&apos;s dressed and each team&apos;s starting goalie before starting the game.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <TeamLineup
          team={homeTeam}
          players={roster.filter((p) => p.team_id === homeTeam.id)}
          present={homePresent}
          onTogglePresent={(id) => toggle(setHomePresent, id)}
          goalieId={homeGoalie}
          onGoalieChange={setHomeGoalie}
        />
        <TeamLineup
          team={awayTeam}
          players={roster.filter((p) => p.team_id === awayTeam.id)}
          present={awayPresent}
          onTogglePresent={(id) => toggle(setAwayPresent, id)}
          goalieId={awayGoalie}
          onGoalieChange={setAwayGoalie}
        />
      </div>

      <Button variant="create" disabled={pending} onClick={handleStart}>
        {pending ? "Starting…" : "Start Game"}
      </Button>
    </div>
  );
}
