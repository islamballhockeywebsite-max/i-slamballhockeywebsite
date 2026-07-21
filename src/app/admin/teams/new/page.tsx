import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTeam } from "@/actions/teams";
import { TeamForm } from "@/components/admin/teams/team-form";

export default async function NewTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season: seasonId } = await searchParams;
  if (!seasonId) notFound();

  const supabase = await createClient();
  const { data: divisions } = await supabase
    .from("divisions")
    .select("*")
    .eq("season_id", seasonId)
    .order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Create Team</h1>
      <TeamForm action={createTeam} seasonId={seasonId} divisions={divisions ?? []} />
    </div>
  );
}
