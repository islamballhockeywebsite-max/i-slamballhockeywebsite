import { z } from "zod";

const optionalUuid = z.uuid().nullable().optional().transform((v) => v ?? null);
const optionalPeriod = z.coerce.number().int().min(1).max(20).nullable().optional().transform((v) => v ?? null);
const optionalGameTime = z.string().nullable().optional().transform((v) => (v && v.trim() ? v.trim() : null));

export const goalEventSchema = z
  .object({
    team_id: z.uuid(),
    player_id: z.uuid("Scorer is required"),
    assist1_player_id: optionalUuid,
    assist2_player_id: optionalUuid,
    goalie_id: optionalUuid,
    strength: z.enum(["even", "powerplay", "shorthanded"]).nullable().optional().transform((v) => v ?? null),
    is_empty_net: z.boolean().default(false),
    is_own_goal: z.boolean().default(false),
    period: optionalPeriod,
    game_time: optionalGameTime,
  })
  .refine((d) => d.assist1_player_id !== d.player_id, {
    message: "Assist cannot be the same player as the scorer",
    path: ["assist1_player_id"],
  })
  .refine((d) => !d.assist2_player_id || d.assist2_player_id !== d.assist1_player_id, {
    message: "Second assist must differ from the first",
    path: ["assist2_player_id"],
  });

export type GoalEventInput = z.infer<typeof goalEventSchema>;

export const penaltyEventSchema = z.object({
  team_id: z.uuid(),
  player_id: z.uuid("Player is required"),
  penalty_type: z.string().min(1, "Penalty type is required"),
  penalty_minutes: z.coerce.number().int().min(1, "Minutes must be at least 1").max(60),
  period: optionalPeriod,
  game_time: optionalGameTime,
});

export type PenaltyEventInput = z.infer<typeof penaltyEventSchema>;

export const finalizeGameSchema = z
  .object({
    result_type: z.enum(["regulation", "overtime", "shootout", "tie"]),
    winner_team_id: z.uuid().nullable(),
  })
  .refine((d) => (d.result_type === "tie" ? d.winner_team_id === null : !!d.winner_team_id), {
    message: "Select a winner, or choose \"Tie\" as the result",
    path: ["winner_team_id"],
  });

export type FinalizeGameInput = z.infer<typeof finalizeGameSchema>;
