"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleField } from "@/components/admin/toggle-field";
import {
  deleteAnnouncement,
  setAnnouncementPinned,
  setAnnouncementPublished,
} from "@/actions/announcements";
import type { Database } from "@/lib/supabase/types";

type Announcement = Database["public"]["Tables"]["announcements"]["Row"];

export function AnnouncementRow({ announcement }: { announcement: Announcement }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handlePublishedToggle(checked: boolean) {
    startTransition(async () => {
      const result = await setAnnouncementPublished(announcement.id, checked);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  function handlePinnedToggle(checked: boolean) {
    startTransition(async () => {
      const result = await setAnnouncementPinned(announcement.id, checked);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm(`Delete announcement "${announcement.title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteAnnouncement(announcement.id);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <AdminCard className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg">{announcement.title}</span>
          <Badge variant={announcement.is_published ? "default" : "outline"}>
            {announcement.is_published ? "Published" : "Draft"}
          </Badge>
          {announcement.is_pinned && <Badge variant="outline">Pinned</Badge>}
        </div>
        <div className="flex items-center gap-3">
          <ToggleField
            id={`published-${announcement.id}`}
            label="Published?"
            checked={announcement.is_published}
            onCheckedChange={handlePublishedToggle}
            disabled={pending}
          />
          <ToggleField
            id={`pinned-${announcement.id}`}
            label="Pinned?"
            checked={announcement.is_pinned}
            onCheckedChange={handlePinnedToggle}
            disabled={pending}
          />
          <Button
            variant="edit"
            size="icon"
            title="Edit"
            nativeButton={false}
            render={<Link href={`/admin/announcements/${announcement.id}/edit`} />}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="delete"
            size="icon"
            title="Delete"
            disabled={pending}
            onClick={handleDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <p className="line-clamp-2 text-sm text-muted-foreground">{announcement.body}</p>
    </AdminCard>
  );
}
