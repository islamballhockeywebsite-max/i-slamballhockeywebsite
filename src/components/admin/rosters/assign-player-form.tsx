"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { assignPlayerToRoster, type FormState } from "@/actions/rosters";
import type { Database } from "@/lib/supabase/types";

type Player = Pick<Database["public"]["Tables"]["players"]["Row"], "id" | "first_name" | "last_name">;

export function AssignPlayerForm({
  teamId,
  availablePlayers,
}: {
  teamId: string;
  availablePlayers: Player[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (prev, formData) => {
      const result = await assignPlayerToRoster(prev, formData);
      if (!result.error && !result.fieldErrors) {
        setOpen(false);
        router.refresh();
      }
      return result;
    },
    {},
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="create">Assign Player</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Player to Roster</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="team_id" value={teamId} />

          <div className="space-y-2">
            <Label htmlFor="player_id">Player</Label>
            <Select
              name="player_id"
              items={availablePlayers.map((p) => ({
                value: p.id,
                label: `${p.first_name} ${p.last_name}`,
              }))}
            >
              <SelectTrigger id="player_id" className="w-full">
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                {availablePlayers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.first_name} {p.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors?.player_id && (
              <p className="text-sm text-destructive">{state.fieldErrors.player_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jersey_number">Jersey #</Label>
              <Input id="jersey_number" name="jersey_number" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select
                name="position"
                items={{ forward: "Forward", defense: "Defense", goalie: "Goalie" }}
              >
                <SelectTrigger id="position" className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forward">Forward</SelectItem>
                  <SelectItem value="defense">Defense</SelectItem>
                  <SelectItem value="goalie">Goalie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_spare" value="true" className="size-4" />
            Spare / call-up
          </label>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" variant="create" disabled={pending}>
              {pending ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
