import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminCard } from "@/components/admin/admin-card";

export default async function PlayerDetailPage({
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {player.photo_url && (
            <Image
              src={player.photo_url}
              alt=""
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl">
              {player.first_name} {player.last_name}
            </h1>
            <div className="mt-1 flex gap-2">
              <Badge variant="outline" className="capitalize">
                {player.status}
              </Badge>
              {player.default_position && (
                <Badge variant="outline" className="capitalize">
                  {player.default_position}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="edit"
          nativeButton={false}
          render={<Link href={`/admin/players/${player.id}/edit`} />}
        >
          <Pencil className="size-4" />
          Edit
        </Button>
      </div>

      <AdminCard className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Date of birth</p>
          <p>{player.date_of_birth ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Email</p>
          <p>{player.email ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Phone</p>
          <p>{player.phone ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Source</p>
          <p className="capitalize">{player.source}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Emergency contact</p>
          <p>{player.emergency_contact_name ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Emergency phone</p>
          <p>{player.emergency_contact_phone ?? "—"}</p>
        </div>
      </AdminCard>

      <div>
        <h2 className="mb-2 text-xl">Season &amp; Team History</h2>
        <p className="text-sm text-muted-foreground">
          No seasons or teams yet — this fills in once rosters exist.
        </p>
      </div>
    </div>
  );
}
