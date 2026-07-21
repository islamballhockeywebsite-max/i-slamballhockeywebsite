import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateTeam } from "@/actions/teams";
import { TeamForm } from "@/components/admin/teams/team-form";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: team } = await supabase.from("teams").select("*").eq("id", id).maybeSingle();

  if (!team) notFound();

  const { data: divisions } = await supabase
    .from("divisions")
    .select("*")
    .eq("season_id", team.season_id)
    .order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Edit Team</h1>
      <TeamForm action={updateTeam} seasonId={team.season_id} divisions={divisions ?? []} team={team} />
    </div>
  );
}
