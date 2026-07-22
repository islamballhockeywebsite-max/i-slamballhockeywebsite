"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPlayoffGame } from "@/actions/playoffs";

type Team = { id: string; name: string };

export function PlayoffGameDialog({
  seriesId,
  highSeedTeam,
  lowSeedTeam,
}: {
  seriesId: string;
  highSeedTeam: Team | null;
  lowSeedTeam: Team | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const canCreate = !!highSeedTeam && !!lowSeedTeam;
  const [homeTeamId, setHomeTeamId] = useState(highSeedTeam?.id ?? "");
  const [awayTeamId, setAwayTeamId] = useState(lowSeedTeam?.id ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [location, setLocation] = useState("");

  const teams = [highSeedTeam, lowSeedTeam].filter(Boolean) as Team[];

  function handleSubmit() {
    startTransition(async () => {
      const result = await createPlayoffGame(seriesId, {
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        scheduled_at: scheduledAt || null,
        location: location || null,
      });
      if (result.error) {
        alert(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="create" size="sm" disabled={!canCreate} title={canCreate ? "" : "Set both teams first"} onClick={() => setOpen(true)}>
        <CalendarPlus className="size-3.5" />
        Add Game
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Playoff Game</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Home team</Label>
              <Select
                value={homeTeamId}
                onValueChange={(v) => v && setHomeTeamId(v)}
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
              <Label>Away team</Label>
              <Select
                value={awayTeamId}
                onValueChange={(v) => v && setAwayTeamId(v)}
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pg-scheduled">Date &amp; time</Label>
            <Input
              id="pg-scheduled"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pg-location">Location</Label>
            <Input id="pg-location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="create" disabled={homeTeamId === awayTeamId || pending} onClick={handleSubmit}>
            {pending ? "Saving…" : "Create Game"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
