"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  Users,
  Calendar,
  ShieldCheck,
  ClipboardList,
  CalendarDays,
  Trophy,
  Megaphone,
  Handshake,
  BarChart3,
  UserCog,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: Settings, exact: true },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/seasons", label: "Seasons & Divisions", icon: Calendar },
  { href: "/admin/teams", label: "Teams", icon: ShieldCheck },
  { href: "/admin/rosters", label: "Rosters", icon: ClipboardList },
  { href: "/admin/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/admin/playoffs", label: "Playoffs", icon: Trophy },
  { href: "/admin/announcements", label: "Announcement", icon: Megaphone },
  { href: "/admin/sponsors", label: "Sponsors", icon: Handshake },
  { href: "/admin/historical-stats", label: "Historical Stats", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: UserCog },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1">
      {NAV.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-lime text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {isActive && <ArrowRight className="size-4 shrink-0" />}
          </Link>
        );
      })}
    </nav>
  );
}
