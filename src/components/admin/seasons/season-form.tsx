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
import type { FormState } from "@/actions/seasons";
import type { Database } from "@/lib/supabase/types";

type Season = Database["public"]["Tables"]["seasons"]["Row"];

export function SeasonForm({
  action,
  season,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  season?: Season;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {season && <input type="hidden" name="id" value={season.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name*</Label>
          <Input id="name" name="name" defaultValue={season?.name} required />
          {fieldError("name") && <p className="text-sm text-destructive">{fieldError("name")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year*</Label>
          <Input
            id="year"
            name="year"
            type="number"
            defaultValue={season?.year ?? new Date().getFullYear()}
            required
          />
          {fieldError("year") && <p className="text-sm text-destructive">{fieldError("year")}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={season?.start_date ?? undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End date</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={season?.end_date ?? undefined}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={season?.status ?? "upcoming"}>
          <SelectTrigger id="status" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="points_win">Points — win</Label>
          <Input
            id="points_win"
            name="points_win"
            type="number"
            defaultValue={season?.points_win ?? 2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="points_tie">Points — tie</Label>
          <Input
            id="points_tie"
            name="points_tie"
            type="number"
            defaultValue={season?.points_tie ?? 1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="points_loss">Points — loss</Label>
          <Input
            id="points_loss"
            name="points_loss"
            type="number"
            defaultValue={season?.points_loss ?? 0}
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" variant="create" disabled={pending}>
        {pending ? "Saving…" : season ? "Save Changes" : "Create Season"}
      </Button>
    </form>
  );
}
