import { z } from "zod";
import { optionalNumberFromForm } from "@/lib/validation/shared";

const optionalText = z
  .string()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

const optionalInt = optionalNumberFromForm(z.coerce.number().int());

const optionalNumeric = optionalNumberFromForm(z.coerce.number());

export const historicalSkaterStatSchema = z.object({
  player_id: z.uuid("Select a player"),
  year: z.coerce.number().int().min(1900).max(2200),
  season_label: optionalText,
  team_name: optionalText,
  division_name: optionalText,
  games_played: optionalInt,
  goals: optionalInt,
  assists: optionalInt,
  points: optionalInt,
  pim: optionalInt,
  ppg: optionalInt,
  shg: optionalInt,
  gwg: optionalInt,
  gtg: optionalInt,
  notes: optionalText,
});

export type HistoricalSkaterStatValues = z.infer<typeof historicalSkaterStatSchema>;

export const historicalGoalieStatSchema = z.object({
  player_id: z.uuid("Select a player"),
  year: z.coerce.number().int().min(1900).max(2200),
  season_label: optionalText,
  team_name: optionalText,
  games_played: optionalInt,
  wins: optionalInt,
  losses: optionalInt,
  ties: optionalInt,
  goals_against: optionalInt,
  shots_against: optionalInt,
  saves: optionalInt,
  shutouts: optionalInt,
  gaa: optionalNumeric,
  save_pct: optionalNumeric,
  notes: optionalText,
});

export type HistoricalGoalieStatValues = z.infer<typeof historicalGoalieStatSchema>;
