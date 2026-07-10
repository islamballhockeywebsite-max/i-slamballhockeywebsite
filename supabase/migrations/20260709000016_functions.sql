-- =====================================================================================
-- Role helpers (RLS keys off these; also used by trigger functions marked security
-- definer so recompute always runs regardless of the caller's own row-level permissions).
-- =====================================================================================

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_scorekeeper() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles where user_id = auth.uid() and role in ('admin', 'scorekeeper')
  );
$$;

-- =====================================================================================
-- updated_at maintenance
-- =====================================================================================

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_players_touch before update on public.players
  for each row execute function public.touch_updated_at();
create trigger trg_announcements_touch before update on public.announcements
  for each row execute function public.touch_updated_at();
create trigger trg_sponsors_touch before update on public.sponsors
  for each row execute function public.touch_updated_at();
create trigger trg_hist_player_stats_touch before update on public.historical_player_season_stats
  for each row execute function public.touch_updated_at();
create trigger trg_hist_goalie_stats_touch before update on public.historical_goalie_season_stats
  for each row execute function public.touch_updated_at();

-- =====================================================================================
-- Finalize / recompute — the correctness-critical core.
--
-- Nothing in game_events/standings/stats is ever hand-edited: recompute_game() is the
-- single source of truth for cached scores, standings, and playoff series tallies, and it
-- is invoked exclusively via triggers (below) so it is structurally impossible to skip,
-- including for post-finalize corrections (editing/deleting a game_events row).
--
-- Recursion note: recompute_game() updates games.home_score/away_score directly, which
-- does NOT include the `status` column in its SET list, so it never re-fires the
-- games_finalize_recompute trigger (defined as AFTER UPDATE OF status). This is what
-- keeps the trigger chain from looping.
-- =====================================================================================

