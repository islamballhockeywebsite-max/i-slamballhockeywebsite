import { z } from "zod";

export const sponsorFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  link_url: z
    .union([z.url("Invalid URL"), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  display_order: z.coerce.number().int().default(0),
  is_active: z.enum(["true", "false"]).transform((v) => v === "true").default(true),
});

export type SponsorFormValues = z.infer<typeof sponsorFormSchema>;
