"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { Button } from "@/components/ui/button";
import { deleteDivision } from "@/actions/seasons";
import type { Database } from "@/lib/supabase/types";

type Division = Database["public"]["Tables"]["divisions"]["Row"];

export function DivisionRow({ division }: { division: Division }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Delete division "${division.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteDivision(division.id);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <AdminCard className="flex items-center justify-between gap-4 py-3">
      <div>
        <span className="font-heading text-base">{division.name}</span>
        {division.description && (
          <p className="text-sm text-muted-foreground">{division.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="edit"
          size="icon"
          title="Edit"
          nativeButton={false}
          render={<Link href={`/admin/seasons/divisions/${division.id}/edit`} />}
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
    </AdminCard>
  );
}
