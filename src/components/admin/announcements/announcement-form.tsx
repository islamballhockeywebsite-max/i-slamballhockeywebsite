"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ToggleField } from "@/components/admin/toggle-field";
import type { FormState } from "@/actions/announcements";
import type { Database } from "@/lib/supabase/types";

type Announcement = Database["public"]["Tables"]["announcements"]["Row"];

export function AnnouncementForm({
  action,
  announcement,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  announcement?: Announcement;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [isPinned, setIsPinned] = useState(announcement?.is_pinned ?? false);
  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {announcement && <input type="hidden" name="id" value={announcement.id} />}

      <div className="space-y-2">
        <Label htmlFor="title">Title*</Label>
        <Input id="title" name="title" defaultValue={announcement?.title} />
        {fieldError("title") && <p className="text-sm text-destructive">{fieldError("title")}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Body*</Label>
        <Textarea id="body" name="body" rows={8} defaultValue={announcement?.body} />
        {fieldError("body") && <p className="text-sm text-destructive">{fieldError("body")}</p>}
      </div>

      <input type="hidden" name="is_pinned" value={isPinned ? "true" : "false"} />
      <ToggleField id="is_pinned_toggle" label="Pinned?" checked={isPinned} onCheckedChange={setIsPinned} />

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" variant="create" disabled={pending}>
        {pending ? "Saving…" : announcement ? "Save Changes" : "Create Announcement"}
      </Button>
    </form>
  );
}
