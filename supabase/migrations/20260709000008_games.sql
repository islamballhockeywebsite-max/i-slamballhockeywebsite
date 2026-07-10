-- games: a scheduled match. Score columns are cached from goal events; the official
-- result (result_type + winner_team_id) is what the scorekeeper submits at finalize
-- and is what standings trust — it is never derived from events.
create table public.games (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  division_id uuid not null references public.divisions(id) on delete restrict,
  home_team_id uuid not null references public.teams(id) on delete restrict,
  away_team_id uuid not null references public.teams(id) on delete restrict,
  scheduled_at timestamptz,
  location text,
  status public.game_status not null default 'scheduled',
  home_score int not null default 0,
  away_score int not null default 0,
  result_type public.result_type,
  winner_team_id uuid references public.teams(id) on delete set null,
  is_forfeit boolean not null default false,
  current_period int,
  game_clock text,
  scorekeeper_id uuid references auth.users(id) on delete set null,
  is_playoff boolean not null default false,
  series_id uuid references public.playoff_series(id) on delete set null,
  created_at timestamptz not null default now(),
  check (home_team_id <> away_team_id)
);

create index games_scope_idx on public.games (season_id, division_id);
create index games_sched_idx on public.games (scheduled_at);
create index games_sk_idx on public.games (scorekeeper_id);
create index games_series_idx on public.games (series_id);
