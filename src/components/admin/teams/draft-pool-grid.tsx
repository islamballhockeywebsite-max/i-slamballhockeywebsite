"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignPlayerToTeam, removeFromPool } from "@/actions/draft";
import type { Database } from "@/lib/supabase/types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

export type PoolEntry = {
  seasonPlayerId: string;
  playerId: string;
  name: string;
};

export function DraftPoolGrid({ pool, teams }: { pool: PoolEntry[]; teams: Team[] }) {
  if (pool.length === 0) {
    return <p className="text-sm text-muted-foreground">No players waiting in the draft pool.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {pool.map((entry, index) => (
        <PoolCard key={entry.seasonPlayerId} entry={entry} index={index + 1} teams={teams} />
      ))}
    </div>
  );
}

function PoolCard({ entry, index, teams }: { entry: PoolEntry; index: number; teams: Team[] }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleAssign(teamId: string | null) {
    if (!teamId) return;
    startTransition(async () => {
      const result = await assignPlayerToTeam(entry.playerId, teamId);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeFromPool(entry.seasonPlayerId);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  return (
    <AdminCard className="relative space-y-2 p-3">
      <button
        type="button"
        title="Remove from pool"
        disabled={pending}
        onClick={handleRemove}
        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
      >
        <X className="size-3.5" />
      </button>
      <span className="font-heading text-2xl text-muted-foreground">{index}</span>
      <p className="truncate text-sm font-medium">{entry.name}</p>
      <Select
        onValueChange={handleAssign}
        disabled={pending || teams.length === 0}
        items={teams.map((t) => ({ value: t.id, label: t.name }))}
      >
        <SelectTrigger className="w-full" size="sm">
          <SelectValue placeholder="Assign team" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </AdminCard>
  );
}
