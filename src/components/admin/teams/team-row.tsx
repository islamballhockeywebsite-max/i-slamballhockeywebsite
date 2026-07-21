"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { Button } from "@/components/ui/button";
import { deleteTeam } from "@/actions/teams";
import type { Database } from "@/lib/supabase/types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

export function TeamRow({ team }: { team: Team }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteTeam(team.id);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <AdminCard className="flex items-center justify-between gap-4">
      <span className="font-heading text-lg">{team.name}</span>
      <div className="flex items-center gap-1.5">
        <Button
          variant="view"
          size="icon"
          title="View"
          nativeButton={false}
          render={<Link href={`/admin/teams/${team.id}`} />}
        >
          <Eye className="size-4" />
        </Button>
        <Button
          variant="edit"
          size="icon"
          title="Edit"
          nativeButton={false}
          render={<Link href={`/admin/teams/${team.id}/edit`} />}
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
