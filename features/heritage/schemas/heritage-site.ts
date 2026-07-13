import { z } from "zod"

export const heritageSiteSchema = z.object({
  siteName: z.string().min(1, "Site name is required").max(255),
  alternativeName: z.string().max(255).nullable().optional(),
  categoryId: z.string().uuid("Invalid category").nullable().optional(),
  municipalityId: z.string().uuid("Invalid municipality").nullable().optional(),
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
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  elevation: z.number().nullable().optional(),
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
  categoryId: z.string().uuid("Invalid category").nullable().optional(),
  municipalityId: z.string().uuid("Invalid municipality").nullable().optional(),
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
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  elevation: z.number().nullable().optional(),
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
