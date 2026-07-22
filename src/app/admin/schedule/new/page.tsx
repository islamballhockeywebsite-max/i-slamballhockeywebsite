import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createGame } from "@/actions/schedule";
import { GameForm } from "@/components/admin/schedule/game-form";

export default async function NewGamePage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { season: seasonId } = await searchParams;
  if (!seasonId) notFound();

  const supabase = await createClient();
  const [{ data: divisions }, { data: teams }] = await Promise.all([
    supabase.from("divisions").select("*").eq("season_id", seasonId).order("name"),
    supabase.from("teams").select("*").eq("season_id", seasonId).order("name"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Create Game</h1>
      <GameForm
        action={createGame}
        seasonId={seasonId}
        divisions={divisions ?? []}
        teams={teams ?? []}
      />
    </div>
  );
}
