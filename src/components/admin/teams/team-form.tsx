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
import type { FormState } from "@/actions/teams";
import type { Database } from "@/lib/supabase/types";

type Team = Database["public"]["Tables"]["teams"]["Row"];
type Division = Database["public"]["Tables"]["divisions"]["Row"];

export function TeamForm({
  action,
  seasonId,
  divisions,
  team,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  seasonId: string;
  divisions: Division[];
  team?: Team;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {team && <input type="hidden" name="id" value={team.id} />}
      <input type="hidden" name="season_id" value={seasonId} />

      <div className="space-y-2">
        <Label htmlFor="name">Team name*</Label>
        <Input id="name" name="name" defaultValue={team?.name} required />
        {fieldError("name") && <p className="text-sm text-destructive">{fieldError("name")}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="division_id">Division*</Label>
        <Select
          name="division_id"
          defaultValue={team?.division_id}
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
        {divisions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            This season has no divisions yet — add one first.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="primary_color">Primary color</Label>
        <Input id="primary_color" name="primary_color" type="color" defaultValue={team?.primary_color ?? "#000000"} className="h-10 w-20 p-1" />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" variant="create" disabled={pending || divisions.length === 0}>
        {pending ? "Saving…" : team ? "Save Changes" : "Create Team"}
      </Button>
    </form>
  );
}
