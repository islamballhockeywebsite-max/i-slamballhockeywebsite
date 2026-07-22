import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PlayerFilters } from "@/components/admin/players/player-filters";
import { PlayerRow } from "@/components/admin/players/player-row";

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; position?: string }>;
}) {
  const { search = "", status = "", position = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("players")
    .select("*")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`,
    );
  }
  if (status && status !== "all") {
    query = query.eq("status", status as "active" | "inactive");
  }
  if (position && position !== "all") {
    query = query.eq("default_position", position as "forward" | "defense" | "goalie");
  }

  const { data: players, error } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl">Manage Players</h1>
        <div className="flex gap-2">
          <Button variant="csv" nativeButton={false} render={<Link href="/admin/import?type=players" />}>
            <Upload className="size-4" />
            CSV Import
          </Button>
          <Button variant="create" nativeButton={false} render={<Link href="/admin/players/new" />}>
            <Plus className="size-4" />
            Create Player
          </Button>
        </div>
      </div>

      <PlayerFilters search={search} status={status} position={position} />

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <div className="space-y-3">
        {players?.map((player) => (
          <PlayerRow key={player.id} player={player} />
        ))}
        {players?.length === 0 && (
          <p className="text-sm text-muted-foreground">No players found.</p>
        )}
      </div>
    </div>
  );
}
