import { createClient } from "@/lib/supabase/server";
import { createSkaterStat } from "@/actions/historical-stats";
import { SkaterStatForm } from "@/components/admin/historical-stats/skater-stat-form";

export default async function NewSkaterStatPage() {
  const supabase = await createClient();
  const { data: players } = await supabase
    .from("players")
    .select("id, first_name, last_name")
    .order("last_name");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Add Skater Stat Line</h1>
      <SkaterStatForm action={createSkaterStat} players={players ?? []} />
    </div>
  );
}
