-- =====================================================================================
-- Row Level Security — the entire public-facing security model lives in this one file.
--
-- Design notes:
-- * Public read (anon, authenticated) covers: seasons, divisions, teams, rosters, games,
--   game_events, game_lineups, goalie_appearances, standings, playoff_seeds,
--   playoff_series — matching the confirmed spec.
-- * players holds PII and has NO public read; the public reads names/photos through the
--   players_public view (added in the views migration). Views in this project are
--   created without `security_invoker`, so they run with the view owner's privileges and
--   can safely join admin-only tables (players, historical_*_stats) internally while
--   only ever projecting non-PII columns out — the same pattern the spec's own
--   players_public view relies on.
-- * historical_player_season_stats / historical_goalie_season_stats are admin-only at the
--   table level; the public gets this data exclusively through the aggregating stats
--   views, keeping the raw import tables off the public surface.
-- * Scorekeepers write game_events / game_lineups / goalie_appearances / games (update
--   only) strictly for games they're assigned to (games.scorekeeper_id = auth.uid()).
-- * audit_log has no write policy at all — it is only ever written by server code using
--   the service-role key, which bypasses RLS entirely.
-- =====================================================================================

alter table public.user_roles enable row level security;
alter table public.players enable row level security;
alter table public.seasons enable row level security;
alter table public.divisions enable row level security;
alter table public.season_players enable row level security;
alter table public.teams enable row level security;
alter table public.rosters enable row level security;
alter table public.games enable row level security;
alter table public.game_events enable row level security;
alter table public.game_lineups enable row level security;
alter table public.goalie_appearances enable row level security;
alter table public.standings enable row level security;
alter table public.playoff_seeds enable row level security;
alter table public.playoff_series enable row level security;
alter table public.announcements enable row level security;
alter table public.sponsors enable row level security;
alter table public.historical_player_season_stats enable row level security;
alter table public.historical_goalie_season_stats enable row level security;
alter table public.audit_log enable row level security;

-- ---------------------------------------------------------------------------- user_roles
create policy user_roles_read on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy user_roles_write on public.user_roles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------------- players
create policy players_read on public.players
  for select to authenticated
  using (public.is_admin());

create policy players_write on public.players
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------------- seasons
create policy seasons_read on public.seasons
  for select to anon, authenticated
  using (true);

create policy seasons_write on public.seasons
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------- divisions
create policy divisions_read on public.divisions
  for select to anon, authenticated
  using (true);

create policy divisions_write on public.divisions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------ season_players
create policy season_players_read on public.season_players
  for select to authenticated
  using (public.is_admin());

create policy season_players_write on public.season_players
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------------- teams
create policy teams_read on public.teams
  for select to anon, authenticated
  using (true);

create policy teams_write on public.teams
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -------------------------------------------------------------------------------- rosters
create policy rosters_read on public.rosters
  for select to anon, authenticated
  using (true);

create policy rosters_write on public.rosters
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------------- games
create policy games_read on public.games
  for select to anon, authenticated
  using (true);

create policy games_insert on public.games
  for insert to authenticated
  with check (public.is_admin());

create policy games_update on public.games
  for update to authenticated
  using (public.is_admin() or (public.is_scorekeeper() and scorekeeper_id = auth.uid()))
  with check (public.is_admin() or (public.is_scorekeeper() and scorekeeper_id = auth.uid()));

create policy games_delete on public.games
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------- game_events
create policy game_events_read on public.game_events
  for select to anon, authenticated
  using (true);

create policy game_events_write on public.game_events
  for all to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.games g
      where g.id = game_events.game_id and g.scorekeeper_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.games g
      where g.id = game_events.game_id and g.scorekeeper_id = auth.uid()
    )
  );

-- --------------------------------------------------------------------------- game_lineups
create policy game_lineups_read on public.game_lineups
  for select to anon, authenticated
  using (true);

create policy game_lineups_write on public.game_lineups
  for all to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.games g
      where g.id = game_lineups.game_id and g.scorekeeper_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.games g
      where g.id = game_lineups.game_id and g.scorekeeper_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------- goalie_appearances
create policy goalie_appearances_read on public.goalie_appearances
  for select to anon, authenticated
  using (true);

create policy goalie_appearances_write on public.goalie_appearances
  for all to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.games g
      where g.id = goalie_appearances.game_id and g.scorekeeper_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.games g
      where g.id = goalie_appearances.game_id and g.scorekeeper_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------ standings
-- Written exclusively by recompute_game() (security definer, bypasses RLS). This policy
-- is a safety net for any future manual admin correction, not a path the app should use.
create policy standings_read on public.standings
  for select to anon, authenticated
  using (true);

create policy standings_write on public.standings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -------------------------------------------------------------------------- playoff_seeds
create policy playoff_seeds_read on public.playoff_seeds
  for select to anon, authenticated
  using (true);

create policy playoff_seeds_write on public.playoff_seeds
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------- playoff_series
create policy playoff_series_read on public.playoff_series
  for select to anon, authenticated
  using (true);

create policy playoff_series_write on public.playoff_series
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -------------------------------------------------------------------------- announcements
create policy announcements_read on public.announcements
  for select to anon, authenticated
  using (is_published or public.is_admin());

create policy announcements_write on public.announcements
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------------ sponsors
create policy sponsors_read on public.sponsors
  for select to anon, authenticated
  using (is_active or public.is_admin());

create policy sponsors_write on public.sponsors
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------- historical_*_season_stats
create policy hist_player_stats_read on public.historical_player_season_stats
  for select to authenticated
  using (public.is_admin());

create policy hist_player_stats_write on public.historical_player_season_stats
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy hist_goalie_stats_read on public.historical_goalie_season_stats
  for select to authenticated
  using (public.is_admin());

create policy hist_goalie_stats_write on public.historical_goalie_season_stats
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------- audit_log
-- Admin read only. No write policy: writes happen only via server code using the
-- service-role key, which bypasses RLS entirely — this table is intentionally
-- unwritable through any RLS-scoped client, including admins.
create policy audit_log_read on public.audit_log
  for select to authenticated
  using (public.is_admin());
