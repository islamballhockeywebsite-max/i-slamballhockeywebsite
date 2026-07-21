import { createClient } from "@/lib/supabase/server";
import { SeasonPicker } from "@/components/admin/teams/season-picker";
import { AdminCard } from "@/components/admin/admin-card";
import { AssignPlayerForm } from "@/components/admin/rosters/assign-player-form";
import { RosterEntryRow } from "@/components/admin/rosters/roster-entry-row";

export default async function RostersPage({
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
        <h1 className="text-3xl">Manage Rosters</h1>
        <p className="text-sm text-muted-foreground">
          Create a season and teams first before managing rosters.
        </p>
      </div>
    );
  }

  const [{ data: teams }, { data: allPlayers }] = await Promise.all([
    supabase.from("teams").select("*").eq("season_id", seasonId).order("name"),
    supabase.from("players").select("id, first_name, last_name").order("last_name"),
  ]);

  const teamIds = (teams ?? []).map((t) => t.id);
  const { data: rosters } =
    teamIds.length > 0
      ? await supabase
          .from("rosters")
          .select("*, players(first_name, last_name)")
          .in("team_id", teamIds)
          .eq("status", "active")
          .order("jersey_number")
      : { data: [] };

  const rosteredPlayerIds = new Set((rosters ?? []).map((r) => r.player_id));
  const availablePlayers = (allPlayers ?? []).filter((p) => !rosteredPlayerIds.has(p.id));

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl">Manage Rosters</h1>
        <SeasonPicker seasons={seasons ?? []} seasonId={seasonId} />
      </div>

      {teams?.length === 0 && (
        <p className="text-sm text-muted-foreground">No teams yet for this season.</p>
      )}

      {teams?.map((team) => {
        const teamRoster = (rosters ?? []).filter((r) => r.team_id === team.id);
        return (
          <div key={team.id} className="space-y-3">
            <AdminCard className="flex items-center justify-between">
              <span className="font-heading text-lg">{team.name}</span>
              <AssignPlayerForm teamId={team.id} availablePlayers={availablePlayers} />
            </AdminCard>

            <div className="ml-8 space-y-2">
              {teamRoster.map((entry) => (
                <RosterEntryRow
                  key={entry.id}
                  entry={entry}
                  playerName={
                    entry.players ? `${entry.players.first_name} ${entry.players.last_name}` : "Unknown player"
                  }
                  otherTeams={teams ?? []}
                />
              ))}
              {teamRoster.length === 0 && (
                <p className="text-sm text-muted-foreground">No players on this roster yet.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
