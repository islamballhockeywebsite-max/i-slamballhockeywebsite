import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { AnnouncementRow } from "@/components/admin/announcements/announcement-row";

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl">Manage Announcements</h1>
        <Button variant="create" nativeButton={false} render={<Link href="/admin/announcements/new" />}>
          <Plus className="size-4" />
          Create Announcement
        </Button>
      </div>

      <div className="space-y-3">
        {announcements?.map((a) => (
          <AnnouncementRow key={a.id} announcement={a} />
        ))}
        {announcements?.length === 0 && (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}
