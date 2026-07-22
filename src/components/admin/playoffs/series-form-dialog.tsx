"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
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
import { createSeries, updateSeries } from "@/actions/playoffs";
import type { Database } from "@/lib/supabase/types";

type Team = Database["public"]["Tables"]["teams"]["Row"];
type Series = Database["public"]["Tables"]["playoff_series"]["Row"];

const NONE = "none";

export function SeriesFormDialog({
  seasonId,
  divisionId,
  teams,
  otherSeries,
  series,
}: {
  seasonId: string;
  divisionId: string;
  teams: Team[];
  otherSeries: Series[];
  series?: Series;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [round, setRound] = useState(String(series?.round ?? 1));
  const [label, setLabel] = useState(series?.label ?? "");
  const [highSeedTeamId, setHighSeedTeamId] = useState(series?.high_seed_team_id ?? NONE);
  const [lowSeedTeamId, setLowSeedTeamId] = useState(series?.low_seed_team_id ?? NONE);
  const [bestOf, setBestOf] = useState(String(series?.best_of ?? 3));
  const [advancesTo, setAdvancesTo] = useState(series?.advances_to_series_id ?? NONE);

  function handleSubmit() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("round", round);
      formData.set("label", label);
      formData.set("high_seed_team_id", highSeedTeamId === NONE ? "" : highSeedTeamId);
      formData.set("low_seed_team_id", lowSeedTeamId === NONE ? "" : lowSeedTeamId);
      formData.set("best_of", bestOf);
      formData.set("advances_to_series_id", advancesTo === NONE ? "" : advancesTo);
      if (series) formData.set("id", series.id);

      const result = series
        ? await updateSeries({}, formData)
        : await createSeries(seasonId, divisionId, {}, formData);
      if (result.error) {
        alert(result.error);
        return;
      }
      if (result.fieldErrors) {
        alert(Object.values(result.fieldErrors)[0]);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  const teamOptions = [{ value: NONE, label: "TBD" }, ...teams.map((t) => ({ value: t.id, label: t.name }))];
  const advancesOptions = [
    { value: NONE, label: "None (final round)" },
    ...otherSeries.map((s) => ({ value: s.id, label: `Round ${s.round}${s.label ? ` — ${s.label}` : ""}` })),
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {series ? (
        <Button variant="edit" size="icon" title="Edit" onClick={() => setOpen(true)}>
          <Pencil className="size-4" />
        </Button>
      ) : (
        <Button variant="create" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Add Series
        </Button>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{series ? "Edit Series" : "Add Series"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="series-round">Round*</Label>
              <Input id="series-round" type="number" min={1} value={round} onChange={(e) => setRound(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="series-best-of">Best of</Label>
              <Input
                id="series-best-of"
                type="number"
                min={1}
                step={2}
                value={bestOf}
                onChange={(e) => setBestOf(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="series-label">Label</Label>
            <Input
              id="series-label"
              placeholder="e.g. Semifinal"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>High seed</Label>
              <Select value={highSeedTeamId} onValueChange={(v) => v && setHighSeedTeamId(v)} items={teamOptions}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Low seed</Label>
              <Select value={lowSeedTeamId} onValueChange={(v) => v && setLowSeedTeamId(v)} items={teamOptions}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Winner advances to</Label>
            <Select value={advancesTo} onValueChange={(v) => v && setAdvancesTo(v)} items={advancesOptions}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {advancesOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="create" disabled={pending} onClick={handleSubmit}>
            {pending ? "Saving…" : series ? "Save Changes" : "Create Series"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
