-- rosters: player<->team membership for a season, with tenure so trades are preserved.
-- A player may hold multiple roster rows in one season across different teams — that is
-- exactly how a mid-season trade is represented (Team A row: status 'traded' + left_at;
-- new Team B row: joined_at).
create table public.rosters (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete restrict,
  jersey_number int,
  position public.player_position,
  role public.roster_role not null default 'player',
  is_spare boolean not null default false,
  status public.roster_status not null default 'active',
  joined_at date,
  left_at date,
  added_at timestamptz not null default now(),
  unique (team_id, player_id)
);

create index rosters_player_idx on public.rosters (player_id);
create index rosters_team_idx on public.rosters (team_id);
