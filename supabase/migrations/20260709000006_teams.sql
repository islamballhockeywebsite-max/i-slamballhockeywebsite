-- teams: a team instance within a season (re-formed each season; no cross-season brand).
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  division_id uuid not null references public.divisions(id) on delete restrict,
  name text not null,
  logo_url text,
  primary_color text,
  captain_player_id uuid references public.players(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (season_id, name)
);
