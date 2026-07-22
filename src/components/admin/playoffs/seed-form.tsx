"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { setSeeds } from "@/actions/playoffs";
import type { Database } from "@/lib/supabase/types";

type Team = Database["public"]["Tables"]["teams"]["Row"];
type PlayoffSeed = Database["public"]["Tables"]["playoff_seeds"]["Row"];

export function SeedForm({
  seasonId,
  divisionId,
  teams,
  existingSeeds,
}: {
  seasonId: string;
  divisionId: string;
  teams: Team[];
  existingSeeds: PlayoffSeed[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [seedByTeam, setSeedByTeam] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      teams.map((t) => [
        t.id,
        String(existingSeeds.find((s) => s.team_id === t.id)?.seed ?? ""),
      ]),
    ),
  );

  function handleSave() {
    startTransition(async () => {
      const seeds = Object.entries(seedByTeam)
        .map(([team_id, seed]) => ({ team_id, seed: Number(seed) }))
        .filter((s) => Number.isFinite(s.seed) && s.seed > 0);

      const seedValues = seeds.map((s) => s.seed);
      if (new Set(seedValues).size !== seedValues.length) {
        alert("Seed numbers must be unique.");
        return;
      }

      const result = await setSeeds(seasonId, divisionId, seeds);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <AdminCard className="space-y-3">
      <span className="font-heading">Seeds</span>
      {teams.length === 0 && <p className="text-sm text-muted-foreground">No teams in this division.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {teams.map((t) => (
          <div key={t.id} className="space-y-1">
            <Label htmlFor={`seed-${t.id}`} className="text-xs">
              {t.name}
            </Label>
            <Input
              id={`seed-${t.id}`}
              type="number"
              min={1}
              value={seedByTeam[t.id]}
              onChange={(e) => setSeedByTeam((prev) => ({ ...prev, [t.id]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      {teams.length > 0 && (
        <Button variant="create" disabled={pending} onClick={handleSave}>
          {pending ? "Saving…" : "Save Seeds"}
        </Button>
      )}
    </AdminCard>
  );
}
