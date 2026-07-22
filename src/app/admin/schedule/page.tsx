import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listUsers } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { SeasonPicker } from "@/components/admin/teams/season-picker";
import { GameRow } from "@/components/admin/schedule/game-row";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season: seasonParam } = await searchParams;
  const supabase = await createClient();

  const { data: seasons } = await supabase
    .from("seasons")
    .select("*")
    .order("year", { ascending: false });

  const seasonId = seasonParam || seasons?.[0]?.id || "";

  if (!seasonId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl">Manage Schedule</h1>
        <p className="text-sm text-muted-foreground">Create a season first.</p>
      </div>
    );
  }

  const [{ data: games }, { data: teams }, users] = await Promise.all([
    supabase
      .from("games")
      .select("*")
      .eq("season_id", seasonId)
      .order("scheduled_at", { ascending: true, nullsFirst: false }),
    supabase.from("teams").select("id, name").eq("season_id", seasonId),
    listUsers(),
  ]);

  const teamNameById = new Map((teams ?? []).map((t) => [t.id, t.name]));
  const scorekeepers = users
    .filter((u) => (u.role === "admin" || u.role === "scorekeeper") && !u.isPending)
    .map((u) => ({ id: u.id, email: u.email }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl">Manage Schedule</h1>
        <div className="flex items-center gap-3">
          <SeasonPicker seasons={seasons ?? []} seasonId={seasonId} />
          <Button
            variant="create"
            nativeButton={false}
            render={<Link href={`/admin/schedule/new?season=${seasonId}`} />}
          >
            <Plus className="size-4" />
            Create Game
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {games?.map((game) => (
          <GameRow
            key={game.id}
            game={game}
            homeTeamName={teamNameById.get(game.home_team_id) ?? "Unknown"}
            awayTeamName={teamNameById.get(game.away_team_id) ?? "Unknown"}
            scorekeepers={scorekeepers}
          />
        ))}
        {games?.length === 0 && (
          <p className="text-sm text-muted-foreground">No games scheduled for this season yet.</p>
        )}
      </div>
    </div>
  );
}
