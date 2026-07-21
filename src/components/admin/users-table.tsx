"use client";

import { useState, useTransition } from "react";
import { assignRole, deactivateUser, type AppUserRow } from "@/actions/users";
import { AdminCard } from "@/components/admin/admin-card";
import { RoleBadge } from "@/components/admin/role-badge";
import { ToggleField } from "@/components/admin/toggle-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UsersTable({ users }: { users: AppUserRow[] }) {
  const active = users.filter((u) => !u.isPending);
  const pending = users.filter((u) => u.isPending);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        {active.map((u) => (
          <UserRow key={u.id} user={u} />
        ))}
        {active.length === 0 && (
          <p className="text-sm text-muted-foreground">No users yet.</p>
        )}
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="mb-3 text-xl">Invitations</h2>
          <div className="space-y-3">
            {pending.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserRow({ user }: { user: AppUserRow }) {
  const [role, setRole] = useState<string>(user.role ?? "scorekeeper");
  const [pending, startTransition] = useTransition();

  const hasAccess = !!user.role;

  function handleDeactivateToggle(checked: boolean) {
    startTransition(async () => {
      if (checked) {
        await deactivateUser(user.id);
      } else {
        const formData = new FormData();
        formData.set("userId", user.id);
        formData.set("role", role);
        await assignRole({}, formData);
      }
    });
  }

  function handleRoleChange(newRole: string | null) {
    if (!newRole) return;
    setRole(newRole);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("userId", user.id);
      formData.set("role", newRole);
      await assignRole({}, formData);
    });
  }

  return (
    <AdminCard className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="font-heading text-lg">{user.email ?? "—"}</span>
        <RoleBadge role={user.role} isPending={user.isPending} />
      </div>

      <div className="flex items-center gap-4">
        {!user.isPending && (
          <Select value={role} onValueChange={handleRoleChange} disabled={pending}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scorekeeper">Scorekeeper</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        )}
        <ToggleField
          id={`deactivate-${user.id}`}
          label="Deactivate"
          checked={!hasAccess}
          onCheckedChange={handleDeactivateToggle}
          disabled={pending}
        />
      </div>
    </AdminCard>
  );
}
