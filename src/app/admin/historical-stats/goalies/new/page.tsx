import { createClient } from "@/lib/supabase/server";
import { createGoalieStat } from "@/actions/historical-stats";
import { GoalieStatForm } from "@/components/admin/historical-stats/goalie-stat-form";

export default async function NewGoalieStatPage() {
  const supabase = await createClient();
  const { data: players } = await supabase
    .from("players")
    .select("id, first_name, last_name")
    .order("last_name");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Add Goalie Stat Line</h1>
      <GoalieStatForm action={createGoalieStat} players={players ?? []} />
    </div>
  );
}
