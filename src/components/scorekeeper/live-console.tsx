"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminCard } from "@/components/admin/admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoalDialog } from "@/components/scorekeeper/goal-dialog";
import { PenaltyDialog } from "@/components/scorekeeper/penalty-dialog";
import { FinalizeDialog } from "@/components/scorekeeper/finalize-dialog";
import { EventRow } from "@/components/scorekeeper/event-row";
import {
  addGoalEvent,
  addPenaltyEvent,
  changeGoalie,
  deleteGameEvent,
  finalizeGame,
  recordShot,
  setCurrentPeriod,
  updateGoalEvent,
  updatePenaltyEvent,
} from "@/actions/scorekeeper";
import type { FinalizeGameInput, GoalEventInput, PenaltyEventInput } from "@/lib/validation/scorekeeper";
import type { RosterPlayer } from "@/app/scorekeeper/[gameId]/page";
import type { Database } from "@/lib/supabase/types";

type Team = { id: string; name: string };
type GameRow = Database["public"]["Tables"]["games"]["Row"];
type GameEventRow = Database["public"]["Tables"]["game_events"]["Row"];
type GameLineupRow = Database["public"]["Tables"]["game_lineups"]["Row"];
type GoalieAppearanceRow = Database["public"]["Tables"]["goalie_appearances"]["Row"];

