"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PenaltyEventInput } from "@/lib/validation/scorekeeper";
import type { RosterPlayer } from "@/app/scorekeeper/[gameId]/page";
import type { Database } from "@/lib/supabase/types";

type Team = { id: string; name: string };
type GameEventRow = Database["public"]["Tables"]["game_events"]["Row"];

function initialState(
  homeTeamId: string,
  defaultPeriod: number,
  event?: GameEventRow,
): PenaltyEventInput {
  if (event) {
    return {
      team_id: event.team_id,
      player_id: event.player_id ?? "",
      penalty_type: event.penalty_type ?? "",
      penalty_minutes: event.penalty_minutes ?? 2,
      period: event.period,
      game_time: event.game_time,
    };
  }
  return {
    team_id: homeTeamId,
    player_id: "",
    penalty_type: "",
    penalty_minutes: 2,
    period: defaultPeriod,
    game_time: null,
  };
}

export function PenaltyDialog({
  open,
  onOpenChange,
  homeTeam,
  awayTeam,
  rosterByTeam,
  defaultPeriod,
  event,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  homeTeam: Team;
  awayTeam: Team;
  rosterByTeam: Record<string, RosterPlayer[]>;
  defaultPeriod: number;
  event?: GameEventRow;
  onSubmit: (input: PenaltyEventInput) => Promise<{ error?: string }>;
}) {
  const [form, setForm] = useState<PenaltyEventInput>(() =>
    initialState(homeTeam.id, defaultPeriod, event),
  );
  const [pending, setPending] = useState(false);

  // Reset the form whenever the dialog transitions to open, instead of via an effect
  // (React's recommended "adjust state during render" pattern for this exact case).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setForm(initialState(homeTeam.id, defaultPeriod, event));
  }

  const teamPlayers = rosterByTeam[form.team_id] ?? [];

  function update<K extends keyof PenaltyEventInput>(key: K, value: PenaltyEventInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.player_id || !form.penalty_type) return;
    setPending(true);
    const result = await onSubmit(form);
    setPending(false);
    if (result.error) {
      alert(result.error);
      return;
    }
    onOpenChange(false);
  }

  const teams = [homeTeam, awayTeam];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Penalty" : "Add Penalty"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Team</Label>
            <Select
              value={form.team_id}
              onValueChange={(v) =>
                v && setForm((prev) => ({ ...prev, team_id: v, player_id: "" }))
              }
              items={teams.map((t) => ({ value: t.id, label: t.name }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Player</Label>
            <Select
              value={form.player_id}
              onValueChange={(v) => v && update("player_id", v)}
              items={teamPlayers.map((p) => ({ value: p.player_id, label: p.name }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                {teamPlayers.map((p) => (
                  <SelectItem key={p.player_id} value={p.player_id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="penalty-type">Infraction</Label>
            <Input
              id="penalty-type"
              placeholder="e.g. Tripping"
              value={form.penalty_type}
              onChange={(e) => update("penalty_type", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="penalty-minutes">Minutes</Label>
              <Input
                id="penalty-minutes"
                type="number"
                min={1}
                value={form.penalty_minutes}
                onChange={(e) => update("penalty_minutes", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="penalty-period">Period</Label>
              <Input
                id="penalty-period"
                type="number"
                min={1}
                value={form.period ?? ""}
                onChange={(e) => update("period", e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="penalty-time">Game time</Label>
              <Input
                id="penalty-time"
                placeholder="mm:ss"
                value={form.game_time ?? ""}
                onChange={(e) => update("game_time", e.target.value || null)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="create"
            disabled={!form.player_id || !form.penalty_type || pending}
            onClick={handleSubmit}
          >
            {pending ? "Saving…" : event ? "Save Changes" : "Add Penalty"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
