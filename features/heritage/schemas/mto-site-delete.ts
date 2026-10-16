import { z } from "zod"

/**
 * Validates a batch permanent-delete payload: an array of site UUIDs, at least
 * one, at most 50, and free of duplicates. Validation runs server-side so the
 * batch action can trust the shape regardless of client checks.
 */
export const deleteMtoSitesSchema = z
  .array(z.string().uuid("Invalid site id"))
  .min(1, { message: "Select at least one site to delete" })
  .max(50, { message: "Cannot delete more than 50 sites at once" })
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "Duplicate site ids are not allowed",
  })

export type DeleteMtoSitesInput = z.infer<typeof deleteMtoSitesSchema>
