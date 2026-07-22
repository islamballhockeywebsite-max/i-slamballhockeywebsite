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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GoalEventInput } from "@/lib/validation/scorekeeper";
import type { RosterPlayer } from "@/app/scorekeeper/[gameId]/page";
import type { Database } from "@/lib/supabase/types";

type Team = { id: string; name: string };
type GameEventRow = Database["public"]["Tables"]["game_events"]["Row"];

const strengths = [
  { value: "even", label: "Even strength" },
  { value: "powerplay", label: "Power play" },
  { value: "shorthanded", label: "Shorthanded" },
];

function initialState(
  homeTeamId: string,
  defaultPeriod: number,
  event?: GameEventRow,
): GoalEventInput {
  if (event) {
    return {
      team_id: event.team_id,
      player_id: event.player_id ?? "",
      assist1_player_id: event.assist1_player_id,
      assist2_player_id: event.assist2_player_id,
      goalie_id: event.goalie_id,
      strength: event.strength,
      is_empty_net: event.is_empty_net ?? false,
      is_own_goal: event.is_own_goal ?? false,
      period: event.period,
      game_time: event.game_time,
    };
  }
  return {
    team_id: homeTeamId,
    player_id: "",
    assist1_player_id: null,
    assist2_player_id: null,
    goalie_id: null,
    strength: "even",
    is_empty_net: false,
    is_own_goal: false,
    period: defaultPeriod,
    game_time: null,
  };
}

export function GoalDialog({
  open,
  onOpenChange,
  homeTeam,
  awayTeam,
  rosterByTeam,
  defaultPeriod,
  event,
  getOpponentGoalie,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  homeTeam: Team;
  awayTeam: Team;
  rosterByTeam: Record<string, RosterPlayer[]>;
  defaultPeriod: number;
  event?: GameEventRow;
  getOpponentGoalie: (teamId: string) => string | null;
  onSubmit: (input: GoalEventInput) => Promise<{ error?: string }>;
}) {
  const [form, setForm] = useState<GoalEventInput>(() => initialState(homeTeam.id, defaultPeriod, event));
  const [pending, setPending] = useState(false);

  // Reset the form whenever the dialog transitions to open, instead of via an effect
  // (React's recommended "adjust state during render" pattern for this exact case).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setForm(initialState(homeTeam.id, defaultPeriod, event));
  }

  // For an own goal, team_id is the BENEFITING team but the scorer credited is a player
  // on the opposing team — so the scorer/assist pickers must show the other roster.
  const scoringTeamId = form.is_own_goal
    ? form.team_id === homeTeam.id
      ? awayTeam.id
      : homeTeam.id
    : form.team_id;
  const teamPlayers = rosterByTeam[scoringTeamId] ?? [];

  function update<K extends keyof GoalEventInput>(key: K, value: GoalEventInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.player_id) return;
    setPending(true);
    const result = await onSubmit({ ...form, goalie_id: getOpponentGoalie(form.team_id) });
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
          <DialogTitle>{event ? "Edit Goal" : "Add Goal"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Team</Label>
            <Select
              value={form.team_id}
              onValueChange={(v) =>
                v &&
                setForm((prev) => ({
                  ...prev,
                  team_id: v,
                  player_id: "",
                  assist1_player_id: null,
                  assist2_player_id: null,
                }))
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
            <Label>Scorer</Label>
            <Select
              value={form.player_id}
              onValueChange={(v) => v && update("player_id", v)}
              items={teamPlayers.map((p) => ({ value: p.player_id, label: p.name }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select scorer" />
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Assist 1</Label>
              <Select
                value={form.assist1_player_id ?? "none"}
                onValueChange={(v) => update("assist1_player_id", v === "none" ? null : v)}
                items={[
                  { value: "none", label: "None" },
                  ...teamPlayers.map((p) => ({ value: p.player_id, label: p.name })),
                ]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {teamPlayers.map((p) => (
                    <SelectItem key={p.player_id} value={p.player_id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assist 2</Label>
              <Select
                value={form.assist2_player_id ?? "none"}
                onValueChange={(v) => update("assist2_player_id", v === "none" ? null : v)}
                items={[
                  { value: "none", label: "None" },
                  ...teamPlayers.map((p) => ({ value: p.player_id, label: p.name })),
                ]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {teamPlayers.map((p) => (
                    <SelectItem key={p.player_id} value={p.player_id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Strength</Label>
            <Select
              value={form.strength ?? "even"}
              onValueChange={(v) => v && update("strength", v as GoalEventInput["strength"])}
              items={strengths}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {strengths.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-period">Period</Label>
              <Input
                id="goal-period"
                type="number"
                min={1}
                value={form.period ?? ""}
                onChange={(e) => update("period", e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-time">Game time</Label>
              <Input
                id="goal-time"
                placeholder="mm:ss"
                value={form.game_time ?? ""}
                onChange={(e) => update("game_time", e.target.value || null)}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="goal-empty-net"
                checked={form.is_empty_net}
                onCheckedChange={(v) => update("is_empty_net", v)}
              />
              <Label htmlFor="goal-empty-net" className="text-sm">
                Empty net
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="goal-own-goal"
                checked={form.is_own_goal}
                onCheckedChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    is_own_goal: v,
                    player_id: "",
                    assist1_player_id: null,
                    assist2_player_id: null,
                  }))
                }
              />
              <Label htmlFor="goal-own-goal" className="text-sm">
                Own goal
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="create" disabled={!form.player_id || pending} onClick={handleSubmit}>
            {pending ? "Saving…" : event ? "Save Changes" : "Add Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
