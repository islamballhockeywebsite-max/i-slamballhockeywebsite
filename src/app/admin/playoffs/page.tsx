import { createClient } from "@/lib/supabase/server";
import { SeasonPicker } from "@/components/admin/teams/season-picker";
import { SeedForm } from "@/components/admin/playoffs/seed-form";
import { SeriesFormDialog } from "@/components/admin/playoffs/series-form-dialog";
import { SeriesCard } from "@/components/admin/playoffs/series-card";

export default async function PlayoffsPage({
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
        <h1 className="text-3xl">Manage Playoffs</h1>
        <p className="text-sm text-muted-foreground">
          Create a season first (Seasons &amp; Divisions) before managing playoffs.
        </p>
      </div>
    );
  }

  const [{ data: divisions }, { data: teams }, { data: seeds }, { data: series }] = await Promise.all([
    supabase.from("divisions").select("*").eq("season_id", seasonId).order("name"),
    supabase.from("teams").select("*").eq("season_id", seasonId).order("name"),
    supabase.from("playoff_seeds").select("*").eq("season_id", seasonId),
    supabase.from("playoff_series").select("*").eq("season_id", seasonId).order("round"),
  ]);

  const seriesIds = (series ?? []).map((s) => s.id);
  const { data: games } =
    seriesIds.length > 0
      ? await supabase.from("games").select("*").in("series_id", seriesIds).order("scheduled_at")
      : { data: [] };

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl">Manage Playoffs</h1>
        <SeasonPicker seasons={seasons ?? []} seasonId={seasonId} />
      </div>

      {divisions?.length === 0 && (
        <p className="text-sm text-muted-foreground">No divisions yet for this season.</p>
      )}

      {divisions?.map((division) => {
        const divisionTeams = (teams ?? []).filter((t) => t.division_id === division.id);
        const divisionSeeds = (seeds ?? []).filter((s) => s.division_id === division.id);
        const divisionSeries = (series ?? []).filter((s) => s.division_id === division.id);

        return (
          <div key={division.id} className="space-y-4">
            <h2 className="text-xl">{division.name}</h2>
            <SeedForm
              seasonId={seasonId}
              divisionId={division.id}
              teams={divisionTeams}
              existingSeeds={divisionSeeds}
            />

            <div className="flex items-center justify-between">
              <span className="font-heading">Bracket</span>
              <SeriesFormDialog
                seasonId={seasonId}
                divisionId={division.id}
                teams={divisionTeams}
                otherSeries={divisionSeries}
              />
            </div>

            <div className="space-y-3">
              {divisionSeries.map((s) => (
                <SeriesCard
                  key={s.id}
                  series={s}
                  teams={divisionTeams}
                  otherSeries={divisionSeries.filter((other) => other.id !== s.id)}
                  games={(games ?? []).filter((g) => g.series_id === s.id)}
                />
              ))}
              {divisionSeries.length === 0 && (
                <p className="text-sm text-muted-foreground">No playoff series yet for this division.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
