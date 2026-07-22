"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareWarning } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { forfeitGame } from "@/actions/schedule";

export function ForfeitDialog({
  gameId,
  homeTeam,
  awayTeam,
}: {
  gameId: string;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
}) {
  const [open, setOpen] = useState(false);
  const [winnerId, setWinnerId] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    if (!winnerId) return;
    startTransition(async () => {
      const result = await forfeitGame(gameId, winnerId);
      if (result.error) {
        alert(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  const teams = [homeTeam, awayTeam];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="forfeit" onClick={() => setOpen(true)}>
        <MessageSquareWarning className="size-4" />
        Forfeit
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Forfeit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No events are recorded for a forfeit — the winner is credited directly and the
            score shows 0-0.
          </p>
          <Select
            value={winnerId}
            onValueChange={(v) => v && setWinnerId(v)}
            items={teams.map((t) => ({ value: t.id, label: t.name }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select winning team" />
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
        <DialogFooter>
          <Button
            type="button"
            variant="forfeit"
            disabled={!winnerId || pending}
            onClick={handleConfirm}
          >
            {pending ? "Saving…" : "Confirm Forfeit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
