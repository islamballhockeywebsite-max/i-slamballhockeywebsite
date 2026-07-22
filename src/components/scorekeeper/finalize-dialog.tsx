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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FinalizeGameInput } from "@/lib/validation/scorekeeper";

type Team = { id: string; name: string };

const resultTypes = [
  { value: "regulation", label: "Regulation" },
  { value: "overtime", label: "Overtime" },
  { value: "shootout", label: "Shootout" },
  { value: "tie", label: "Tie" },
];

export function FinalizeDialog({
  open,
  onOpenChange,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  onSubmit: (input: FinalizeGameInput) => Promise<{ error?: string }>;
}) {
  const [resultType, setResultType] = useState<FinalizeGameInput["result_type"]>("regulation");
  const [winnerTeamId, setWinnerTeamId] = useState<string>("");
  const [pending, setPending] = useState(false);

  const teams = [homeTeam, awayTeam];
  const isTie = resultType === "tie";

  async function handleSubmit() {
    setPending(true);
    const result = await onSubmit({
      result_type: resultType,
      winner_team_id: isTie ? null : winnerTeamId || null,
    });
    setPending(false);
    if (result.error) {
      alert(result.error);
      return;
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Finalize Game</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Logged score: {homeTeam.name} {homeScore} — {awayScore} {awayTeam.name}. This won&apos;t
            change once finalized except via a correction.
          </p>

          <div className="space-y-1.5">
            <Label>Result</Label>
            <Select
              value={resultType}
              onValueChange={(v) => v && setResultType(v as FinalizeGameInput["result_type"])}
              items={resultTypes}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {resultTypes.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isTie && (
            <div className="space-y-1.5">
              <Label>Winner</Label>
              <Select
                value={winnerTeamId}
                onValueChange={(v) => v && setWinnerTeamId(v)}
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
          )}
        </div>
        <DialogFooter>
          <Button
            variant="create"
            disabled={(!isTie && !winnerTeamId) || pending}
            onClick={handleSubmit}
          >
            {pending ? "Finalizing…" : "Confirm Finalize"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
