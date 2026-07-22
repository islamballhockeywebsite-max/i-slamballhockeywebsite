import { z } from "zod";

const optionalText = z
  .string()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

export const gameFormSchema = z
  .object({
    season_id: z.uuid(),
    division_id: z.uuid("Division is required"),
    home_team_id: z.uuid("Home team is required"),
    away_team_id: z.uuid("Away team is required"),
    scheduled_at: optionalText,
    location: optionalText,
  })
  .refine((data) => data.home_team_id !== data.away_team_id, {
    message: "Home and away teams must be different",
    path: ["away_team_id"],
  });

export type GameFormValues = z.infer<typeof gameFormSchema>;
