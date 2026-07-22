export type ImportType = "players" | "historical_skaters" | "historical_goalies";

export type TargetField = {
  key: string;
  label: string;
  required?: boolean;
};

/**
 * Target fields per import type. The two historical types use `player_first_name` /
 * `player_last_name` (not stored directly) purely to resolve an existing players.id via
 * dedupe matching — historical_*_stats.player_id is a required FK, so every row must
 * resolve to a real player before it can commit.
 */
export const FIELD_DEFS: Record<ImportType, TargetField[]> = {
  players: [
    { key: "first_name", label: "First name", required: true },
    { key: "last_name", label: "Last name", required: true },
    { key: "date_of_birth", label: "Date of birth" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "default_position", label: "Position (forward/defense/goalie)" },
    { key: "emergency_contact_name", label: "Emergency contact name" },
    { key: "emergency_contact_phone", label: "Emergency contact phone" },
  ],
  historical_skaters: [
    { key: "player_first_name", label: "Player first name", required: true },
    { key: "player_last_name", label: "Player last name", required: true },
    { key: "year", label: "Year", required: true },
    { key: "season_label", label: "Season label" },
    { key: "team_name", label: "Team name" },
    { key: "division_name", label: "Division name" },
    { key: "games_played", label: "Games played" },
    { key: "goals", label: "Goals" },
    { key: "assists", label: "Assists" },
    { key: "points", label: "Points" },
    { key: "pim", label: "PIM" },
    { key: "ppg", label: "PPG" },
    { key: "shg", label: "SHG" },
    { key: "gwg", label: "GWG" },
    { key: "gtg", label: "GTG" },
    { key: "notes", label: "Notes" },
  ],
  historical_goalies: [
    { key: "player_first_name", label: "Player first name", required: true },
    { key: "player_last_name", label: "Player last name", required: true },
    { key: "year", label: "Year", required: true },
    { key: "season_label", label: "Season label" },
    { key: "team_name", label: "Team name" },
    { key: "games_played", label: "Games played" },
    { key: "wins", label: "Wins" },
    { key: "losses", label: "Losses" },
    { key: "ties", label: "Ties" },
    { key: "goals_against", label: "Goals against" },
    { key: "shots_against", label: "Shots against" },
    { key: "saves", label: "Saves" },
    { key: "shutouts", label: "Shutouts" },
    { key: "gaa", label: "GAA" },
    { key: "save_pct", label: "Save %" },
    { key: "notes", label: "Notes" },
  ],
};

export const IMPORT_TYPE_LABELS: Record<ImportType, string> = {
  players: "Players",
  historical_skaters: "Historical Skater Stats",
  historical_goalies: "Historical Goalie Stats",
};

/** Best-effort auto-mapping from CSV headers to target field keys by normalized name match. */
export function guessMapping(headers: string[], type: ImportType): Record<string, string | null> {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const fields = FIELD_DEFS[type];
  const mapping: Record<string, string | null> = {};

  for (const field of fields) {
    const fieldNorm = normalize(field.key);
    const labelNorm = normalize(field.label);
    const match = headers.find((h) => {
      const hNorm = normalize(h);
      return hNorm === fieldNorm || hNorm === labelNorm || fieldNorm.includes(hNorm) || hNorm.includes(fieldNorm);
    });
    mapping[field.key] = match ?? null;
  }

  return mapping;
}
