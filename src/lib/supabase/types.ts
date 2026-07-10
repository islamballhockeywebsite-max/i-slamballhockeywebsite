export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          is_pinned: boolean
          is_published: boolean
          published_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          published_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      divisions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          season_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          season_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "divisions_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      game_events: {
        Row: {
          assist1_player_id: string | null
          assist2_player_id: string | null
          created_at: string
          created_by: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          game_id: string
          game_time: string | null
          goalie_id: string | null
          id: string
          is_empty_net: boolean | null
          is_own_goal: boolean | null
          penalty_minutes: number | null
          penalty_type: string | null
          period: number | null
          player_id: string | null
          strength: Database["public"]["Enums"]["goal_strength"] | null
          team_id: string
        }
        Insert: {
          assist1_player_id?: string | null
          assist2_player_id?: string | null
          created_at?: string
          created_by?: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          game_id: string
          game_time?: string | null
          goalie_id?: string | null
          id?: string
          is_empty_net?: boolean | null
          is_own_goal?: boolean | null
          penalty_minutes?: number | null
          penalty_type?: string | null
          period?: number | null
          player_id?: string | null
          strength?: Database["public"]["Enums"]["goal_strength"] | null
          team_id: string
        }
        Update: {
          assist1_player_id?: string | null
          assist2_player_id?: string | null
          created_at?: string
          created_by?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          game_id?: string
          game_time?: string | null
          goalie_id?: string | null
          id?: string
          is_empty_net?: boolean | null
          is_own_goal?: boolean | null
          penalty_minutes?: number | null
          penalty_type?: string | null
          period?: number | null
          player_id?: string | null
          strength?: Database["public"]["Enums"]["goal_strength"] | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_events_assist1_player_id_fkey"
            columns: ["assist1_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_assist1_player_id_fkey"
            columns: ["assist1_player_id"]
            isOneToOne: false
            referencedRelation: "players_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_assist2_player_id_fkey"
            columns: ["assist2_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_assist2_player_id_fkey"
            columns: ["assist2_player_id"]
            isOneToOne: false
            referencedRelation: "players_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_goalie_id_fkey"
            columns: ["goalie_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_goalie_id_fkey"
            columns: ["goalie_id"]
            isOneToOne: false
            referencedRelation: "players_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      game_lineups: {
        Row: {
          created_at: string
          game_id: string
          id: string
          is_present: boolean
          player_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          is_present?: boolean
          player_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          is_present?: boolean
          player_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_lineups_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_lineups_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_lineups_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_lineups_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          away_score: number
          away_team_id: string
          created_at: string
          current_period: number | null
          division_id: string
          game_clock: string | null
          home_score: number
          home_team_id: string
          id: string
          is_forfeit: boolean
          is_playoff: boolean
          location: string | null
          result_type: Database["public"]["Enums"]["result_type"] | null
          scheduled_at: string | null
          scorekeeper_id: string | null
          season_id: string
          series_id: string | null
          status: Database["public"]["Enums"]["game_status"]
          winner_team_id: string | null
        }
        Insert: {
          away_score?: number
          away_team_id: string
          created_at?: string
          current_period?: number | null
          division_id: string
          game_clock?: string | null
          home_score?: number
          home_team_id: string
          id?: string
          is_forfeit?: boolean
          is_playoff?: boolean
          location?: string | null
          result_type?: Database["public"]["Enums"]["result_type"] | null
          scheduled_at?: string | null
          scorekeeper_id?: string | null
          season_id: string
          series_id?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          winner_team_id?: string | null
        }
        Update: {
          away_score?: number
          away_team_id?: string
          created_at?: string
          current_period?: number | null
          division_id?: string
          game_clock?: string | null
          home_score?: number
          home_team_id?: string
          id?: string
          is_forfeit?: boolean
          is_playoff?: boolean
          location?: string | null
          result_type?: Database["public"]["Enums"]["result_type"] | null
          scheduled_at?: string | null
          scorekeeper_id?: string | null
          season_id?: string
          series_id?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "playoff_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      goalie_appearances: {
        Row: {
          created_at: string
          decision: Database["public"]["Enums"]["goalie_decision"] | null
          game_id: string
          id: string
          is_starter: boolean
          player_id: string
          shots_against: number
          team_id: string
        }
        Insert: {
          created_at?: string
          decision?: Database["public"]["Enums"]["goalie_decision"] | null
          game_id: string
          id?: string
          is_starter?: boolean
          player_id: string
          shots_against?: number
          team_id: string
        }
        Update: {
          created_at?: string
          decision?: Database["public"]["Enums"]["goalie_decision"] | null
          game_id?: string
          id?: string
          is_starter?: boolean
          player_id?: string
          shots_against?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goalie_appearances_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goalie_appearances_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goalie_appearances_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goalie_appearances_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_goalie_season_stats: {
        Row: {
          added_by: string | null
          created_at: string
          gaa: number | null
          games_played: number | null
          goals_against: number | null
          id: string
          losses: number | null
          notes: string | null
          player_id: string
          save_pct: number | null
          saves: number | null
          season_label: string | null
          shots_against: number | null
          shutouts: number | null
          source: Database["public"]["Enums"]["record_source"]
          team_name: string | null
          ties: number | null
          updated_at: string | null
          wins: number | null
          year: number
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          gaa?: number | null
          games_played?: number | null
          goals_against?: number | null
          id?: string
          losses?: number | null
          notes?: string | null
          player_id: string
          save_pct?: number | null
          saves?: number | null
          season_label?: string | null
          shots_against?: number | null
          shutouts?: number | null
          source?: Database["public"]["Enums"]["record_source"]
          team_name?: string | null
          ties?: number | null
          updated_at?: string | null
          wins?: number | null
          year: number
        }
        Update: {
          added_by?: string | null
          created_at?: string
          gaa?: number | null
          games_played?: number | null
          goals_against?: number | null
          id?: string
          losses?: number | null
          notes?: string | null
          player_id?: string
          save_pct?: number | null
          saves?: number | null
          season_label?: string | null
          shots_against?: number | null
          shutouts?: number | null
          source?: Database["public"]["Enums"]["record_source"]
          team_name?: string | null
          ties?: number | null
          updated_at?: string | null
          wins?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "historical_goalie_season_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_goalie_season_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players_public"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_player_season_stats: {
        Row: {
          added_by: string | null
          assists: number | null
          created_at: string
          division_name: string | null
          games_played: number | null
          goals: number | null
          gtg: number | null
          gwg: number | null
          id: string
          notes: string | null
          pim: number | null
          player_id: string
          points: number | null
          ppg: number | null
          season_label: string | null
          shg: number | null
          source: Database["public"]["Enums"]["record_source"]
          team_name: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          added_by?: string | null
          assists?: number | null
          created_at?: string
          division_name?: string | null
          games_played?: number | null
          goals?: number | null
          gtg?: number | null
          gwg?: number | null
          id?: string
          notes?: string | null
          pim?: number | null
          player_id: string
          points?: number | null
          ppg?: number | null
          season_label?: string | null
          shg?: number | null
          source?: Database["public"]["Enums"]["record_source"]
          team_name?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          added_by?: string | null
          assists?: number | null
          created_at?: string
          division_name?: string | null
          games_played?: number | null
          goals?: number | null
          gtg?: number | null
          gwg?: number | null
          id?: string
          notes?: string | null
          pim?: number | null
          player_id?: string
          points?: number | null
          ppg?: number | null
          season_label?: string | null
          shg?: number | null
          source?: Database["public"]["Enums"]["record_source"]
          team_name?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "historical_player_season_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_player_season_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players_public"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string
          date_of_birth: string | null
          default_position:
            | Database["public"]["Enums"]["player_position"]
            | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          external_ref: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          photo_url: string | null
          source: Database["public"]["Enums"]["record_source"]
          status: Database["public"]["Enums"]["player_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          default_position?:
            | Database["public"]["Enums"]["player_position"]
            | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          external_ref?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          photo_url?: string | null
          source?: Database["public"]["Enums"]["record_source"]
          status?: Database["public"]["Enums"]["player_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          default_position?:
            | Database["public"]["Enums"]["player_position"]
            | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          external_ref?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          photo_url?: string | null
          source?: Database["public"]["Enums"]["record_source"]
          status?: Database["public"]["Enums"]["player_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      playoff_seeds: {
        Row: {
          created_at: string
          division_id: string
          id: string
          season_id: string
          seed: number
          team_id: string
        }
        Insert: {
          created_at?: string
          division_id: string
          id?: string
          season_id: string
          seed: number
          team_id: string
        }
        Update: {
          created_at?: string
          division_id?: string
          id?: string
          season_id?: string
          seed?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playoff_seeds_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playoff_seeds_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playoff_seeds_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      playoff_series: {
        Row: {
          advances_to_series_id: string | null
          best_of: number
          created_at: string
          division_id: string
          high_seed_team_id: string | null
          high_seed_wins: number
          id: string
          label: string | null
          low_seed_team_id: string | null
          low_seed_wins: number
          round: number
          season_id: string
          status: Database["public"]["Enums"]["series_status"]
          winner_team_id: string | null
        }
        Insert: {
          advances_to_series_id?: string | null
          best_of?: number
          created_at?: string
          division_id: string
          high_seed_team_id?: string | null
          high_seed_wins?: number
          id?: string
          label?: string | null
          low_seed_team_id?: string | null
          low_seed_wins?: number
          round: number
          season_id: string
          status?: Database["public"]["Enums"]["series_status"]
          winner_team_id?: string | null
        }
        Update: {
          advances_to_series_id?: string | null
          best_of?: number
          created_at?: string
          division_id?: string
          high_seed_team_id?: string | null
          high_seed_wins?: number
          id?: string
          label?: string | null
          low_seed_team_id?: string | null
          low_seed_wins?: number
          round?: number
          season_id?: string
          status?: Database["public"]["Enums"]["series_status"]
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playoff_series_advances_to_series_id_fkey"
            columns: ["advances_to_series_id"]
            isOneToOne: false
            referencedRelation: "playoff_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playoff_series_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playoff_series_high_seed_team_id_fkey"
            columns: ["high_seed_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playoff_series_low_seed_team_id_fkey"
            columns: ["low_seed_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playoff_series_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playoff_series_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      rosters: {
        Row: {
          added_at: string
          id: string
          is_spare: boolean
          jersey_number: number | null
          joined_at: string | null
          left_at: string | null
          player_id: string
          position: Database["public"]["Enums"]["player_position"] | null
          role: Database["public"]["Enums"]["roster_role"]
          status: Database["public"]["Enums"]["roster_status"]
          team_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          is_spare?: boolean
          jersey_number?: number | null
          joined_at?: string | null
          left_at?: string | null
          player_id: string
          position?: Database["public"]["Enums"]["player_position"] | null
          role?: Database["public"]["Enums"]["roster_role"]
          status?: Database["public"]["Enums"]["roster_status"]
          team_id: string
        }
        Update: {
          added_at?: string
          id?: string
          is_spare?: boolean
          jersey_number?: number | null
          joined_at?: string | null
          left_at?: string | null
          player_id?: string
          position?: Database["public"]["Enums"]["player_position"] | null
          role?: Database["public"]["Enums"]["roster_role"]
          status?: Database["public"]["Enums"]["roster_status"]
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rosters_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rosters_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rosters_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      season_players: {
        Row: {
          added_at: string
          added_by: string | null
          division_id: string | null
          id: string
          player_id: string
          season_id: string
          source: Database["public"]["Enums"]["record_source"]
          status: Database["public"]["Enums"]["enrollment_status"]
          waiver_signed: boolean
          waiver_signed_at: string | null
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          division_id?: string | null
          id?: string
          player_id: string
          season_id: string
          source?: Database["public"]["Enums"]["record_source"]
          status?: Database["public"]["Enums"]["enrollment_status"]
          waiver_signed?: boolean
          waiver_signed_at?: string | null
        }
        Update: {
          added_at?: string
          added_by?: string | null
          division_id?: string | null
          id?: string
          player_id?: string
          season_id?: string
          source?: Database["public"]["Enums"]["record_source"]
          status?: Database["public"]["Enums"]["enrollment_status"]
          waiver_signed?: boolean
          waiver_signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "season_players_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_players_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          name: string
          playoffs_active: boolean
          points_loss: number
          points_tie: number
          points_win: number
          start_date: string | null
          status: Database["public"]["Enums"]["season_status"]
          year: number
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          playoffs_active?: boolean
          points_loss?: number
          points_tie?: number
          points_win?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["season_status"]
          year: number
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          playoffs_active?: boolean
          points_loss?: number
          points_tie?: number
          points_win?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["season_status"]
          year?: number
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          link_url: string | null
          logo_url: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          link_url?: string | null
          logo_url: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          link_url?: string | null
          logo_url?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      standings: {
        Row: {
          division_id: string
          games_played: number
          goal_differential: number | null
          goals_against: number
          goals_for: number
          id: string
          losses: number
          points: number
          season_id: string
          team_id: string
          ties: number
          updated_at: string
          wins: number
        }
        Insert: {
          division_id: string
          games_played?: number
          goal_differential?: number | null
          goals_against?: number
          goals_for?: number
          id?: string
          losses?: number
          points?: number
          season_id: string
          team_id: string
          ties?: number
          updated_at?: string
          wins?: number
        }
        Update: {
          division_id?: string
          games_played?: number
          goal_differential?: number | null
          goals_against?: number
          goals_for?: number
          id?: string
          losses?: number
          points?: number
          season_id?: string
          team_id?: string
          ties?: number
          updated_at?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "standings_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          captain_player_id: string | null
          created_at: string
          division_id: string
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          season_id: string
        }
        Insert: {
          captain_player_id?: string | null
          created_at?: string
          division_id: string
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          season_id: string
        }
        Update: {
          captain_player_id?: string | null
          created_at?: string
          division_id?: string
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_captain_player_id_fkey"
            columns: ["captain_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_captain_player_id_fkey"
            columns: ["captain_player_id"]
            isOneToOne: false
            referencedRelation: "players_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      goalie_season_stats: {
        Row: {
          gaa: number | null
          games_played: number | null
          goals_against: number | null
          losses: number | null
          player_id: string | null
          save_pct: number | null
          saves: number | null
          season_id: string | null
          season_label: string | null
          shots_against: number | null
          shutouts: number | null
          source: string | null
          ties: number | null
          wins: number | null
          year: number | null
        }
        Relationships: []
      }
      player_career_stats: {
        Row: {
          assists: number | null
          games_played: number | null
          goals: number | null
          gtg: number | null
          gwg: number | null
          pim: number | null
          player_id: string | null
          points: number | null
          points_per_game: number | null
          ppg: number | null
          shg: number | null
        }
        Relationships: []
      }
      player_season_stats: {
        Row: {
          assists: number | null
          division_id: string | null
          division_name: string | null
          games_played: number | null
          goals: number | null
          gtg: number | null
          gwg: number | null
          pim: number | null
          player_id: string | null
          points: number | null
          points_per_game: number | null
          ppg: number | null
          season_id: string | null
          season_label: string | null
          shg: number | null
          source: string | null
          team_id: string | null
          team_name: string | null
          year: number | null
        }
        Relationships: []
      }
      players_public: {
        Row: {
          default_position:
            | Database["public"]["Enums"]["player_position"]
            | null
          first_name: string | null
          id: string | null
          last_name: string | null
          photo_url: string | null
          status: Database["public"]["Enums"]["player_status"] | null
        }
        Insert: {
          default_position?:
            | Database["public"]["Enums"]["player_position"]
            | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["player_status"] | null
        }
        Update: {
          default_position?:
            | Database["public"]["Enums"]["player_position"]
            | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["player_status"] | null
        }
        Relationships: []
      }
      stats_leaders: {
        Row: {
          assists: number | null
          division_id: string | null
          division_name: string | null
          first_name: string | null
          gaa: number | null
          games_played: number | null
          goals: number | null
          goals_against: number | null
          gtg: number | null
          gwg: number | null
          last_name: string | null
          losses: number | null
          pim: number | null
          player_id: string | null
          player_type: string | null
          points: number | null
          points_per_game: number | null
          ppg: number | null
          save_pct: number | null
          saves: number | null
          season_id: string | null
          season_label: string | null
          shg: number | null
          shots_against: number | null
          shutouts: number | null
          source: string | null
          team_id: string | null
          team_name: string | null
          ties: number | null
          wins: number | null
          year: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_scorekeeper: { Args: never; Returns: boolean }
      parse_game_clock_seconds: { Args: { p_clock: string }; Returns: number }
      recompute_game: { Args: { p_game_id: string }; Returns: undefined }
      recompute_playoff_series: {
        Args: { p_series_id: string }
        Returns: undefined
      }
      recompute_standings_for_team: {
        Args: { p_division_id: string; p_season_id: string; p_team_id: string }
        Returns: undefined
      }
    }
    Enums: {
      enrollment_status: "active" | "inactive"
      event_type:
        | "goal"
        | "penalty"
        | "goalie_change"
        | "period_start"
        | "period_end"
      game_status: "scheduled" | "in_progress" | "final" | "postponed"
      goal_strength: "even" | "powerplay" | "shorthanded"
      goalie_decision: "win" | "loss" | "tie" | "none"
      player_position: "forward" | "defense" | "goalie"
      player_status: "active" | "inactive"
      record_source: "manual" | "csv" | "import"
      result_type: "regulation" | "overtime" | "shootout" | "tie"
      roster_role: "player" | "captain" | "assistant"
      roster_status: "active" | "traded" | "released"
      season_status: "upcoming" | "active" | "completed"
      series_status: "scheduled" | "in_progress" | "complete"
      user_role: "admin" | "scorekeeper"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      enrollment_status: ["active", "inactive"],
      event_type: [
        "goal",
        "penalty",
        "goalie_change",
        "period_start",
        "period_end",
      ],
      game_status: ["scheduled", "in_progress", "final", "postponed"],
      goal_strength: ["even", "powerplay", "shorthanded"],
      goalie_decision: ["win", "loss", "tie", "none"],
      player_position: ["forward", "defense", "goalie"],
      player_status: ["active", "inactive"],
      record_source: ["manual", "csv", "import"],
      result_type: ["regulation", "overtime", "shootout", "tie"],
      roster_role: ["player", "captain", "assistant"],
      roster_status: ["active", "traded", "released"],
      season_status: ["upcoming", "active", "completed"],
      series_status: ["scheduled", "in_progress", "complete"],
      user_role: ["admin", "scorekeeper"],
    },
  },
} as const
