import { z } from "zod"

/** Native `<select>` inputs and number inputs left blank emit `""` (or `NaN` once coerced); treat both as "not provided" instead of a validation failure. */
const emptyToNull = (val: unknown) =>
  val === "" || (typeof val === "number" && Number.isNaN(val)) ? null : val

export const heritageSiteSchema = z.object({
  siteName: z.string().min(1, "Site name is required").max(255),
  alternativeName: z.string().max(255).nullable().optional(),
  categoryId: z.preprocess(
    emptyToNull,
    z.string().uuid("Invalid category").nullable(),
  ),
  municipalityId: z
    .preprocess(emptyToNull, z.string().uuid("Please select a municipality").nullable())
    .refine((val) => val !== null, { message: "Please select a municipality" }),
  barangay: z.string().max(255).nullable().optional(),
  exactAddress: z.string().max(500).nullable().optional(),
  shortDescription: z.string().max(500).nullable().optional(),
  detailedDescription: z.string().nullable().optional(),
  historicalPeriod: z.string().max(255).nullable().optional(),
  yearEstablished: z.string().max(50).nullable().optional(),
  architectBuilder: z.string().max(255).nullable().optional(),
  architecturalStyle: z.string().max(255).nullable().optional(),
  historicalSignificance: z.string().nullable().optional(),
  culturalSignificance: z.string().nullable().optional(),
  latitude: z.preprocess(emptyToNull, z.number().min(-90).max(90).nullable()),
  longitude: z.preprocess(emptyToNull, z.number().min(-180).max(180).nullable()),
  elevation: z.preprocess(emptyToNull, z.number().nullable()),
  geoAccuracy: z.string().max(100).nullable().optional(),
  accessibilityInfo: z.string().nullable().optional(),
  operatingHours: z.string().max(255).nullable().optional(),
  entranceFee: z.string().max(255).nullable().optional(),
  designation: z.string().max(255).nullable().optional(),
  publicationStatus: z.enum(["draft", "published", "archived"]).optional(),
  isFeatured: z.boolean().optional(),
  visibility: z.enum(["public", "private"]).optional(),
})

export type HeritageSiteFormValues = z.infer<typeof heritageSiteSchema>

export const heritageSiteBasicInfoSchema = z.object({
  siteName: z.string().min(1, "Site name is required").max(255),
  alternativeName: z.string().max(255).nullable().optional(),
  categoryId: z.preprocess(
    emptyToNull,
    z.string().uuid("Invalid category").nullable(),
  ),
  municipalityId: z
    .preprocess(emptyToNull, z.string().uuid("Please select a municipality").nullable())
    .refine((val) => val !== null, { message: "Please select a municipality" }),
  barangay: z.string().max(255).nullable().optional(),
  exactAddress: z.string().max(500).nullable().optional(),
  shortDescription: z.string().max(500).nullable().optional(),
})

export type BasicInfoFormValues = z.infer<typeof heritageSiteBasicInfoSchema>

export const heritageSiteHistoricalSchema = z.object({
  detailedDescription: z.string().nullable().optional(),
  historicalPeriod: z.string().max(255).nullable().optional(),
  yearEstablished: z.string().max(50).nullable().optional(),
  architectBuilder: z.string().max(255).nullable().optional(),
  architecturalStyle: z.string().max(255).nullable().optional(),
  historicalSignificance: z.string().nullable().optional(),
  culturalSignificance: z.string().nullable().optional(),
  designation: z.string().max(255).nullable().optional(),
})

export type HistoricalFormValues = z.infer<typeof heritageSiteHistoricalSchema>

export const heritageSiteLocationSchema = z.object({
  latitude: z.preprocess(emptyToNull, z.number().min(-90).max(90).nullable()),
  longitude: z.preprocess(emptyToNull, z.number().min(-180).max(180).nullable()),
  elevation: z.preprocess(emptyToNull, z.number().nullable()),
  geoAccuracy: z.string().max(100).nullable().optional(),
  accessibilityInfo: z.string().nullable().optional(),
  operatingHours: z.string().max(255).nullable().optional(),
  entranceFee: z.string().max(255).nullable().optional(),
})

export type LocationFormValues = z.infer<typeof heritageSiteLocationSchema>

export const heritageSiteReviewSchema = z.object({
  publicationStatus: z.enum(["draft", "published", "archived"]),
  isFeatured: z.boolean(),
  visibility: z.enum(["public", "private"]),
})

export type ReviewFormValues = z.infer<typeof heritageSiteReviewSchema>
