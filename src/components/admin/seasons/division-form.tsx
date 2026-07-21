"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/actions/seasons";
import type { Database } from "@/lib/supabase/types";

type Division = Database["public"]["Tables"]["divisions"]["Row"];

export function DivisionForm({
  action,
  seasonId,
  division,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  seasonId?: string;
  division?: Division;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const fieldError = (name: string) => state.fieldErrors?.[name];

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {division && <input type="hidden" name="id" value={division.id} />}
      {seasonId && <input type="hidden" name="season_id" value={seasonId} />}

      <div className="space-y-2">
        <Label htmlFor="name">Name*</Label>
        <Input id="name" name="name" defaultValue={division?.name} required />
        {fieldError("name") && <p className="text-sm text-destructive">{fieldError("name")}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" defaultValue={division?.description ?? undefined} />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" variant="create" disabled={pending}>
        {pending ? "Saving…" : division ? "Save Changes" : "Add Division"}
      </Button>
    </form>
  );
}
