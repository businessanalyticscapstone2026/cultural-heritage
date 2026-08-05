import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(100).nullable().optional(),
  color: z
    .string()
    .max(7, "Color must be 7 characters or fewer (e.g., #6366f1)")
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex code (e.g., #6366f1)")
    .nullable()
    .optional(),
  displayOrder: z.number().int().min(0).nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
