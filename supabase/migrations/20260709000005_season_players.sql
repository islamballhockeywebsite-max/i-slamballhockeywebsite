-- season_players: per-season enrollment (the draft pool). Also holds the per-season
-- waiver record (waivers are signed annually, not once on the permanent player record).
create table public.season_players (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  division_id uuid references public.divisions(id) on delete set null,
  status public.enrollment_status not null default 'active',
  waiver_signed boolean not null default false,
  waiver_signed_at timestamptz,
  source public.record_source not null default 'manual',
  added_by uuid references auth.users(id) on delete set null,
  added_at timestamptz not null default now(),
  unique (player_id, season_id)
);
