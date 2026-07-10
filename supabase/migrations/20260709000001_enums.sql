-- Enum types (§2 of the Database Schema doc)
create type public.user_role as enum ('admin', 'scorekeeper');
create type public.player_status as enum ('active', 'inactive');
create type public.record_source as enum ('manual', 'csv', 'import');
create type public.season_status as enum ('upcoming', 'active', 'completed');
create type public.enrollment_status as enum ('active', 'inactive');
create type public.player_position as enum ('forward', 'defense', 'goalie');
create type public.roster_role as enum ('player', 'captain', 'assistant');
create type public.roster_status as enum ('active', 'traded', 'released');
create type public.game_status as enum ('scheduled', 'in_progress', 'final', 'postponed');
create type public.result_type as enum ('regulation', 'overtime', 'shootout', 'tie');
create type public.event_type as enum ('goal', 'penalty', 'goalie_change', 'period_start', 'period_end');
create type public.goal_strength as enum ('even', 'powerplay', 'shorthanded');
create type public.series_status as enum ('scheduled', 'in_progress', 'complete');
create type public.goalie_decision as enum ('win', 'loss', 'tie', 'none');
