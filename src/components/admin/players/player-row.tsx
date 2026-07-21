"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Ban, Eye, Pencil, Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setPlayerStatus, deletePlayer } from "@/actions/players";
import type { Database } from "@/lib/supabase/types";

type Player = Database["public"]["Tables"]["players"]["Row"];

export function PlayerRow({ player }: { player: Player }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const contactLine = [player.date_of_birth, player.email, player.phone]
    .filter(Boolean)
    .join(" - ");

  function handleStatusChange(status: "active" | "inactive") {
    startTransition(async () => {
      await setPlayerStatus(player.id, status);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm(`Delete ${player.first_name} ${player.last_name}? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deletePlayer(player.id);
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
          <span className="font-heading text-lg">
            {player.first_name} {player.last_name}
          </span>
          <Badge variant="outline" className="capitalize">
            {player.status}
          </Badge>
          {player.default_position && (
            <Badge variant="outline" className="capitalize">
              {player.default_position}
            </Badge>
          )}
        </div>
        {contactLine && <p className="text-sm text-muted-foreground">{contactLine}</p>}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="create"
          size="icon"
          title="Activate"
          disabled={pending || player.status === "active"}
          onClick={() => handleStatusChange("active")}
        >
          <Check className="size-4" />
        </Button>
        <Button
          type="button"
          variant="delete"
          size="icon"
          title="Deactivate"
          disabled={pending || player.status === "inactive"}
          onClick={() => handleStatusChange("inactive")}
        >
          <Ban className="size-4" />
        </Button>
        <Button
          variant="view"
          size="icon"
          title="View"
          nativeButton={false}
          render={<Link href={`/admin/players/${player.id}`} />}
        >
          <Eye className="size-4" />
        </Button>
        <Button
          variant="edit"
          size="icon"
          title="Edit"
          nativeButton={false}
          render={<Link href={`/admin/players/${player.id}/edit`} />}
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
