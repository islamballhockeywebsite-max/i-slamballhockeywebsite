-- audit_log: record of privileged actions (finalize, trades, merges, role changes) for
-- accountability. Written only via server (service role) code paths — see RLS migration.
-- No PII in details.
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null, -- e.g. 'game.finalize', 'player.merge', 'roster.trade'
  entity text not null, -- table/entity name
  entity_id uuid, -- affected row
  details jsonb, -- context / before-after (no PII)
  created_at timestamptz not null default now()
);

create index audit_log_entity_idx on public.audit_log (entity, entity_id);
create index audit_log_actor_idx on public.audit_log (actor_id, created_at desc);
