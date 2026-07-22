"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormState } from "@/actions/schedule";
import type { Database } from "@/lib/supabase/types";

type Game = Database["public"]["Tables"]["games"]["Row"];
type Division = Database["public"]["Tables"]["divisions"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

export function GameForm({
  action,
  seasonId,
  divisions,
  teams,
  game,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  seasonId: string;
  divisions: Division[];
  teams: Team[];
  game?: Game;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [divisionId, setDivisionId] = useState(game?.division_id ?? "");

  const teamsInDivision = teams.filter((t) => t.division_id === divisionId);
  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {game && <input type="hidden" name="id" value={game.id} />}
      <input type="hidden" name="season_id" value={seasonId} />

      <div className="space-y-2">
        <Label htmlFor="division_id">Division*</Label>
        <Select
          name="division_id"
          value={divisionId}
          onValueChange={(v) => v && setDivisionId(v)}
          items={divisions.map((d) => ({ value: d.id, label: d.name }))}
        >
          <SelectTrigger id="division_id" className="w-full">
            <SelectValue placeholder="Select division" />
          </SelectTrigger>
          <SelectContent>
            {divisions.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldError("division_id") && (
          <p className="text-sm text-destructive">{fieldError("division_id")}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="home_team_id">Home team*</Label>
          <Select
            name="home_team_id"
            defaultValue={game?.home_team_id}
            items={teamsInDivision.map((t) => ({ value: t.id, label: t.name }))}
          >
            <SelectTrigger id="home_team_id" className="w-full">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              {teamsInDivision.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError("home_team_id") && (
            <p className="text-sm text-destructive">{fieldError("home_team_id")}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="away_team_id">Away team*</Label>
          <Select
            name="away_team_id"
            defaultValue={game?.away_team_id}
            items={teamsInDivision.map((t) => ({ value: t.id, label: t.name }))}
          >
            <SelectTrigger id="away_team_id" className="w-full">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              {teamsInDivision.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError("away_team_id") && (
            <p className="text-sm text-destructive">{fieldError("away_team_id")}</p>
          )}
        </div>
      </div>

      {divisionId && teamsInDivision.length === 0 && (
        <p className="text-sm text-muted-foreground">
          This division has no teams yet — add teams first.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduled_at">Date &amp; time</Label>
          <Input
            id="scheduled_at"
            name="scheduled_at"
            type="datetime-local"
            defaultValue={game?.scheduled_at ? game.scheduled_at.slice(0, 16) : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={game?.location ?? undefined} />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" variant="create" disabled={pending}>
        {pending ? "Saving…" : game ? "Save Changes" : "Create Game"}
      </Button>
    </form>
  );
}
