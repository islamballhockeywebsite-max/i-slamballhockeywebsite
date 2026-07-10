-- =====================================================================================
-- Views. Created without security_invoker, so each runs with its owner's privileges
-- (the migration role) and can safely join admin-only tables (players, historical_*)
-- internally — exactly the pattern the spec's own players_public view relies on. Every
-- view here is careful to project only non-PII columns out. Supabase's default schema
-- privileges (set at project provisioning) grant SELECT on new relations, including
-- views, to anon/authenticated, so no explicit GRANT is needed here — RLS on the base
-- tables is what's bypassed, not the view's own access.
-- =====================================================================================

-- PII-safe public projection of players (the ONLY way the public reads player data).
create view public.players_public as
select id, first_name, last_name, photo_url, default_position, status
from public.players;

-- Parses a "mm:ss" period clock into total seconds. Used only to reconstruct chronological
-- goal order within a period (the clock counts down, so ordering is by seconds DESC).
-- Returns null on anything that doesn't match, so callers can fall back to created_at.
create or replace function public.parse_game_clock_seconds(p_clock text) returns int
language sql immutable as $$
  select case
    when p_clock ~ '^[0-9]{1,2}:[0-9]{2}$' then
      (split_part(p_clock, ':', 1)::int * 60) + split_part(p_clock, ':', 2)::int
    else null
  end;
$$;

