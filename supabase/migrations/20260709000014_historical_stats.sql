-- historical_player_season_stats / historical_goalie_season_stats: pre-aggregated
-- season-total lines for the league's legacy years (no game-by-game events exist for
-- these), keyed by player + year, with team/season as TEXT labels so they integrate on
-- player profiles and career totals without creating empty live season/team objects. The
-- stats views (see views migration) UNION these with the live derived stats.
create table public.historical_player_season_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete restrict,
  year int not null,
  season_label text,
  team_name text,
  division_name text,
  games_played int,
  goals int,
  assists int,
  points int, -- if null, views fall back to goals + assists
  pim int,
  ppg int,
  shg int,
  gwg int,
  gtg int,
  source public.record_source not null default 'import',
  notes text,
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique (player_id, year, team_name)
);

create index hist_pss_player_idx on public.historical_player_season_stats (player_id, year);

create table public.historical_goalie_season_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete restrict,
  year int not null,
  season_label text,
  team_name text,
  games_played int,
  wins int,
  losses int,
  ties int,
  goals_against int,
  shots_against int,
  saves int,
  shutouts int,
  gaa numeric(5, 2), -- stored only if raw inputs (GA/GP) are unavailable
  save_pct numeric(4, 3), -- stored only if raw inputs (saves/shots_against) are unavailable
  source public.record_source not null default 'import',
  notes text,
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique (player_id, year, team_name)
);

create index hist_gss_player_idx on public.historical_goalie_season_stats (player_id, year);
