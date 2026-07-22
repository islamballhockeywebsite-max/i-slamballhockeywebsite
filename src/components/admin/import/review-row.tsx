"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ToggleField } from "@/components/admin/toggle-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resolveRowPlayer, setRowSkip } from "@/actions/import";
import type { Database } from "@/lib/supabase/types";

type ImportRow = Database["public"]["Tables"]["import_rows"]["Row"];
type Player = { id: string; first_name: string; last_name: string };

export function ReviewRow({
  row,
  batchId,
  needsPlayerResolve,
  players,
}: {
  row: ImportRow;
  batchId: string;
  needsPlayerResolve: boolean;
  players: Player[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const mapped = (row.mapped as Record<string, unknown> | null) ?? (row.raw as Record<string, unknown>);
  const preview = Object.entries(mapped)
    .filter(([, v]) => v !== null && v !== "")
    .slice(0, 6)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  function handleSkipToggle(checked: boolean) {
    startTransition(async () => {
      const result = await setRowSkip(row.id, batchId, checked);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  function handleResolve(playerId: string) {
    startTransition(async () => {
      const result = await resolveRowPlayer(row.id, batchId, playerId);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  const statusVariant = row.status === "valid" ? "default" : row.status === "invalid" ? "destructive" : "outline";

  return (
    <div className="space-y-1.5 rounded-lg border px-3 py-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">#{row.row_number}</span>
          <Badge variant={statusVariant} className="capitalize">
            {row.status}
          </Badge>
          {row.skip && <Badge variant="outline">Skipped</Badge>}
        </div>
        <ToggleField
          id={`skip-${row.id}`}
          label="Skip"
          checked={row.skip}
          onCheckedChange={handleSkipToggle}
          disabled={pending}
        />
      </div>
      <p className="truncate text-muted-foreground">{preview}</p>
      {row.validation_errors && (
        <p className="text-destructive">{(row.validation_errors as string[]).join("; ")}</p>
      )}
      {needsPlayerResolve && (
        <div className="w-64">
          <Select
            value={row.dedupe_match_player_id ?? ""}
            onValueChange={(v) => v && handleResolve(v)}
            items={players.map((p) => ({ value: p.id, label: `${p.first_name} ${p.last_name}` }))}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="Resolve to player…" />
            </SelectTrigger>
            <SelectContent>
              {players.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
