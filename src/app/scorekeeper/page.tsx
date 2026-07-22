import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireScorekeeper } from "@/lib/auth/session";
import { AdminCard } from "@/components/admin/admin-card";
import { Badge } from "@/components/ui/badge";

export default async function ScorekeeperConsolePage() {
  const { user } = await requireScorekeeper();
  const supabase = await createClient();

  const { data: games } = await supabase
    .from("games")
    .select("*")
    .eq("scorekeeper_id", user.id)
    .order("scheduled_at", { ascending: true });

  const teamIds = Array.from(
    new Set((games ?? []).flatMap((g) => [g.home_team_id, g.away_team_id])),
  );
  const { data: teams } =
    teamIds.length > 0
      ? await supabase.from("teams").select("id, name").in("id", teamIds)
      : { data: [] };
  const teamName = (id: string) => teams?.find((t) => t.id === id)?.name ?? "Unknown";

  const live = (games ?? []).filter((g) => g.status === "in_progress");
  const upcoming = (games ?? []).filter((g) => g.status === "scheduled" || g.status === "postponed");
  const recent = (games ?? []).filter((g) => g.status === "final").slice(-10).reverse();

  const sections = [
    { title: "Live now", items: live },
    { title: "Upcoming", items: upcoming },
    { title: "Recently finalized", items: recent },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl">Your games</h1>

      {(games ?? []).length === 0 && (
        <p className="text-muted-foreground">
          No games assigned to you yet. Once an admin creates a schedule and assigns you to a
          game, it&apos;ll show up here.
        </p>
      )}

      {sections.map(
        (section) =>
          section.items.length > 0 && (
            <div key={section.title} className="space-y-3">
              <h2 className="font-heading text-lg">{section.title}</h2>
              <div className="space-y-3">
                {section.items.map((game) => (
                  <Link key={game.id} href={`/scorekeeper/${game.id}`}>
                    <AdminCard className="flex items-center justify-between gap-4">
                      <div>
                        <span className="font-heading">
                          {teamName(game.home_team_id)} vs {teamName(game.away_team_id)}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {game.scheduled_at
                            ? new Date(game.scheduled_at).toLocaleString()
                            : "Time TBD"}
                          {game.location ? ` — ${game.location}` : ""}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {game.status.replace("_", " ")}
                      </Badge>
                    </AdminCard>
                  </Link>
                ))}
              </div>
            </div>
          ),
      )}
    </div>
  );
}
