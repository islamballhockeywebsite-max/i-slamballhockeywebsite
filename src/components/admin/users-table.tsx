"use client";

import { useActionState, useTransition } from "react";
import { assignRole, deactivateUser, type AppUserRow, type AssignRoleState } from "@/actions/users";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function UsersTable({ users }: { users: AppUserRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Last sign-in</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <UserRow key={u.id} user={u} />
        ))}
        {users.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No users yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

const initialAssignState: AssignRoleState = {};

function UserRow({ user }: { user: AppUserRow }) {
  const [state, formAction, pending] = useActionState(assignRole, initialAssignState);
  const [deactivating, startDeactivate] = useTransition();

  return (
    <TableRow>
      <TableCell>{user.email ?? "—"}</TableCell>
      <TableCell>
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="userId" value={user.id} />
          <Select name="role" defaultValue={user.role ?? undefined}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="No role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scorekeeper">Scorekeeper</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" size="sm" variant="outline" disabled={pending}>
            Save
          </Button>
        </form>
        {state.error && <p className="mt-1 text-xs text-destructive">{state.error}</p>}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : "Never"}
      </TableCell>
      <TableCell>
        {user.role && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={deactivating}
            onClick={() => {
              if (confirm(`Remove admin/scorekeeper access for ${user.email}?`)) {
                startDeactivate(() => deactivateUser(user.id));
              }
            }}
          >
            Deactivate
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
