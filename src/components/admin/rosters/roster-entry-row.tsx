"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { Button } from "@/components/ui/button";
import { ToggleField } from "@/components/admin/toggle-field";
import { TradeDialog } from "@/components/admin/rosters/trade-dialog";
import { EditRosterDialog } from "@/components/admin/rosters/edit-roster-dialog";
import { removeFromRoster, setRosterSpare } from "@/actions/rosters";
import type { Database } from "@/lib/supabase/types";

type Roster = Database["public"]["Tables"]["rosters"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];

export function RosterEntryRow({
  entry,
  playerName,
  otherTeams,
}: {
  entry: Roster;
  playerName: string;
  otherTeams: Team[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSpareToggle(checked: boolean) {
    startTransition(async () => {
      const result = await setRosterSpare(entry.id, checked);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm(`Remove ${playerName} from this roster?`)) return;
    startTransition(async () => {
      const result = await removeFromRoster(entry.id);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <AdminCard className="flex items-center justify-between gap-4 py-3">
      <span className="font-heading text-base">
        {entry.jersey_number != null && (
          <span className="mr-2 text-muted-foreground">#{entry.jersey_number}</span>
        )}
        {playerName}
      </span>

      <div className="flex items-center gap-3">
        <ToggleField
          id={`spare-${entry.id}`}
          label="Spare?"
          checked={entry.is_spare}
          onCheckedChange={handleSpareToggle}
          disabled={pending}
        />
        <TradeDialog
          rosterId={entry.id}
          playerId={entry.player_id}
          playerName={playerName}
          currentTeamId={entry.team_id}
          otherTeams={otherTeams}
        />
        <Button
          variant="view"
          size="icon"
          title="View"
          nativeButton={false}
          render={<Link href={`/admin/players/${entry.player_id}`} />}
        >
          <Eye className="size-4" />
        </Button>
        <EditRosterDialog entry={entry} playerName={playerName} />
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
  );
}
