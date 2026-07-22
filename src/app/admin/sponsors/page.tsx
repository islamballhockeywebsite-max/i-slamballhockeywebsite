import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SponsorRow } from "@/components/admin/sponsors/sponsor-row";

export default async function SponsorsPage() {
  const supabase = await createClient();
  const { data: sponsors } = await supabase
    .from("sponsors")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl">Manage Sponsors</h1>
        <Button variant="create" nativeButton={false} render={<Link href="/admin/sponsors/new" />}>
          <Plus className="size-4" />
          Create Sponsor
        </Button>
      </div>

      <div className="space-y-3">
        {sponsors?.map((s) => (
          <SponsorRow key={s.id} sponsor={s} />
        ))}
        {sponsors?.length === 0 && <p className="text-sm text-muted-foreground">No sponsors yet.</p>}
      </div>
    </div>
  );
}
