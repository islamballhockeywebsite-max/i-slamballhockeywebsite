import { listUsers } from "@/actions/users";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { UsersTable } from "@/components/admin/users-table";

export default async function UsersPage() {
  const users = await listUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users &amp; Roles</h1>
        <p className="mt-1 text-muted-foreground">
          Invite admins and scorekeepers, assign roles, and revoke access.
        </p>
      </div>
      <InviteUserForm />
      <UsersTable users={users} />
    </div>
  );
}