export function LiveConsole({
  game,
  homeTeam,
  awayTeam,
  roster,
  lineups,
  goalieAppearances,
  initialEvents,
}: {
  game: GameRow;
  homeTeam: Team;
  awayTeam: Team;
  roster: RosterPlayer[];
  lineups: GameLineupRow[];
  goalieAppearances: GoalieAppearanceRow[];
  initialEvents: GameEventRow[];
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [supabase] = useState(() => createClient());

  const eventsKey = useMemo(() => ["game-events", game.id] as const, [game.id]);
  const appearancesKey = useMemo(() => ["goalie-appearances", game.id] as const, [game.id]);

  const { data: events = [] } = useQuery({
    queryKey: eventsKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("game_events")
        .select("*")
        .eq("game_id", game.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    initialData: initialEvents,
  });

  const { data: appearances = [] } = useQuery({
    queryKey: appearancesKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goalie_appearances")
        .select("*")
        .eq("game_id", game.id);
      if (error) throw error;
      return data;
    },
    initialData: goalieAppearances,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`game-${game.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_events", filter: `game_id=eq.${game.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["game-events", game.id] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "goalie_appearances", filter: `game_id=eq.${game.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["goalie-appearances", game.id] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, game.id, queryClient]);

  const rosterByTeam = useMemo(() => {
    const presentIds = new Set(lineups.filter((l) => l.is_present).map((l) => l.player_id));
    const hasLineups = lineups.length > 0;
    const byTeam: Record<string, RosterPlayer[]> = {};
    for (const p of roster) {
      if (hasLineups && !presentIds.has(p.player_id)) continue;
      (byTeam[p.team_id] ??= []).push(p);
    }
    return byTeam;
  }, [roster, lineups]);

  const playerName = (id: string | null) => roster.find((p) => p.player_id === id)?.name ?? "—";
  const teamName = (id: string) =>
    id === homeTeam.id ? homeTeam.name : id === awayTeam.id ? awayTeam.name : "Unknown";

  const homeScore = events.filter((e) => e.event_type === "goal" && e.team_id === homeTeam.id).length;
  const awayScore = events.filter((e) => e.event_type === "goal" && e.team_id === awayTeam.id).length;

  function currentGoalieId(teamId: string): string | null {
    const changes = events.filter((e) => e.event_type === "goalie_change" && e.team_id === teamId);
    if (changes.length > 0) return changes[changes.length - 1].goalie_id;
    return appearances.find((a) => a.team_id === teamId && a.is_starter)?.player_id ?? null;
  }

  function opponentGoalie(scoringTeamId: string): string | null {
    return currentGoalieId(scoringTeamId === homeTeam.id ? awayTeam.id : homeTeam.id);
  }

  function appearanceFor(teamId: string): GoalieAppearanceRow | undefined {
    const goalieId = currentGoalieId(teamId);
    if (!goalieId) return undefined;
    return appearances.find((a) => a.team_id === teamId && a.player_id === goalieId);
  }

  const addGoalMutation = useMutation({
    mutationFn: (input: GoalEventInput) => addGoalEvent(game.id, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: eventsKey });
      const previous = queryClient.getQueryData<GameEventRow[]>(eventsKey) ?? [];
      const optimistic: GameEventRow = {
        id: crypto.randomUUID(),
        game_id: game.id,
        event_type: "goal",
        created_at: new Date().toISOString(),
        created_by: null,
        team_id: input.team_id,
        player_id: input.player_id,
        assist1_player_id: input.assist1_player_id ?? null,
        assist2_player_id: input.assist2_player_id ?? null,
        goalie_id: input.goalie_id ?? null,
        strength: input.strength ?? null,
        is_empty_net: input.is_empty_net,
        is_own_goal: input.is_own_goal,
        penalty_type: null,
        penalty_minutes: null,
        period: input.period ?? null,
        game_time: input.game_time ?? null,
      };
      queryClient.setQueryData<GameEventRow[]>(eventsKey, [...previous, optimistic]);
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(eventsKey, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: eventsKey }),
  });

  const addPenaltyMutation = useMutation({
    mutationFn: (input: PenaltyEventInput) => addPenaltyEvent(game.id, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: eventsKey });
      const previous = queryClient.getQueryData<GameEventRow[]>(eventsKey) ?? [];
      const optimistic: GameEventRow = {
        id: crypto.randomUUID(),
        game_id: game.id,
        event_type: "penalty",
        created_at: new Date().toISOString(),
        created_by: null,
        team_id: input.team_id,
        player_id: input.player_id,
        assist1_player_id: null,
        assist2_player_id: null,
        goalie_id: null,
        strength: null,
        is_empty_net: null,
        is_own_goal: null,
        penalty_type: input.penalty_type,
        penalty_minutes: input.penalty_minutes,
        period: input.period ?? null,
        game_time: input.game_time ?? null,
      };
      queryClient.setQueryData<GameEventRow[]>(eventsKey, [...previous, optimistic]);
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(eventsKey, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: eventsKey }),
  });

  const periodMutation = useMutation({
    mutationFn: (period: number) => setCurrentPeriod(game.id, period),
    onSuccess: () => router.refresh(),
  });

  const recordShotMutation = useMutation({
    mutationFn: ({ appearanceId, delta }: { appearanceId: string; delta: 1 | -1 }) =>
      recordShot(game.id, appearanceId, delta),
    onSettled: () => queryClient.invalidateQueries({ queryKey: appearancesKey }),
  });

  const changeGoalieMutation = useMutation({
    mutationFn: ({ teamId, playerId }: { teamId: string; playerId: string }) =>
      changeGoalie(game.id, teamId, playerId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventsKey });
      queryClient.invalidateQueries({ queryKey: appearancesKey });
    },
  });

  async function handleUpdateGoal(eventId: string, input: GoalEventInput) {
    const result = await updateGoalEvent(eventId, game.id, input);
    if (!result.error) queryClient.invalidateQueries({ queryKey: eventsKey });
    return result;
  }

  async function handleUpdatePenalty(eventId: string, input: PenaltyEventInput) {
    const result = await updatePenaltyEvent(eventId, game.id, input);
    if (!result.error) queryClient.invalidateQueries({ queryKey: eventsKey });
    return result;
  }

  async function handleDelete(eventId: string) {
    const result = await deleteGameEvent(eventId, game.id);
    if (!result.error) queryClient.invalidateQueries({ queryKey: eventsKey });
    return result;
  }

  async function handleFinalize(input: FinalizeGameInput) {
    const result = await finalizeGame(game.id, input);
    if (!result.error) router.refresh();
    return result;
  }

  const [goalOpen, setGoalOpen] = useState(false);
  const [penaltyOpen, setPenaltyOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);

  const isFinal = game.status === "final";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">
            {homeTeam.name} vs {awayTeam.name}
          </h1>
          <Badge variant="outline" className="mt-1 capitalize">
            {game.status.replace("_", " ")}
          </Badge>
        </div>
        {!isFinal && (
          <Button variant="create" onClick={() => setFinalizeOpen(true)}>
            Finalize Game
          </Button>
        )}
      </div>

      {isFinal && (
        <AdminCard>
          <p className="font-heading">
            Final — {game.is_forfeit ? "Forfeit" : `${homeScore} - ${awayScore}`}
          </p>
          <p className="text-sm text-muted-foreground capitalize">
            {game.result_type ?? ""}
            {game.winner_team_id
              ? ` — ${teamName(game.winner_team_id)} win`
              : game.result_type === "tie"
                ? " — Tie"
                : ""}
          </p>
        </AdminCard>
      )}

      <AdminCard className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="font-heading text-2xl">{homeScore}</p>
            <p className="text-sm text-muted-foreground">{homeTeam.name}</p>
          </div>
          <span className="text-muted-foreground">—</span>
          <div className="text-center">
            <p className="font-heading text-2xl">{awayScore}</p>
            <p className="text-sm text-muted-foreground">{awayTeam.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Period</span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={periodMutation.isPending}
            onClick={() => periodMutation.mutate(Math.max(1, (game.current_period ?? 1) - 1))}
          >
            <Minus className="size-3.5" />
          </Button>
          <span className="w-6 text-center font-heading">{game.current_period ?? 1}</span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={periodMutation.isPending}
            onClick={() => periodMutation.mutate((game.current_period ?? 1) + 1)}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </AdminCard>

      <div className="flex gap-2">
        <Button variant="create" onClick={() => setGoalOpen(true)}>
          Add Goal
        </Button>
        <Button variant="edit" onClick={() => setPenaltyOpen(true)}>
          Add Penalty
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[homeTeam, awayTeam].map((team) => {
          const goalieId = currentGoalieId(team.id);
          const appearance = appearanceFor(team.id);
          const presentPlayers = (rosterByTeam[team.id] ?? []).filter((p) => p.player_id !== goalieId);
          return (
            <AdminCard key={team.id} className="space-y-2">
              <span className="font-heading">{team.name} goalie</span>
              <p className="text-sm">{goalieId ? playerName(goalieId) : "None recorded"}</p>
              {appearance && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Shots against: {appearance.shots_against}</span>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    onClick={() =>
                      recordShotMutation.mutate({ appearanceId: appearance.id, delta: -1 })
                    }
                  >
                    <Minus className="size-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    onClick={() => recordShotMutation.mutate({ appearanceId: appearance.id, delta: 1 })}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              )}
              <Select
                value=""
                onValueChange={(v) => v && changeGoalieMutation.mutate({ teamId: team.id, playerId: v })}
                items={presentPlayers.map((p) => ({ value: p.player_id, label: p.name }))}
              >
                <SelectTrigger className="w-full" size="sm">
                  <SelectValue placeholder="Change goalie" />
                </SelectTrigger>
                <SelectContent>
                  {presentPlayers.map((p) => (
                    <SelectItem key={p.player_id} value={p.player_id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminCard>
          );
        })}
      </div>

      <div className="space-y-2">
        <h2 className="font-heading text-lg">Event Log</h2>
        {events.length === 0 && <p className="text-sm text-muted-foreground">No events yet.</p>}
        {[...events].reverse().map((event) => (
          <EventRow
            key={event.id}
            event={event}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            rosterByTeam={rosterByTeam}
            playerName={playerName}
            teamName={teamName}
            defaultPeriod={game.current_period ?? 1}
            getOpponentGoalie={opponentGoalie}
            onUpdateGoal={handleUpdateGoal}
            onUpdatePenalty={handleUpdatePenalty}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <GoalDialog
        open={goalOpen}
        onOpenChange={setGoalOpen}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        rosterByTeam={rosterByTeam}
        defaultPeriod={game.current_period ?? 1}
        getOpponentGoalie={opponentGoalie}
        onSubmit={(input) => addGoalMutation.mutateAsync(input)}
      />
      <PenaltyDialog
        open={penaltyOpen}
        onOpenChange={setPenaltyOpen}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        rosterByTeam={rosterByTeam}
        defaultPeriod={game.current_period ?? 1}
        onSubmit={(input) => addPenaltyMutation.mutateAsync(input)}
      />
      <FinalizeDialog
        open={finalizeOpen}
        onOpenChange={setFinalizeOpen}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeScore={homeScore}
        awayScore={awayScore}
        onSubmit={handleFinalize}
      />
    </div>
  );
}
