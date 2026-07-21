import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SeasonPicker } from "@/components/admin/teams/season-picker";
import { TeamRow } from "@/components/admin/teams/team-row";
import { EnrollPlayersForm } from "@/components/admin/teams/enroll-players-form";
import { DraftPoolGrid, type PoolEntry } from "@/components/admin/teams/draft-pool-grid";

export default async function TeamsPage({
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
        <h1 className="text-3xl">Manage Teams</h1>
        <p className="text-sm text-muted-foreground">
          Create a season first (Seasons &amp; Divisions) before managing teams.
        </p>
      </div>
    );
  }

  const [{ data: divisions }, { data: teams }, { data: seasonPlayers }, { data: allPlayers }] =
    await Promise.all([
      supabase.from("divisions").select("*").eq("season_id", seasonId).order("name"),
      supabase.from("teams").select("*").eq("season_id", seasonId).order("name"),
      supabase
        .from("season_players")
        .select("id, player_id, players(first_name, last_name)")
        .eq("season_id", seasonId),
      supabase.from("players").select("id, first_name, last_name").order("last_name"),
    ]);

  const teamIds = (teams ?? []).map((t) => t.id);
  const { data: rosters } =
    teamIds.length > 0
      ? await supabase.from("rosters").select("player_id").in("team_id", teamIds)
      : { data: [] as { player_id: string }[] };

  const rosteredPlayerIds = new Set((rosters ?? []).map((r) => r.player_id));
  const enrolledPlayerIds = new Set((seasonPlayers ?? []).map((sp) => sp.player_id));

  const pool: PoolEntry[] = (seasonPlayers ?? [])
    .filter((sp) => !rosteredPlayerIds.has(sp.player_id))
    .map((sp) => ({
      seasonPlayerId: sp.id,
      playerId: sp.player_id,
      name: sp.players ? `${sp.players.first_name} ${sp.players.last_name}` : "Unknown player",
    }));

  const eligiblePlayers = (allPlayers ?? []).filter((p) => !enrolledPlayerIds.has(p.id));

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl">Manage Teams</h1>
        <SeasonPicker seasons={seasons ?? []} seasonId={seasonId} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Teams</h2>
          <Button
            variant="create"
            nativeButton={false}
            render={<Link href={`/admin/teams/new?season=${seasonId}`} />}
          >
            <Plus className="size-4" />
            Create Team
          </Button>
        </div>
        {teams?.map((team) => (
          <TeamRow key={team.id} team={team} />
        ))}
        {teams?.length === 0 && (
          <p className="text-sm text-muted-foreground">No teams yet for this season.</p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl">Manage Draft</h2>
        <EnrollPlayersForm
          seasonId={seasonId}
          divisions={divisions ?? []}
          eligiblePlayers={eligiblePlayers}
        />
        <DraftPoolGrid pool={pool} teams={teams ?? []} />
      </div>
    </div>
  );
}
