import { z } from "zod";

export const seasonStatuses = ["upcoming", "active", "completed"] as const;

const optionalText = z
  .string()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : null));

export const seasonFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  year: z.coerce.number().int().min(1900).max(2200),
  start_date: optionalText,
  end_date: optionalText,
  status: z.enum(seasonStatuses).default("upcoming"),
  points_win: z.coerce.number().int().min(0).default(2),
  points_tie: z.coerce.number().int().min(0).default(1),
  points_loss: z.coerce.number().int().min(0).default(0),
});

export type SeasonFormValues = z.infer<typeof seasonFormSchema>;

export const divisionFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: optionalText,
});

export type DivisionFormValues = z.infer<typeof divisionFormSchema>;
