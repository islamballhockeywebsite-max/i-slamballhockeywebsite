-- seasons: one row per league season. points_win/tie/loss make standings rules
-- configurable per season; playoffs_active gates the public bracket.
create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year int not null,
  start_date date,
  end_date date,
  status public.season_status not null default 'upcoming',
  playoffs_active boolean not null default false,
  points_win int not null default 2,
  points_tie int not null default 1,
  points_loss int not null default 0,
  created_at timestamptz not null default now()
);

-- divisions: tiers/groups within a season.
create table public.divisions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (season_id, name)
);
