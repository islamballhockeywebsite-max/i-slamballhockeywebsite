"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { Button } from "@/components/ui/button";
import { ToggleField } from "@/components/admin/toggle-field";
import { deleteSponsor, setSponsorActive } from "@/actions/sponsors";
import type { Database } from "@/lib/supabase/types";

type Sponsor = Database["public"]["Tables"]["sponsors"]["Row"];

export function SponsorRow({ sponsor }: { sponsor: Sponsor }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleActiveToggle(checked: boolean) {
    startTransition(async () => {
      const result = await setSponsorActive(sponsor.id, checked);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm(`Delete sponsor "${sponsor.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteSponsor(sponsor.id);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <AdminCard className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {sponsor.logo_url && (
          <Image
            src={sponsor.logo_url}
            alt=""
            width={80}
            height={40}
            className="h-10 w-auto object-contain"
          />
        )}
        <div>
          <span className="font-heading">{sponsor.name}</span>
          <p className="text-xs text-muted-foreground">Order {sponsor.display_order}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ToggleField
          id={`active-${sponsor.id}`}
          label="Active?"
          checked={sponsor.is_active}
          onCheckedChange={handleActiveToggle}
          disabled={pending}
        />
        <Button
          variant="edit"
          size="icon"
          title="Edit"
          nativeButton={false}
          render={<Link href={`/admin/sponsors/${sponsor.id}/edit`} />}
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
