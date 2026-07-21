import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePlayer } from "@/actions/players";
import { PlayerForm } from "@/components/admin/players/player-form";

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: player } = await supabase.from("players").select("*").eq("id", id).maybeSingle();

  if (!player) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Edit Player</h1>
      <PlayerForm action={updatePlayer} player={player} />
    </div>
  );
}
