import { z } from "zod"

export const mtoHeritageSiteSchema = z.object({
  siteName: z.string().min(1, "Site name is required").max(255),
  alternativeName: z.string().max(255).nullable().optional(),
  categoryId: z.string().uuid("Invalid category").nullable().optional(),
  barangay: z.string().max(255).nullable().optional(),
  exactAddress: z.string().max(500).nullable().optional(),
  shortDescription: z.string().max(500).nullable().optional(),
  detailedDescription: z.string().nullable().optional(),
  historicalPeriod: z.string().max(255).nullable().optional(),
  yearEstablished: z.string().max(50).nullable().optional(),
  architectBuilder: z.string().max(255).nullable().optional(),
  architecturalStyle: z.string().max(255).nullable().optional(),
  designation: z.string().max(255).nullable().optional(),
  historicalSignificance: z.string().nullable().optional(),
  culturalSignificance: z.string().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  elevation: z.number().nullable().optional(),
  geoAccuracy: z.string().max(100).nullable().optional(),
  publicationStatus: z.enum(["draft", "published", "archived"]),
  isFeatured: z.boolean().optional(),
})

export type MtoHeritageSiteFormValues = z.infer<typeof mtoHeritageSiteSchema>
