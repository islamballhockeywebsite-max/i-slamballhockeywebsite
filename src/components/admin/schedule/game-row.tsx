"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2, CalendarClock } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ForfeitDialog } from "@/components/admin/schedule/forfeit-dialog";
import { assignScorekeeper, deleteGame, postponeGame } from "@/actions/schedule";
import type { Database } from "@/lib/supabase/types";

type Game = Database["public"]["Tables"]["games"]["Row"];

export type ScorekeeperOption = { id: string; email: string | null };

export function GameRow({
  game,
  homeTeamName,
  awayTeamName,
  scorekeepers,
}: {
  game: Game;
  homeTeamName: string;
  awayTeamName: string;
  scorekeepers: ScorekeeperOption[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleScorekeeperChange(value: string | null) {
    startTransition(async () => {
      const result = await assignScorekeeper(game.id, value === "none" ? null : value);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  function handlePostpone() {
    startTransition(async () => {
      const result = await postponeGame(game.id);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm(`Delete ${homeTeamName} vs ${awayTeamName}? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteGame(game.id);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  const canForfeit = game.status === "scheduled" || game.status === "postponed";
  const canPostpone = game.status === "scheduled";

  return (
    <AdminCard className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="font-heading text-lg">
            {homeTeamName} vs {awayTeamName}
          </span>
          <Badge variant="outline" className="ml-2 capitalize">
            {game.is_forfeit ? "Forfeit" : game.status.replace("_", " ")}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          {canForfeit && (
            <ForfeitDialog
              gameId={game.id}
              homeTeam={{ id: game.home_team_id, name: homeTeamName }}
              awayTeam={{ id: game.away_team_id, name: awayTeamName }}
            />
          )}
          {canPostpone && (
            <Button variant="postpone" disabled={pending} onClick={handlePostpone}>
              <CalendarClock className="size-4" />
              Postpone
            </Button>
          )}
          <Button
            variant="view"
            size="icon"
            title="View"
            nativeButton={false}
            render={<Link href={`/admin/schedule/${game.id}`} />}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            variant="edit"
            size="icon"
            title="Edit"
            nativeButton={false}
            render={<Link href={`/admin/schedule/${game.id}/edit`} />}
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
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          {game.scheduled_at ? new Date(game.scheduled_at).toLocaleString() : "Time TBD"}
          {game.location ? ` — ${game.location}` : ""}
        </span>
      </div>

      <div className="w-56">
        <Select
          value={game.scorekeeper_id ?? "none"}
          onValueChange={handleScorekeeperChange}
          disabled={pending}
          items={[
            { value: "none", label: "Assign scorekeeper" },
            ...scorekeepers.map((s) => ({ value: s.id, label: s.email ?? s.id })),
          ]}
        >
          <SelectTrigger className="w-full" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Assign scorekeeper</SelectItem>
            {scorekeepers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.email ?? s.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </AdminCard>
  );
}
