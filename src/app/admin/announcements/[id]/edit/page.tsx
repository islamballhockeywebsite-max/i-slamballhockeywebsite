import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateAnnouncement } from "@/actions/announcements";
import { AnnouncementForm } from "@/components/admin/announcements/announcement-form";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: announcement } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!announcement) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Edit Announcement</h1>
      <AnnouncementForm action={updateAnnouncement} announcement={announcement} />
    </div>
  );
}
