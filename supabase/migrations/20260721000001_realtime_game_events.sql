-- Enables Supabase Realtime postgres_changes on game_events so a second device/admin
-- spectating a live game stays in sync with the scorekeeper's entries (M4).
alter publication supabase_realtime add table public.game_events;
