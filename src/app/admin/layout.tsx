import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { signOut } from "@/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/seasons", label: "Seasons & Divisions" },
  { href: "/admin/teams", label: "Teams & Draft" },
  { href: "/admin/rosters", label: "Rosters" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/playoffs", label: "Playoffs" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/historical-stats", label: "Historical Stats" },
  { href: "/admin/users", label: "Users & Roles" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r bg-muted/30 p-4">
        <div className="mb-6">
          <p className="font-semibold">I-Slam Admin</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-2 py-1.5 text-sm hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOut}>
          <button type="submit" className="text-sm text-muted-foreground hover:underline">
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
