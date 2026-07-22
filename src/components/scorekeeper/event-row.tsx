"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoalDialog } from "@/components/scorekeeper/goal-dialog";
import { PenaltyDialog } from "@/components/scorekeeper/penalty-dialog";
import type { GoalEventInput, PenaltyEventInput } from "@/lib/validation/scorekeeper";
import type { RosterPlayer } from "@/app/scorekeeper/[gameId]/page";
import type { Database } from "@/lib/supabase/types";

type Team = { id: string; name: string };
type GameEventRow = Database["public"]["Tables"]["game_events"]["Row"];

function describe(event: GameEventRow, playerName: (id: string | null) => string, teamName: (id: string) => string) {
  const when = [event.period ? `P${event.period}` : null, event.game_time].filter(Boolean).join(" ");
  if (event.event_type === "goal") {
    const parts = [`Goal — ${playerName(event.player_id)} (${teamName(event.team_id)})`];
    const assists = [event.assist1_player_id, event.assist2_player_id].filter(Boolean) as string[];
    if (assists.length > 0) parts.push(`assist: ${assists.map((id) => playerName(id)).join(", ")}`);
    if (event.strength && event.strength !== "even") parts.push(event.strength);
    if (event.is_empty_net) parts.push("EN");
    if (event.is_own_goal) parts.push("OG");
    return `${parts.join(" — ")}${when ? ` (${when})` : ""}`;
  }
  if (event.event_type === "penalty") {
    return `Penalty — ${playerName(event.player_id)} (${teamName(event.team_id)}) — ${event.penalty_type}, ${event.penalty_minutes} min${when ? ` (${when})` : ""}`;
  }
  if (event.event_type === "goalie_change") {
    return `Goalie change — ${teamName(event.team_id)}: ${playerName(event.goalie_id)} in net`;
  }
  return event.event_type;
}

export function EventRow({
  event,
  homeTeam,
  awayTeam,
  rosterByTeam,
  playerName,
  teamName,
  defaultPeriod,
  getOpponentGoalie,
  onUpdateGoal,
  onUpdatePenalty,
  onDelete,
}: {
  event: GameEventRow;
  homeTeam: Team;
  awayTeam: Team;
  rosterByTeam: Record<string, RosterPlayer[]>;
  playerName: (id: string | null) => string;
  teamName: (id: string) => string;
  defaultPeriod: number;
  getOpponentGoalie: (teamId: string) => string | null;
  onUpdateGoal: (eventId: string, input: GoalEventInput) => Promise<{ error?: string }>;
  onUpdatePenalty: (eventId: string, input: PenaltyEventInput) => Promise<{ error?: string }>;
  onDelete: (eventId: string) => Promise<{ error?: string }>;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const editable = event.event_type === "goal" || event.event_type === "penalty";

  async function handleDelete() {
    if (!confirm("Delete this event? Standings will recompute automatically.")) return;
    setDeleting(true);
    const result = await onDelete(event.id);
    setDeleting(false);
    if (result.error) alert(result.error);
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
      <span>{describe(event, playerName, teamName)}</span>
      <div className="flex items-center gap-1">
        {editable && (
          <Button variant="edit" size="icon-sm" title="Edit" onClick={() => setEditOpen(true)}>
            <Pencil className="size-3.5" />
          </Button>
        )}
        <Button variant="delete" size="icon-sm" title="Delete" disabled={deleting} onClick={handleDelete}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {event.event_type === "goal" && (
        <GoalDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          rosterByTeam={rosterByTeam}
          defaultPeriod={defaultPeriod}
          event={event}
          getOpponentGoalie={getOpponentGoalie}
          onSubmit={(input) => onUpdateGoal(event.id, input)}
        />
      )}
      {event.event_type === "penalty" && (
        <PenaltyDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          rosterByTeam={rosterByTeam}
          defaultPeriod={defaultPeriod}
          event={event}
          onSubmit={(input) => onUpdatePenalty(event.id, input)}
        />
      )}
    </div>
  );
}
