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
import { tradePlayer, type FormState } from "@/actions/rosters";
import type { Database } from "@/lib/supabase/types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

export function TradeDialog({
  rosterId,
  playerId,
  playerName,
  currentTeamId,
  otherTeams,
}: {
  rosterId: string;
  playerId: string;
  playerName: string;
  currentTeamId: string;
  otherTeams: Team[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (prev, formData) => {
      const result = await tradePlayer(prev, formData);
      if (!result.error && !result.fieldErrors) {
        setOpen(false);
        router.refresh();
      }
      return result;
    },
    {},
  );

  const destinations = otherTeams.filter((t) => t.id !== currentTeamId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="trade">Trade</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trade {playerName}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="roster_id" value={rosterId} />
          <input type="hidden" name="player_id" value={playerId} />

          <div className="space-y-2">
            <Label htmlFor="destination_team_id">To team</Label>
            <Select
              name="destination_team_id"
              items={destinations.map((t) => ({ value: t.id, label: t.name }))}
            >
              <SelectTrigger id="destination_team_id" className="w-full">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors?.destination_team_id && (
              <p className="text-sm text-destructive">{state.fieldErrors.destination_team_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="effective_date">Effective date</Label>
            <Input
              id="effective_date"
              name="effective_date"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" variant="trade" disabled={pending}>
              {pending ? "Trading…" : "Confirm Trade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
