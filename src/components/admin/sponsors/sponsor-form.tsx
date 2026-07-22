"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ToggleField } from "@/components/admin/toggle-field";
import type { FormState } from "@/actions/sponsors";
import type { Database } from "@/lib/supabase/types";

type Sponsor = Database["public"]["Tables"]["sponsors"]["Row"];

export function SponsorForm({
  action,
  sponsor,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  sponsor?: Sponsor;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [isActive, setIsActive] = useState(sponsor?.is_active ?? true);
  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {sponsor && <input type="hidden" name="id" value={sponsor.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">Name*</Label>
        <Input id="name" name="name" defaultValue={sponsor?.name} />
        {fieldError("name") && <p className="text-sm text-destructive">{fieldError("name")}</p>}
      </div>

      {sponsor?.logo_url && (
        <Image
          src={sponsor.logo_url}
          alt=""
          width={160}
          height={64}
          className="h-16 w-auto rounded-lg border object-contain p-1"
        />
      )}
      <div className="space-y-2">
        <Label htmlFor="logo">Logo{sponsor ? "" : "*"}</Label>
        <Input
          id="logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
        />
        {fieldError("logo") && <p className="text-sm text-destructive">{fieldError("logo")}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="link_url">Website URL</Label>
        <Input id="link_url" name="link_url" placeholder="https://" defaultValue={sponsor?.link_url ?? ""} />
        {fieldError("link_url") && <p className="text-sm text-destructive">{fieldError("link_url")}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_order">Display order</Label>
        <Input
          id="display_order"
          name="display_order"
          type="number"
          defaultValue={sponsor?.display_order ?? 0}
        />
      </div>

      <input type="hidden" name="is_active" value={isActive ? "true" : "false"} />
      <ToggleField id="is_active_toggle" label="Active?" checked={isActive} onCheckedChange={setIsActive} />

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" variant="create" disabled={pending}>
        {pending ? "Saving…" : sponsor ? "Save Changes" : "Create Sponsor"}
      </Button>
    </form>
  );
}
