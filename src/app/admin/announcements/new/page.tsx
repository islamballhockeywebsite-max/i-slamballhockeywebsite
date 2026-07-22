import { createAnnouncement } from "@/actions/announcements";
import { AnnouncementForm } from "@/components/admin/announcements/announcement-form";

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Create Announcement</h1>
      <AnnouncementForm action={createAnnouncement} />
    </div>
  );
}
