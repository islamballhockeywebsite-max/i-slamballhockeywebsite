import { z } from "zod";

export const playerPositions = ["forward", "defense", "goalie"] as const;
export const playerStatuses = ["active", "inactive"] as const;

const optionalText = z
  .string()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

export const playerFormSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  date_of_birth: optionalText,
  email: z
    .union([z.email("Invalid email"), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  phone: optionalText,
  default_position: z
    .union([z.enum(playerPositions), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  emergency_contact_name: optionalText,
  emergency_contact_phone: optionalText,
  status: z.enum(playerStatuses).default("active"),
});

export type PlayerFormValues = z.infer<typeof playerFormSchema>;
