"use client";

import { useActionState } from "react";
import { inviteUser, type InviteUserState } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: InviteUserState = {};

export function InviteUserForm() {
  const [state, formAction, pending] = useActionState(inviteUser, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="invite-email">Email</Label>
        <Input id="invite-email" name="email" type="email" required className="w-64" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-role">Role</Label>
        <Select
          name="role"
          defaultValue="scorekeeper"
          items={{ scorekeeper: "Scorekeeper", admin: "Admin" }}
        >
          <SelectTrigger id="invite-role" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scorekeeper">Scorekeeper</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" variant="create" disabled={pending}>
        {pending ? "Inviting…" : "Create User"}
      </Button>
      {state.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="w-full text-sm text-muted-foreground">Invite sent.</p>}
    </form>
  );
}
