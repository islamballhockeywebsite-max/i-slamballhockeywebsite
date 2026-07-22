create or replace function public.debug_realtime_tables() returns setof text
language sql security definer set search_path = public as $$
  select tablename from pg_publication_tables where pubname = 'supabase_realtime';
$$;
