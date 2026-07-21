import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminCard } from "@/components/admin/admin-card";

export default async function SeasonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: season }, { data: divisions }] = await Promise.all([
    supabase.from("seasons").select("*").eq("id", id).maybeSingle(),
    supabase.from("divisions").select("*").eq("season_id", id).order("name"),
  ]);

  if (!season) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">{season.name}</h1>
          <div className="mt-1 flex gap-2">
            <Badge variant="outline" className="capitalize">
              {season.status}
            </Badge>
            {season.playoffs_active && <Badge variant="outline">Playoffs Active</Badge>}
          </div>
        </div>
        <Button variant="edit" nativeButton={false} render={<Link href={`/admin/seasons/${season.id}/edit`} />}>
          <Pencil className="size-4" />
          Edit
        </Button>
      </div>

      <AdminCard className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Year</p>
          <p>{season.year}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Start date</p>
          <p>{season.start_date ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">End date</p>
          <p>{season.end_date ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Points — win</p>
          <p>{season.points_win}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Points — tie</p>
          <p>{season.points_tie}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Points — loss</p>
          <p>{season.points_loss}</p>
        </div>
      </AdminCard>

      <div>
        <h2 className="mb-2 text-xl">Divisions</h2>
        {divisions && divisions.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {divisions.map((d) => (
              <li key={d.id}>{d.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No divisions yet.</p>
        )}
      </div>
    </div>
  );
}
