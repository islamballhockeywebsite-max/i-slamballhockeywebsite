import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateGame } from "@/actions/schedule";
import { GameForm } from "@/components/admin/schedule/game-form";

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: game } = await supabase.from("games").select("*").eq("id", id).maybeSingle();

  if (!game) notFound();

  const [{ data: divisions }, { data: teams }] = await Promise.all([
    supabase.from("divisions").select("*").eq("season_id", game.season_id).order("name"),
    supabase.from("teams").select("*").eq("season_id", game.season_id).order("name"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Edit Game</h1>
      <GameForm
        action={updateGame}
        seasonId={game.season_id}
        divisions={divisions ?? []}
        teams={teams ?? []}
        game={game}
      />
    </div>
  );
}
