-- playoff_series: a best-of-N matchup; winners advance. Created before games so that
-- games.series_id (added in the games migration) can reference it.
create table public.playoff_series (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  division_id uuid not null references public.divisions(id) on delete cascade,
  round int not null,
  label text,
  high_seed_team_id uuid references public.teams(id) on delete set null,
  low_seed_team_id uuid references public.teams(id) on delete set null,
  best_of int not null default 3 check (best_of % 2 = 1),
  high_seed_wins int not null default 0,
  low_seed_wins int not null default 0,
  status public.series_status not null default 'scheduled',
  winner_team_id uuid references public.teams(id) on delete set null,
  advances_to_series_id uuid references public.playoff_series(id) on delete set null,
  created_at timestamptz not null default now()
);

create index playoff_series_scope_idx on public.playoff_series (season_id, division_id);

-- playoff_seeds: admin-set seeding per season/division (the bracket's starting order).
create table public.playoff_seeds (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  division_id uuid not null references public.divisions(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  seed int not null,
  created_at timestamptz not null default now(),
  unique (season_id, division_id, team_id),
  unique (season_id, division_id, seed)
);
