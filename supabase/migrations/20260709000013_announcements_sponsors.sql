-- announcements: league news posts authored by admins.
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_published boolean not null default false,
  is_pinned boolean not null default false,
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index announcements_pub_idx on public.announcements (is_published, published_at desc);

-- sponsors: logos shown subtly site-wide; only is_active sponsors are public, ordered by
-- display_order.
create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  link_url text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index sponsors_active_idx on public.sponsors (is_active, display_order);
