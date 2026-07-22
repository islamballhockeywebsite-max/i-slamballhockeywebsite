"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeriesFormDialog } from "@/components/admin/playoffs/series-form-dialog";
import { PlayoffGameDialog } from "@/components/admin/playoffs/playoff-game-dialog";
import { deleteSeries } from "@/actions/playoffs";
import type { Database } from "@/lib/supabase/types";

type Team = Database["public"]["Tables"]["teams"]["Row"];
type Series = Database["public"]["Tables"]["playoff_series"]["Row"];
type Game = Database["public"]["Tables"]["games"]["Row"];

export function SeriesCard({
  series,
  teams,
  otherSeries,
  games,
}: {
  series: Series;
  teams: Team[];
  otherSeries: Series[];
  games: Game[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const teamName = (id: string | null) => teams.find((t) => t.id === id)?.name ?? "TBD";
  const highSeedTeam = teams.find((t) => t.id === series.high_seed_team_id) ?? null;
  const lowSeedTeam = teams.find((t) => t.id === series.low_seed_team_id) ?? null;

  function handleDelete() {
    if (!confirm(`Delete this series (Round ${series.round})? Its games will be unlinked, not deleted.`)) return;
    startTransition(async () => {
      const result = await deleteSeries(series.id);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <AdminCard className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="font-heading">
            Round {series.round}
            {series.label ? ` — ${series.label}` : ""}
          </span>
          <p className="text-sm text-muted-foreground">
            {teamName(series.high_seed_team_id)} ({series.high_seed_wins}) vs {teamName(series.low_seed_team_id)} (
            {series.low_seed_wins}) — best of {series.best_of}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="capitalize">
            {series.status.replace("_", " ")}
          </Badge>
          {series.winner_team_id && <Badge variant="default">{teamName(series.winner_team_id)} wins</Badge>}
          <PlayoffGameDialog seriesId={series.id} highSeedTeam={highSeedTeam} lowSeedTeam={lowSeedTeam} />
          <SeriesFormDialog
            seasonId={series.season_id}
            divisionId={series.division_id}
            teams={teams}
            otherSeries={otherSeries}
            series={series}
          />
          <Button type="button" variant="delete" size="icon" title="Delete" disabled={pending} onClick={handleDelete}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {games.length > 0 && (
        <div className="ml-4 space-y-1.5 border-l-2 pl-4">
          {games.map((g) => (
            <div key={g.id} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {teamName(g.home_team_id)} vs {teamName(g.away_team_id)}
              </span>
              <Badge variant="outline" className="capitalize">
                {g.is_forfeit ? "Forfeit" : g.status.replace("_", " ")}
              </Badge>
              {g.status === "final" && (
                <span>
                  {g.home_score} - {g.away_score}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminCard>
  );
}
