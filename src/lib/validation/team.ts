import { z } from "zod";

const optionalText = z
  .string()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

export const teamFormSchema = z.object({
  season_id: z.uuid("Season is required"),
  division_id: z.uuid("Division is required"),
  name: z.string().trim().min(1, "Name is required"),
  primary_color: optionalText,
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;
