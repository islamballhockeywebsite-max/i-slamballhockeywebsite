"use client";

import { useState } from "react";
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
import { enrollPlayers, type FormState } from "@/actions/draft";
import type { Database } from "@/lib/supabase/types";

type Player = Pick<Database["public"]["Tables"]["players"]["Row"], "id" | "first_name" | "last_name">;
type Division = Database["public"]["Tables"]["divisions"]["Row"];

export function EnrollPlayersForm({
  seasonId,
  divisions,
  eligiblePlayers,
}: {
  seasonId: string;
  divisions: Division[];
  eligiblePlayers: Player[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(enrollPlayers, {});
  const [search, setSearch] = useState("");

  const filtered = eligiblePlayers.filter((p) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="season_id" value={seasonId} />

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-64 space-y-2">
          <Label htmlFor="enroll-search">Search players</Label>
          <Input
            id="enroll-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name"
          />
        </div>
        {divisions.length > 0 && (
          <div className="w-48 space-y-2">
            <Label htmlFor="division_id">Preferred division</Label>
            <Select
              name="division_id"
              items={divisions.map((d) => ({ value: d.id, label: d.name }))}
            >
              <SelectTrigger id="division_id" className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border-2 border-foreground p-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {eligiblePlayers.length === 0
              ? "All players are already enrolled in this season."
              : "No players match your search."}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {filtered.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="playerIds" value={p.id} className="size-4" />
              {p.first_name} {p.last_name}
            </label>
          ))}
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" variant="create" disabled={pending}>
        {pending ? "Adding…" : "Add to Pool"}
      </Button>
    </form>
  );
}
