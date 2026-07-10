-- user_roles: maps a Supabase auth user to one app role. Admins implicitly have
-- scorekeeper abilities (enforced in is_scorekeeper(), see functions migration).
create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now()
);
