import { Badge } from "@/components/ui/badge";
import type { AppRole } from "@/lib/auth/session";

export function RoleBadge({ role, isPending }: { role: AppRole | null; isPending: boolean }) {
  if (isPending) {
    return (
      <Badge variant="outline" className="border-amber-500 text-amber-600">
        Pending
      </Badge>
    );
  }
  if (role === "admin") {
    return (
      <Badge variant="outline" className="border-red-600 text-red-600">
        Admin
      </Badge>
    );
  }
  if (role === "scorekeeper") {
    return (
      <Badge variant="outline" className="border-green-600 text-green-600">
        Scorekeeper
      </Badge>
    );
  }
  return <Badge variant="outline">Role</Badge>;
}
