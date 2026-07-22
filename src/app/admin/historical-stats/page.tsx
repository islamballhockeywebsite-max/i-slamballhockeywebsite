import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { StatRow } from "@/components/admin/historical-stats/stat-row";
import { deleteGoalieStat, deleteSkaterStat } from "@/actions/historical-stats";

export default async function HistoricalStatsPage() {
  const supabase = await createClient();

  const [{ data: skaterStats }, { data: goalieStats }, { data: players }] = await Promise.all([
    supabase
      .from("historical_player_season_stats")
      .select("*")
      .order("year", { ascending: false }),
    supabase
      .from("historical_goalie_season_stats")
      .select("*")
      .order("year", { ascending: false }),
    supabase.from("players").select("id, first_name, last_name"),
  ]);

  const playerName = (id: string) => {
    const p = players?.find((pl) => pl.id === id);
    return p ? `${p.first_name} ${p.last_name}` : "Unknown player";
  };

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl">Historical Stats</h1>
        <Button
          variant="csv"
          nativeButton={false}
          render={<Link href="/admin/import?type=historical_skaters" />}
        >
          <Upload className="size-4" />
          CSV Import
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Skaters</h2>
          <Button
            variant="create"
            nativeButton={false}
            render={<Link href="/admin/historical-stats/skaters/new" />}
          >
            <Plus className="size-4" />
            Add Skater Stat Line
          </Button>
        </div>
        {skaterStats?.map((s) => (
          <StatRow
            key={s.id}
            title={playerName(s.player_id)}
            subtitle={String(s.year)}
            line={`${s.team_name ?? "—"} — GP ${s.games_played ?? 0}, G ${s.goals ?? 0}, A ${s.assists ?? 0}, PIM ${s.pim ?? 0}`}
            editHref={`/admin/historical-stats/skaters/${s.id}/edit`}
            onDelete={deleteSkaterStat.bind(null, s.id)}
          />
        ))}
        {skaterStats?.length === 0 && (
          <p className="text-sm text-muted-foreground">No historical skater stats yet.</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Goalies</h2>
          <Button
            variant="create"
            nativeButton={false}
            render={<Link href="/admin/historical-stats/goalies/new" />}
          >
            <Plus className="size-4" />
            Add Goalie Stat Line
          </Button>
        </div>
        {goalieStats?.map((s) => (
          <StatRow
            key={s.id}
            title={playerName(s.player_id)}
            subtitle={String(s.year)}
            line={`${s.team_name ?? "—"} — GP ${s.games_played ?? 0}, W ${s.wins ?? 0}, L ${s.losses ?? 0}, SO ${s.shutouts ?? 0}`}
            editHref={`/admin/historical-stats/goalies/${s.id}/edit`}
            onDelete={deleteGoalieStat.bind(null, s.id)}
          />
        ))}
        {goalieStats?.length === 0 && (
          <p className="text-sm text-muted-foreground">No historical goalie stats yet.</p>
        )}
      </div>
    </div>
  );
}
