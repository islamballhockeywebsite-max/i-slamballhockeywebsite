-- game_lineups: attendance — who dressed per team per game. Source of truth for skater
-- Games Played. The scorekeeper's lineup screen shows the full roster pre-checked;
-- unchecking a player sets is_present = false.
create table public.game_lineups (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  player_id uuid not null references public.players(id) on delete restrict,
  is_present boolean not null default true,
  created_at timestamptz not null default now(),
  unique (game_id, player_id)
);

create index lineups_player_idx on public.game_lineups (player_id);

-- goalie_appearances: which goalie(s) played in net for a team in a game; drives goalie
-- GP, W/L, and shutouts. Any rostered player can be entered here as the in-net goalie, so
-- a forward filling in net gets correct goalie stats regardless of roster position.
create table public.goalie_appearances (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  player_id uuid not null references public.players(id) on delete restrict,
  is_starter boolean not null default true,
  shots_against int not null default 0,
  decision public.goalie_decision,
  created_at timestamptz not null default now(),
  unique (game_id, player_id)
);

create index goalie_app_player_idx on public.goalie_appearances (player_id);
