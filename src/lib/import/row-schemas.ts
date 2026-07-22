import { z } from "zod";
import { optionalNumberFromForm } from "@/lib/validation/shared";

const optionalText = z
  .string()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

const optionalInt = optionalNumberFromForm(z.coerce.number().int());
const optionalNumeric = optionalNumberFromForm(z.coerce.number());

export const playerRowSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  date_of_birth: optionalText,
  email: z
    .union([z.email("Invalid email"), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  phone: optionalText,
  default_position: z
    .union([z.enum(["forward", "defense", "goalie"]), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  emergency_contact_name: optionalText,
  emergency_contact_phone: optionalText,
});

export type PlayerRow = z.infer<typeof playerRowSchema>;

export const historicalSkaterRowSchema = z.object({
  player_first_name: z.string().trim().min(1, "Player first name is required"),
  player_last_name: z.string().trim().min(1, "Player last name is required"),
  year: z.coerce.number().int().min(1900, "Year is required").max(2200),
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

export type HistoricalSkaterRow = z.infer<typeof historicalSkaterRowSchema>;

export const historicalGoalieRowSchema = z.object({
  player_first_name: z.string().trim().min(1, "Player first name is required"),
  player_last_name: z.string().trim().min(1, "Player last name is required"),
  year: z.coerce.number().int().min(1900, "Year is required").max(2200),
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

export type HistoricalGoalieRow = z.infer<typeof historicalGoalieRowSchema>;
