-- players: permanent identity for a person across all seasons. Holds PII (admin-only via
-- RLS; public reads go through the players_public view added in the views migration).
create table public.players (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  email text,
  phone text,
  photo_url text,
  default_position public.player_position,
  emergency_contact_name text,
  emergency_contact_phone text,
  status public.player_status not null default 'active',
  source public.record_source not null default 'manual',
  external_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index players_name_idx on public.players (last_name, first_name);
create index players_email_idx on public.players (lower(email));
create index players_dedupe_idx on public.players (
  lower(first_name), lower(last_name), date_of_birth, lower(email)
);
