-- live-console.tsx also subscribes to postgres_changes on goalie_appearances (shots
-- against / goalie changes syncing to a second spectating device). Without this, that
-- second subscription on the shared channel fails server-side with a "system" error,
-- which silently kills postgres_changes delivery for game_events too on the same topic.
alter publication supabase_realtime add table public.goalie_appearances;

-- Drop the one-off debug helper used to diagnose the above (queried pg_publication_tables
-- directly since no local Docker/psql access was available to introspect the hosted DB).
drop function if exists public.debug_realtime_tables();
