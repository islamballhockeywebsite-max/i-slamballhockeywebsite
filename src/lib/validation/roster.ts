import { z } from "zod";
import { optionalNumberFromForm } from "@/lib/validation/shared";

export const rosterRoles = ["player", "captain", "assistant"] as const;
const positions = ["forward", "defense", "goalie"] as const;

const optionalPosition = z
  .union([z.enum(positions), z.literal("")])
  .optional()
  .transform((v) => (v ? v : null));

const optionalJersey = optionalNumberFromForm(z.coerce.number().int().min(0).max(999));

export const assignPlayerSchema = z.object({
  team_id: z.uuid(),
  player_id: z.uuid("Select a player"),
  jersey_number: optionalJersey,
  position: optionalPosition,
  role: z.enum(rosterRoles).default("player"),
  is_spare: z.coerce.boolean().default(false),
});

export const editRosterEntrySchema = z.object({
  jersey_number: optionalJersey,
  position: optionalPosition,
  role: z.enum(rosterRoles).default("player"),
});

export const tradeSchema = z.object({
  destination_team_id: z.uuid("Select a destination team"),
  effective_date: z.string().min(1, "Effective date is required"),
});
