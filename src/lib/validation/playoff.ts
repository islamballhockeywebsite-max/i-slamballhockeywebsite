import { z } from "zod";

const optionalText = z
  .string()
  .nullable()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

const optionalTeamId = z
  .string()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v : null))
  .pipe(z.uuid().nullable());

export const seriesFormSchema = z.object({
  round: z.coerce.number().int().min(1, "Round must be at least 1"),
  label: optionalText,
  high_seed_team_id: optionalTeamId,
  low_seed_team_id: optionalTeamId,
  best_of: z.coerce
    .number()
    .int()
    .min(1)
    .refine((v) => v % 2 === 1, "Best-of must be an odd number")
    .default(3),
  advances_to_series_id: optionalTeamId,
});

export type SeriesFormValues = z.infer<typeof seriesFormSchema>;

export const playoffGameFormSchema = z
  .object({
    home_team_id: z.uuid("Home team is required"),
    away_team_id: z.uuid("Away team is required"),
    scheduled_at: optionalText,
    location: optionalText,
  })
  .refine((data) => data.home_team_id !== data.away_team_id, {
    message: "Home and away teams must be different",
    path: ["away_team_id"],
  });

export type PlayoffGameFormValues = z.infer<typeof playoffGameFormSchema>;
