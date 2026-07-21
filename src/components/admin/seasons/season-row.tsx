"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleField } from "@/components/admin/toggle-field";
import { DivisionRow } from "@/components/admin/seasons/division-row";
import { setSeasonPlayoffsActive, deleteSeason } from "@/actions/seasons";
import type { Database } from "@/lib/supabase/types";

type Season = Database["public"]["Tables"]["seasons"]["Row"];
type Division = Database["public"]["Tables"]["divisions"]["Row"];

export function SeasonRow({
  season,
  divisions,
}: {
  season: Season;
  divisions: Division[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handlePlayoffsToggle(checked: boolean) {
    startTransition(async () => {
      const result = await setSeasonPlayoffsActive(season.id, checked);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  function handleDelete() {
    if (
      !confirm(
        `Delete season "${season.name}"? This also deletes its divisions, teams, games, and all related data. This cannot be undone.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteSeason(season.id);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <AdminCard className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg">{season.name}</span>
          <Badge variant="outline" className="capitalize">
            {season.status}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <ToggleField
            id={`playoffs-${season.id}`}
            label="Playoffs?"
            checked={season.playoffs_active}
            onCheckedChange={handlePlayoffsToggle}
            disabled={pending}
          />
          <Button
            variant="create"
            nativeButton={false}
            render={<Link href={`/admin/seasons/${season.id}/divisions/new`} />}
          >
            <Plus className="size-4" />
            Add Division
          </Button>
          <Button
            variant="view"
            size="icon"
            title="View"
            nativeButton={false}
            render={<Link href={`/admin/seasons/${season.id}`} />}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            variant="edit"
            size="icon"
            title="Edit"
            nativeButton={false}
            render={<Link href={`/admin/seasons/${season.id}/edit`} />}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="delete"
            size="icon"
            title="Delete"
            disabled={pending}
            onClick={handleDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </AdminCard>

      {divisions.length > 0 && (
        <div className="ml-8 space-y-2">
          {divisions.map((division) => (
            <DivisionRow key={division.id} division={division} />
          ))}
        </div>
      )}
    </div>
  );
}
