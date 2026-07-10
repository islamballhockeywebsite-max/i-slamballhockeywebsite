-- standings: maintained regular-season table per team; fully recomputed by
-- recompute_game() (see functions migration) whenever a game finalizes or a
-- post-finalize correction is made. Playoff games do not affect standings.
create table public.standings (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  division_id uuid not null references public.divisions(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  games_played int not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  ties int not null default 0,
  goals_for int not null default 0,
  goals_against int not null default 0,
  goal_differential int generated always as (goals_for - goals_against) stored,
  points int not null default 0,
  updated_at timestamptz not null default now(),
  unique (season_id, division_id, team_id)
);
