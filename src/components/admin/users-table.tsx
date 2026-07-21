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

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AppUserRow[];
  currentUserId: string | null;
}) {
  const active = users.filter((u) => !u.isPending);
  const pending = users.filter((u) => u.isPending);
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        {active.map((u) => (
          <UserRow
            key={u.id}
            user={u}
            isSelf={u.id === currentUserId}
            isLastAdmin={u.role === "admin" && adminCount <= 1}
          />
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
              <UserRow key={u.id} user={u} isSelf={false} isLastAdmin={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserRow({
  user,
  isSelf,
  isLastAdmin,
}: {
  user: AppUserRow;
  isSelf: boolean;
  isLastAdmin: boolean;
}) {
  const [role, setRole] = useState<string>(user.role ?? "scorekeeper");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hasAccess = !!user.role;
  const locked = isLastAdmin;

  function handleDeactivateToggle(checked: boolean) {
    setError(null);
    startTransition(async () => {
      if (checked) {
        const result = await deactivateUser(user.id);
        if (result.error) setError(result.error);
      } else {
        const formData = new FormData();
        formData.set("userId", user.id);
        formData.set("role", role);
        const result = await assignRole({}, formData);
        if (result.error) setError(result.error);
      }
    });
  }

  function handleRoleChange(newRole: string | null) {
    if (!newRole) return;
    setError(null);
    const previousRole = role;
    setRole(newRole);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("userId", user.id);
      formData.set("role", newRole);
      const result = await assignRole({}, formData);
      if (result.error) {
        setError(result.error);
        setRole(previousRole);
      }
    });
  }

  return (
    <AdminCard>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-heading text-lg">{user.email ?? "—"}</span>
          <RoleBadge role={user.role} isPending={user.isPending} />
          {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
        </div>

        <div className="flex items-center gap-4">
          {!user.isPending && (
            <Select
              value={role}
              onValueChange={handleRoleChange}
              disabled={pending || locked}
              items={{ scorekeeper: "Scorekeeper", admin: "Admin" }}
            >
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
            disabled={pending || locked}
          />
        </div>
      </div>
      {locked && (
        <p className="mt-2 text-xs text-muted-foreground">
          Last remaining admin — invite or promote another admin before changing this.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </AdminCard>
  );
}
