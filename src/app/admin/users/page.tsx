import { listUsers } from "@/actions/users";
import { getUser } from "@/lib/auth/session";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { UsersTable } from "@/components/admin/users-table";

export default async function UsersPage() {
  const [users, currentUser] = await Promise.all([listUsers(), getUser()]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl">Manage Users</h1>
      </div>
      <InviteUserForm />
      <UsersTable users={users} currentUserId={currentUser?.id ?? null} />
    </div>
  );
}
