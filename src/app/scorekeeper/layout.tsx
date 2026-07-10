import { requireScorekeeper } from "@/lib/auth/session";
import { signOut } from "@/actions/auth";

export default async function ScorekeeperLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireScorekeeper();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b p-4">
        <div>
          <p className="font-semibold">I-Slam Scorekeeper</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm text-muted-foreground hover:underline">
            Sign out
          </button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