-- ---------------------------------------------------------------------------------------
-- player_season_stats — grain (player, season, team). A traded player gets one row per
-- team; a "season total" row is a rollup the caller computes by grouping without team_id.
-- UNIONs live-derived rows with historical_player_season_stats, flagged via `source`.
-- ---------------------------------------------------------------------------------------
create view public.player_season_stats as
with goal_scorers as (
  select ge.id as event_id, ge.game_id, ge.player_id, ge.team_id, ge.strength, g.season_id
  from public.game_events ge
  join public.games g on g.id = ge.game_id
  where ge.event_type = 'goal' and g.status = 'final' and g.is_forfeit = false
    and ge.player_id is not null
),
assists_long as (
  select ge.assist1_player_id as player_id, ge.team_id, g.season_id
  from public.game_events ge
  join public.games g on g.id = ge.game_id
  where ge.event_type = 'goal' and g.status = 'final' and g.is_forfeit = false
    and ge.assist1_player_id is not null
  union all
  select ge.assist2_player_id as player_id, ge.team_id, g.season_id
  from public.game_events ge
  join public.games g on g.id = ge.game_id
  where ge.event_type = 'goal' and g.status = 'final' and g.is_forfeit = false
    and ge.assist2_player_id is not null
),
penalties as (
  select ge.player_id, ge.team_id, g.season_id, ge.penalty_minutes
  from public.game_events ge
  join public.games g on g.id = ge.game_id
  where ge.event_type = 'penalty' and g.status = 'final' and g.is_forfeit = false
    and ge.player_id is not null
),
gp_agg as (
  select gl.player_id, gl.team_id, g.season_id, count(*)::int as games_played
  from public.game_lineups gl
  join public.games g on g.id = gl.game_id
  where gl.is_present = true and g.status = 'final' and g.is_forfeit = false
  group by gl.player_id, gl.team_id, g.season_id
),
goals_agg as (
  select player_id, team_id, season_id,
    count(*)::int as goals,
    count(*) filter (where strength = 'powerplay')::int as ppg,
    count(*) filter (where strength = 'shorthanded')::int as shg
  from goal_scorers
  group by player_id, team_id, season_id
),
assists_agg as (
  select player_id, team_id, season_id, count(*)::int as assists
  from assists_long
  group by player_id, team_id, season_id
),
pim_agg as (
  select player_id, team_id, season_id, coalesce(sum(penalty_minutes), 0)::int as pim
  from penalties
  group by player_id, team_id, season_id
),
-- GWG/GTG: reconstruct chronological order of goals within each game, track the running
-- score for each team, then flag the goal that brought the eventual winner's tally to
-- (loser's final + 1) as the GWG, and the last goal that left the score tied as the GTG.
ordered_goals as (
  select
    ge.id as event_id, ge.game_id, ge.team_id, ge.player_id, g.season_id,
    g.home_team_id, g.away_team_id, g.winner_team_id,
    row_number() over (
      partition by ge.game_id
      order by ge.period asc nulls last,
               public.parse_game_clock_seconds(ge.game_time) desc nulls last,
               ge.created_at asc
    ) as seq
  from public.game_events ge
  join public.games g on g.id = ge.game_id
  where ge.event_type = 'goal' and g.status = 'final' and g.is_forfeit = false
),
running as (
  select
    o.*,
    sum((team_id = home_team_id)::int) over (partition by game_id order by seq) as home_running,
    sum((team_id = away_team_id)::int) over (partition by game_id order by seq) as away_running
  from ordered_goals o
),
game_finals as (
  select game_id, max(home_running) as home_final, max(away_running) as away_final
  from running
  group by game_id
),
running_flagged as (
  select
    r.*,
    greatest(gf.home_final, gf.away_final) as winner_final,
    least(gf.home_final, gf.away_final) as loser_final,
    max(case when r.home_running = r.away_running then r.seq end)
      over (partition by r.game_id) as last_tie_seq
  from running r
  join game_finals gf on gf.game_id = r.game_id
),
gwg_gtg_flagged as (
  select
    event_id, game_id, team_id, player_id, season_id,
    (
      winner_team_id is not null
      and winner_final <> loser_final
      and team_id = winner_team_id
      and (
        (team_id = home_team_id and home_running = loser_final + 1)
        or (team_id = away_team_id and away_running = loser_final + 1)
      )
    ) as is_gwg,
    (home_running = away_running and seq = last_tie_seq) as is_gtg
  from running_flagged
),
gwg_agg as (
  select player_id, team_id, season_id,
    count(*) filter (where is_gwg)::int as gwg,
    count(*) filter (where is_gtg)::int as gtg
  from gwg_gtg_flagged
  where player_id is not null
  group by player_id, team_id, season_id
),
keys as (
  select player_id, team_id, season_id from gp_agg
  union
  select player_id, team_id, season_id from goals_agg
  union
  select player_id, team_id, season_id from assists_agg
  union
  select player_id, team_id, season_id from pim_agg
  union
  select player_id, team_id, season_id from gwg_agg
),
live_rows as (
  select
    'live'::text as source,
    k.season_id,
    s.year,
    s.name as season_label,
    k.team_id,
    t.name as team_name,
    t.division_id,
    d.name as division_name,
    k.player_id,
    coalesce(gp.games_played, 0) as games_played,
    coalesce(ga.goals, 0) as goals,
    coalesce(aa.assists, 0) as assists,
    coalesce(ga.goals, 0) + coalesce(aa.assists, 0) as points,
    case when coalesce(gp.games_played, 0) = 0 then null
      else round((coalesce(ga.goals, 0) + coalesce(aa.assists, 0))::numeric / gp.games_played, 2)
    end as points_per_game,
    coalesce(pa.pim, 0) as pim,
    coalesce(ga.ppg, 0) as ppg,
    coalesce(ga.shg, 0) as shg,
    coalesce(gw.gwg, 0) as gwg,
    coalesce(gw.gtg, 0) as gtg
  from keys k
  left join gp_agg gp using (player_id, team_id, season_id)
  left join goals_agg ga using (player_id, team_id, season_id)
  left join assists_agg aa using (player_id, team_id, season_id)
  left join pim_agg pa using (player_id, team_id, season_id)
  left join gwg_agg gw using (player_id, team_id, season_id)
  join public.seasons s on s.id = k.season_id
  join public.teams t on t.id = k.team_id
  left join public.divisions d on d.id = t.division_id
),
historical_rows as (
  select
    'historical'::text as source,
    null::uuid as season_id,
    h.year,
    h.season_label,
    null::uuid as team_id,
    h.team_name,
    null::uuid as division_id,
    h.division_name,
    h.player_id,
    coalesce(h.games_played, 0) as games_played,
    coalesce(h.goals, 0) as goals,
    coalesce(h.assists, 0) as assists,
    coalesce(h.points, coalesce(h.goals, 0) + coalesce(h.assists, 0)) as points,
    case when coalesce(h.games_played, 0) = 0 then null
      else round(coalesce(h.points, coalesce(h.goals, 0) + coalesce(h.assists, 0))::numeric / h.games_played, 2)
    end as points_per_game,
    coalesce(h.pim, 0) as pim,
    coalesce(h.ppg, 0) as ppg,
    coalesce(h.shg, 0) as shg,
    coalesce(h.gwg, 0) as gwg,
    coalesce(h.gtg, 0) as gtg
  from public.historical_player_season_stats h
)
select * from live_rows
union all
select * from historical_rows;

-- ---------------------------------------------------------------------------------------
-- player_career_stats — sums player_season_stats (already live+historical) across every
-- season/team for a player, plus career P/G.
-- ---------------------------------------------------------------------------------------
create view public.player_career_stats as
select
  player_id,
  sum(games_played)::int as games_played,
  sum(goals)::int as goals,
  sum(assists)::int as assists,
  sum(points)::int as points,
  case when sum(games_played) = 0 then null
    else round(sum(points)::numeric / sum(games_played), 2)
  end as points_per_game,
  sum(pim)::int as pim,
  sum(ppg)::int as ppg,
  sum(shg)::int as shg,
  sum(gwg)::int as gwg,
  sum(gtg)::int as gtg
from public.player_season_stats
group by player_id;

-- ---------------------------------------------------------------------------------------
-- goalie_season_stats — grain (goalie, season), no team dimension (a goalie's stats stay
-- unified across a mid-season trade). UNIONs with historical_goalie_season_stats.
-- ---------------------------------------------------------------------------------------
create view public.goalie_season_stats as
with live_appearances as (
  select ga.player_id, ga.team_id, ga.game_id, ga.shots_against, ga.decision, g.season_id
  from public.goalie_appearances ga
  join public.games g on g.id = ga.game_id
  where g.status = 'final' and g.is_forfeit = false
),
ga_agg as (
  select ge.goalie_id as player_id, g.season_id, count(*)::int as goals_against
  from public.game_events ge
  join public.games g on g.id = ge.game_id
  where ge.event_type = 'goal' and g.status = 'final' and g.is_forfeit = false
    and ge.goalie_id is not null
  group by ge.goalie_id, g.season_id
),
appearances_agg as (
  select
    player_id, season_id,
    count(distinct game_id)::int as games_played,
    coalesce(sum(shots_against), 0)::int as shots_against,
    count(*) filter (where decision = 'win')::int as wins,
    count(*) filter (where decision = 'loss')::int as losses,
    count(*) filter (where decision = 'tie')::int as ties
  from live_appearances
  group by player_id, season_id
),
shutouts_agg as (
  select la.player_id, la.season_id, count(*)::int as shutouts
  from live_appearances la
  where not exists (
    select 1 from public.game_events ge2
    where ge2.game_id = la.game_id and ge2.event_type = 'goal' and ge2.team_id <> la.team_id
  )
  group by la.player_id, la.season_id
),
keys as (
  select player_id, season_id from appearances_agg
  union
  select player_id, season_id from ga_agg
),
live_rows as (
  select
    'live'::text as source,
    k.season_id,
    s.year,
    s.name as season_label,
    k.player_id,
    coalesce(ap.games_played, 0) as games_played,
    coalesce(ap.wins, 0) as wins,
    coalesce(ap.losses, 0) as losses,
    coalesce(ap.ties, 0) as ties,
    coalesce(gaa_src.goals_against, 0) as goals_against,
    coalesce(ap.shots_against, 0) as shots_against,
    coalesce(ap.shots_against, 0) - coalesce(gaa_src.goals_against, 0) as saves,
    case when coalesce(ap.shots_against, 0) = 0 then null
      else round((coalesce(ap.shots_against, 0) - coalesce(gaa_src.goals_against, 0))::numeric / ap.shots_against, 3)
    end as save_pct,
    case when coalesce(ap.games_played, 0) = 0 then null
      else round(coalesce(gaa_src.goals_against, 0)::numeric / ap.games_played, 2)
    end as gaa,
    coalesce(so.shutouts, 0) as shutouts
  from keys k
  left join appearances_agg ap using (player_id, season_id)
  left join ga_agg gaa_src using (player_id, season_id)
  left join shutouts_agg so using (player_id, season_id)
  join public.seasons s on s.id = k.season_id
),
historical_rows as (
  select
    'historical'::text as source,
    null::uuid as season_id,
    h.year,
    h.season_label,
    h.player_id,
    coalesce(h.games_played, 0) as games_played,
    coalesce(h.wins, 0) as wins,
    coalesce(h.losses, 0) as losses,
    coalesce(h.ties, 0) as ties,
    coalesce(h.goals_against, 0) as goals_against,
    coalesce(h.shots_against, 0) as shots_against,
    coalesce(h.saves, coalesce(h.shots_against, 0) - coalesce(h.goals_against, 0)) as saves,
    coalesce(
      h.save_pct,
      case when coalesce(h.shots_against, 0) = 0 then null
        else round((coalesce(h.saves, h.shots_against - h.goals_against))::numeric / h.shots_against, 3)
      end
    ) as save_pct,
    coalesce(
      h.gaa,
      case when coalesce(h.games_played, 0) = 0 then null
        else round(coalesce(h.goals_against, 0)::numeric / h.games_played, 2)
      end
    ) as gaa,
    coalesce(h.shutouts, 0) as shutouts
  from public.historical_goalie_season_stats h
)
select * from live_rows
union all
select * from historical_rows;

-- ---------------------------------------------------------------------------------------
-- stats_leaders — convenience layer over player_season_stats + goalie_season_stats for
-- sortable public leaderboards. Discriminated by player_type; the columns that don't
-- apply to a given row's type are null.
-- ---------------------------------------------------------------------------------------
create view public.stats_leaders as
select
  'skater'::text as player_type,
  pss.source, pss.season_id, pss.year, pss.season_label,
  pss.team_id, pss.team_name, pss.division_id, pss.division_name,
  pss.player_id, p.first_name, p.last_name,
  pss.games_played, pss.goals, pss.assists, pss.points, pss.points_per_game,
  pss.pim, pss.ppg, pss.shg, pss.gwg, pss.gtg,
  null::int as wins, null::int as losses, null::int as ties,
  null::int as goals_against, null::int as shots_against, null::int as saves,
  null::numeric as save_pct, null::numeric as gaa, null::int as shutouts
from public.player_season_stats pss
join public.players p on p.id = pss.player_id
union all
select
  'goalie'::text as player_type,
  gss.source, gss.season_id, gss.year, gss.season_label,
  null::uuid as team_id, null::text as team_name, null::uuid as division_id, null::text as division_name,
  gss.player_id, p.first_name, p.last_name,
  gss.games_played, null::int as goals, null::int as assists, null::int as points, null::numeric as points_per_game,
  null::int as pim, null::int as ppg, null::int as shg, null::int as gwg, null::int as gtg,
  gss.wins, gss.losses, gss.ties, gss.goals_against, gss.shots_against, gss.saves,
  gss.save_pct, gss.gaa, gss.shutouts
from public.goalie_season_stats gss
join public.players p on p.id = gss.player_id;
