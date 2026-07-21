import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SeasonRow } from "@/components/admin/seasons/season-row";

export default async function SeasonsPage() {
  const supabase = await createClient();

  const [{ data: seasons, error }, { data: divisions }] = await Promise.all([
    supabase.from("seasons").select("*").order("year", { ascending: false }),
    supabase.from("divisions").select("*").order("name", { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl">Manage Seasons</h1>
        <Button variant="create" nativeButton={false} render={<Link href="/admin/seasons/new" />}>
          <Plus className="size-4" />
          Create Season
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <div className="space-y-6">
        {seasons?.map((season) => (
          <SeasonRow
            key={season.id}
            season={season}
            divisions={divisions?.filter((d) => d.season_id === season.id) ?? []}
          />
        ))}
        {seasons?.length === 0 && (
          <p className="text-sm text-muted-foreground">No seasons yet.</p>
        )}
      </div>
    </div>
  );
}