create or replace function public.recompute_standings_for_team(
  p_season_id uuid, p_division_id uuid, p_team_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_points_win int;
  v_points_tie int;
  v_points_loss int;
  v_games_played int;
  v_wins int;
  v_losses int;
  v_ties int;
  v_goals_for int;
  v_goals_against int;
begin
  select points_win, points_tie, points_loss
  into v_points_win, v_points_tie, v_points_loss
  from public.seasons where id = p_season_id;

  select
    count(*),
    count(*) filter (where g.winner_team_id = p_team_id),
    count(*) filter (where g.winner_team_id is not null and g.winner_team_id <> p_team_id),
    count(*) filter (where g.winner_team_id is null),
    coalesce(sum(case when g.home_team_id = p_team_id then g.home_score else g.away_score end), 0),
    coalesce(sum(case when g.home_team_id = p_team_id then g.away_score else g.home_score end), 0)
  into v_games_played, v_wins, v_losses, v_ties, v_goals_for, v_goals_against
  from public.games g
  where g.season_id = p_season_id
    and g.division_id = p_division_id
    and g.is_playoff = false
    and g.status = 'final'
    and (g.home_team_id = p_team_id or g.away_team_id = p_team_id);

  insert into public.standings (
    season_id, division_id, team_id, games_played, wins, losses, ties,
    goals_for, goals_against, points, updated_at
  ) values (
    p_season_id, p_division_id, p_team_id, coalesce(v_games_played, 0), coalesce(v_wins, 0),
    coalesce(v_losses, 0), coalesce(v_ties, 0), v_goals_for, v_goals_against,
    (coalesce(v_wins, 0) * v_points_win) + (coalesce(v_ties, 0) * v_points_tie) + (coalesce(v_losses, 0) * v_points_loss),
    now()
  )
  on conflict (season_id, division_id, team_id) do update set
    games_played = excluded.games_played,
    wins = excluded.wins,
    losses = excluded.losses,
    ties = excluded.ties,
    goals_for = excluded.goals_for,
    goals_against = excluded.goals_against,
    points = excluded.points,
    updated_at = now();
end;
$$;

create or replace function public.recompute_playoff_series(p_series_id uuid) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_series record;
  v_high_wins int;
  v_low_wins int;
  v_needed int;
  v_winner uuid;
  v_status public.series_status;
begin
  select * into v_series from public.playoff_series where id = p_series_id for update;
  if not found then
    return;
  end if;

  select
    count(*) filter (where winner_team_id = v_series.high_seed_team_id),
    count(*) filter (where winner_team_id = v_series.low_seed_team_id)
  into v_high_wins, v_low_wins
  from public.games
  where series_id = p_series_id and status = 'final';

  v_needed := (v_series.best_of / 2) + 1; -- best_of is always odd; integer division = ceil(best_of/2) - 1 + 1

  if v_high_wins >= v_needed then
    v_winner := v_series.high_seed_team_id;
    v_status := 'complete';
  elsif v_low_wins >= v_needed then
    v_winner := v_series.low_seed_team_id;
    v_status := 'complete';
  elsif v_high_wins > 0 or v_low_wins > 0 then
    v_winner := null;
    v_status := 'in_progress';
  else
    v_winner := null;
    v_status := 'scheduled';
  end if;

  update public.playoff_series
  set high_seed_wins = v_high_wins,
      low_seed_wins = v_low_wins,
      status = v_status,
      winner_team_id = v_winner
  where id = p_series_id;

  -- Auto-advance the winner into whichever slot is open in the next series. Idempotent:
  -- re-running with the same winner is a no-op once both updates have already applied.
  if v_winner is not null and v_series.advances_to_series_id is not null then
    update public.playoff_series
    set high_seed_team_id = v_winner
    where id = v_series.advances_to_series_id
      and high_seed_team_id is null
      and low_seed_team_id is distinct from v_winner;

    update public.playoff_series
    set low_seed_team_id = v_winner
    where id = v_series.advances_to_series_id
      and low_seed_team_id is null
      and high_seed_team_id is distinct from v_winner;
  end if;
end;
$$;

create or replace function public.recompute_game(p_game_id uuid) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game record;
  v_home_score int;
  v_away_score int;
begin
  select * into v_game from public.games where id = p_game_id for update;
  if not found or v_game.status <> 'final' then
    return;
  end if;

  -- 1. Cached score, from real goal events only (a shootout's deciding goal is never
  --    recorded as a game_events row, so a shootout-decided game legitimately shows the
  --    tied regulation/OT score here even though winner_team_id is set).
  select
    count(*) filter (where team_id = v_game.home_team_id),
    count(*) filter (where team_id = v_game.away_team_id)
  into v_home_score, v_away_score
  from public.game_events
  where game_id = p_game_id and event_type = 'goal';

  update public.games
  set home_score = coalesce(v_home_score, 0),
      away_score = coalesce(v_away_score, 0)
  where id = p_game_id;

  -- 2. Standings (regular season only; forfeits DO count here since the team W/L still
  --    applies even though no events were logged).
  if not v_game.is_playoff then
    perform public.recompute_standings_for_team(v_game.season_id, v_game.division_id, v_game.home_team_id);
    perform public.recompute_standings_for_team(v_game.season_id, v_game.division_id, v_game.away_team_id);
  end if;

  -- 3. Playoff series tally + advancement.
  if v_game.is_playoff and v_game.series_id is not null then
    perform public.recompute_playoff_series(v_game.series_id);
  end if;
end;
$$;

-- Fires when a game transitions INTO final. Does not re-fire on the internal
-- home_score/away_score update inside recompute_game() because that update never touches
-- the `status` column.
create or replace function public.trg_games_finalize_recompute() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recompute_game(new.id);
  return new;
end;
$$;

create trigger games_finalize_recompute
  after update of status on public.games
  for each row
  when (new.status = 'final' and old.status is distinct from 'final')
  execute function public.trg_games_finalize_recompute();

-- Fires on any correction to a finalized game's events (insert/update/delete) — this is
-- the mechanism that makes post-finalize corrections structurally impossible to forget to
-- recompute. No-ops for games that aren't final yet (live entry doesn't need this).
create or replace function public.trg_game_events_recompute() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
  v_status public.game_status;
begin
  v_game_id := coalesce(new.game_id, old.game_id);

  select status into v_status from public.games where id = v_game_id;

  if v_status = 'final' then
    perform public.recompute_game(v_game_id);
  end if;

  return coalesce(new, old);
end;
$$;

create trigger game_events_recompute
  after insert or update or delete on public.game_events
  for each row
  execute function public.trg_game_events_recompute();
