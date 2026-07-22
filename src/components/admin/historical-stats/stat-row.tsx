"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function StatRow({
  title,
  subtitle,
  line,
  editHref,
  onDelete,
}: {
  title: string;
  subtitle: string;
  line: string;
  editHref: string;
  onDelete: () => Promise<{ error?: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Delete this stat line for ${title}? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await onDelete();
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <AdminCard className="flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-heading">{title}</span>
          <Badge variant="outline">{subtitle}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{line}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="edit" size="icon" title="Edit" nativeButton={false} render={<Link href={editHref} />}>
          <Pencil className="size-4" />
        </Button>
        <Button type="button" variant="delete" size="icon" title="Delete" disabled={pending} onClick={handleDelete}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </AdminCard>
  );
}
