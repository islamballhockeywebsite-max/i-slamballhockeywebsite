import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminCard } from "@/components/admin/admin-card";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: game } = await supabase.from("games").select("*").eq("id", id).maybeSingle();

  if (!game) notFound();

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .in("id", [game.home_team_id, game.away_team_id]);
  const teamName = (id: string) => teams?.find((t) => t.id === id)?.name ?? "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">
            {teamName(game.home_team_id)} vs {teamName(game.away_team_id)}
          </h1>
          <div className="mt-1 flex gap-2">
            <Badge variant="outline" className="capitalize">
              {game.is_forfeit ? "Forfeit" : game.status.replace("_", " ")}
            </Badge>
            {game.is_playoff && <Badge variant="outline">Playoff</Badge>}
          </div>
        </div>
        <Button variant="edit" nativeButton={false} render={<Link href={`/admin/schedule/${game.id}/edit`} />}>
          <Pencil className="size-4" />
          Edit
        </Button>
      </div>

      <AdminCard className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Date &amp; time</p>
          <p>{game.scheduled_at ? new Date(game.scheduled_at).toLocaleString() : "TBD"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Location</p>
          <p>{game.location ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Score</p>
          <p>
            {game.status === "final"
              ? `${game.home_score} - ${game.away_score}`
              : "Not final yet"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Winner</p>
          <p>{game.winner_team_id ? teamName(game.winner_team_id) : "—"}</p>
        </div>
      </AdminCard>
    </div>
  );
}
