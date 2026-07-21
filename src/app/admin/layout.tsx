import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { signOut } from "@/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r-2 border-foreground p-4">
        <div className="mb-8">
          <span className="font-heading text-lg">Admin</span>
        </div>
        <AdminNav />
        <div className="mt-6 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Public Site
          </Link>
          <form action={signOut}>
            <Button type="submit" variant="delete" size="sm" className="w-full gap-1.5">
              <LogOut className="size-3.5" />
              Log Out
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
