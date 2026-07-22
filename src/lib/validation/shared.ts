import { z } from "zod";

export function flattenZodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Wraps a number schema for optional numeric form fields. z.coerce.number() alone treats
 * an empty string as 0 (Number("") === 0), so a blank input would silently save as 0
 * instead of null — preprocessing "" (and null/undefined) to undefined first avoids that.
 */
export function optionalNumberFromForm<T extends z.ZodTypeAny>(schema: T) {
  return z
    .preprocess((v) => (v === "" || v === undefined || v === null ? undefined : v), schema.optional())
    .transform((v) => v ?? null);
}
