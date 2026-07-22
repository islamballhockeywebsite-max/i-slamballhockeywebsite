import { z } from "zod";

export const announcementFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  body: z.string().trim().min(1, "Body is required"),
  is_pinned: z.enum(["true", "false"]).transform((v) => v === "true").default(false),
});

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
