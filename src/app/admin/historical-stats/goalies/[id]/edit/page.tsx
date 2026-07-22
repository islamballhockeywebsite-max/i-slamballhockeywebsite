import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateGoalieStat } from "@/actions/historical-stats";
import { GoalieStatForm } from "@/components/admin/historical-stats/goalie-stat-form";

export default async function EditGoalieStatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: stat }, { data: players }] = await Promise.all([
    supabase.from("historical_goalie_season_stats").select("*").eq("id", id).maybeSingle(),
    supabase.from("players").select("id, first_name, last_name").order("last_name"),
  ]);

  if (!stat) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Edit Goalie Stat Line</h1>
      <GoalieStatForm action={updateGoalieStat} players={players ?? []} stat={stat} />
    </div>
  );
}
