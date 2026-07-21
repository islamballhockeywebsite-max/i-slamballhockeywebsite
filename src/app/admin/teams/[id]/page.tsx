import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/admin-card";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase.from("teams").select("*, divisions(name)").eq("id", id).maybeSingle();
  if (!team) notFound();

  const { data: roster } = await supabase
    .from("rosters")
    .select("id, jersey_number, role, is_spare, players(first_name, last_name)")
    .eq("team_id", id)
    .eq("status", "active")
    .order("jersey_number");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">{team.name}</h1>
          <p className="text-sm text-muted-foreground">{team.divisions?.name}</p>
        </div>
        <Button variant="edit" nativeButton={false} render={<Link href={`/admin/teams/${team.id}/edit`} />}>
          <Pencil className="size-4" />
          Edit
        </Button>
      </div>

      <div>
        <h2 className="mb-2 text-xl">Roster</h2>
        {roster && roster.length > 0 ? (
          <div className="space-y-2">
            {roster.map((r) => (
              <AdminCard key={r.id} className="flex items-center justify-between py-3">
                <span>
                  {r.jersey_number != null && (
                    <span className="mr-2 text-muted-foreground">#{r.jersey_number}</span>
                  )}
                  {r.players ? `${r.players.first_name} ${r.players.last_name}` : "Unknown player"}
                </span>
                <span className="text-sm capitalize text-muted-foreground">
                  {r.is_spare ? "Spare" : r.role}
                </span>
              </AdminCard>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No players on this roster yet — assign players from the draft pool.
          </p>
        )}
      </div>
    </div>
  );
}
