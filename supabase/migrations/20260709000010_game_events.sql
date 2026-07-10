-- game_events: the event-sourced core. One row per goal or penalty (plus period/goalie
-- markers). Shots are NOT stored here (see goalie_appearances.shots_against) to keep this
-- table compact over 25 years.
--
-- team_id is the team the event is FOR: for a normal goal, the scoring team; for an own
-- goal, the BENEFITING team (the scorer credited via player_id is a player on the
-- opposing/nearest-opponent team — is_own_goal just flags it for display).
create table public.game_events (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete restrict,
  event_type public.event_type not null,
  player_id uuid references public.players(id) on delete restrict,
  assist1_player_id uuid references public.players(id) on delete set null,
  assist2_player_id uuid references public.players(id) on delete set null,
  goalie_id uuid references public.players(id) on delete set null,
  strength public.goal_strength,
  is_empty_net boolean,
  is_own_goal boolean,
  penalty_type text,
  penalty_minutes int,
  period int,
  game_time text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index ge_game_idx on public.game_events (game_id);
create index ge_player_idx on public.game_events (player_id);
create index ge_goalie_idx on public.game_events (goalie_id);
create index ge_game_type_idx on public.game_events (game_id, event_type);
