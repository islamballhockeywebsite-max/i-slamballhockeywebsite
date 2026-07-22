-- Durable staging pipeline for CSV import (players + historical stats), per the plan's
-- "CSV import" architecture decision: upload/mapping/dedupe review are resumable steps over
-- these tables rather than in-memory wizard state, and commit is a single service-role
-- transaction. One generic pipeline serves both entity types — only the row schema, dedupe
-- key, and commit target differ per `type`.
create type public.import_type as enum ('players', 'historical_skaters', 'historical_goalies');
create type public.import_batch_status as enum ('uploaded', 'mapped', 'reviewed', 'committed', 'failed');
create type public.import_row_status as enum ('pending', 'valid', 'invalid', 'skipped', 'committed');

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  type public.import_type not null,
  status public.import_batch_status not null default 'uploaded',
  filename text not null,
  total_rows int not null default 0,
  column_mapping jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  committed_at timestamptz
);

-- raw: the CSV row as-parsed, keyed by original column header — never mutated, so the
-- mapping step can always be re-run from scratch.
-- mapped: raw re-keyed to target field names per column_mapping, with values coerced;
-- populated once mapping is confirmed.
-- dedupe_match_player_id: for a players import, an existing player this row looks like a
-- duplicate of; for a historical-stats import, the resolved player this row's name matched
-- to (required before commit).
create table public.import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.import_batches(id) on delete cascade,
  row_number int not null,
  raw jsonb not null,
  mapped jsonb,
  validation_errors jsonb,
  dedupe_match_player_id uuid references public.players(id) on delete set null,
  status public.import_row_status not null default 'pending',
  skip boolean not null default false,
  created_at timestamptz not null default now()
);

create index import_rows_batch_idx on public.import_rows (batch_id, row_number);

alter table public.import_batches enable row level security;
alter table public.import_rows enable row level security;

create policy import_batches_all on public.import_batches
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy import_rows_all on public.import_rows
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
