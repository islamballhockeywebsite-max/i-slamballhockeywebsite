"use client";

import { useActionState } from "react";
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
import type { FormState } from "@/actions/historical-stats";
import type { Database } from "@/lib/supabase/types";

type Stat = Database["public"]["Tables"]["historical_player_season_stats"]["Row"];
type Player = Pick<Database["public"]["Tables"]["players"]["Row"], "id" | "first_name" | "last_name">;

const numberFields = [
  ["games_played", "GP"],
  ["goals", "Goals"],
  ["assists", "Assists"],
  ["points", "Points"],
  ["pim", "PIM"],
  ["ppg", "PPG"],
  ["shg", "SHG"],
  ["gwg", "GWG"],
  ["gtg", "GTG"],
] as const;

export function SkaterStatForm({
  action,
  players,
  stat,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  players: Player[];
  stat?: Stat;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {stat && <input type="hidden" name="id" value={stat.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="player_id">Player*</Label>
          <Select
            name="player_id"
            defaultValue={stat?.player_id}
            items={players.map((p) => ({ value: p.id, label: `${p.first_name} ${p.last_name}` }))}
          >
            <SelectTrigger id="player_id" className="w-full">
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {players.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError("player_id") && <p className="text-sm text-destructive">{fieldError("player_id")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year*</Label>
          <Input id="year" name="year" type="number" defaultValue={stat?.year} />
          {fieldError("year") && <p className="text-sm text-destructive">{fieldError("year")}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="season_label">Season label</Label>
          <Input id="season_label" name="season_label" defaultValue={stat?.season_label ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="team_name">Team name</Label>
          <Input id="team_name" name="team_name" defaultValue={stat?.team_name ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="division_name">Division name</Label>
          <Input id="division_name" name="division_name" defaultValue={stat?.division_name ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
        {numberFields.map(([field, label]) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Input
              id={field}
              name={field}
              type="number"
              defaultValue={stat?.[field as keyof Stat] as number | undefined}
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" defaultValue={stat?.notes ?? ""} />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" variant="create" disabled={pending}>
        {pending ? "Saving…" : stat ? "Save Changes" : "Add Skater Stat Line"}
      </Button>
    </form>
  );
}
