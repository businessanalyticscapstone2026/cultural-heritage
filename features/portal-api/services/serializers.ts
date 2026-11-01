import type { ReviewWithAuthor } from "@/types/review"
import { getReviewAuthorName } from "@/features/reviews/utils/review-author"
import type { PortalHeritageSite, PortalReview } from "../types"

/**
 * Explicit-field serializers for the public portal payloads. Review input is
 * already anonymity-safe (features/reviews/services/review-mappers.ts strips
 * tourist ids and anonymous authors' names); this layer additionally drops
 * moderation status, the viewer-specific isOwn flag, storage paths and the
 * uploader's original file names.
 */

/** Column list for portal site reads (never select("*")). */
export const PORTAL_SITE_COLUMNS = `
  id, site_name, alternative_name, barangay, exact_address, short_description,
  detailed_description, historical_period, year_established, historical_significance,
  cultural_significance, latitude, longitude, accessibility_info, operating_hours,
  entrance_fee, designation, is_featured, average_rating, review_count, created_at, updated_at,
  category:heritage_categories(name),
  municipality:municipalities(name),
  media:heritage_site_media(media_type, file_url, caption, is_primary, sort_order)
`

type Joined<T> = T | T[] | null | undefined

export interface PortalSiteRow {
  id: string
  site_name: string
  alternative_name: string | null
  barangay: string | null
  exact_address: string | null
  short_description: string | null
  detailed_description: string | null
  historical_period: string | null
  year_established: string | null
  historical_significance: string | null
  cultural_significance: string | null
  latitude: number | string | null
  longitude: number | string | null
  accessibility_info: string | null
  operating_hours: string | null
  entrance_fee: string | null
  designation: string | null
  is_featured: boolean | null
  average_rating: number | string | null
  review_count: number | null
  created_at: string
  updated_at: string
  category?: Joined<{ name: string | null }>
  municipality?: Joined<{ name: string | null }>
  media?:
    | {
        media_type: string
        file_url: string
        caption: string | null
        is_primary: boolean | null
        sort_order: number | null
      }[]
    | null
}

function unwrap<T>(value: Joined<T>): T | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function toNumberOrNull(value: number | string | null): number | null {
  if (value == null || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function serializeHeritageSite(row: PortalSiteRow, municipalityName: string): PortalHeritageSite {
  const images = (row.media ?? [])
    .filter((m) => m.media_type === "image")
    .sort((a, b) => Number(b.is_primary === true) - Number(a.is_primary === true) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((m) => ({ url: m.file_url, caption: m.caption ?? null, isPrimary: m.is_primary === true }))

  return {
    id: row.id,
    name: row.site_name,
    alternativeName: row.alternative_name ?? null,
    municipality: unwrap(row.municipality)?.name ?? municipalityName,
    category: unwrap(row.category)?.name ?? null,
    barangay: row.barangay ?? null,
    address: row.exact_address ?? null,
    shortDescription: row.short_description ?? null,
    detailedDescription: row.detailed_description ?? null,
    historicalPeriod: row.historical_period ?? null,
    yearEstablished: row.year_established ?? null,
    historicalSignificance: row.historical_significance ?? null,
    culturalSignificance: row.cultural_significance ?? null,
    latitude: toNumberOrNull(row.latitude),
    longitude: toNumberOrNull(row.longitude),
    accessibilityInfo: row.accessibility_info ?? null,
    operatingHours: row.operating_hours ?? null,
    entranceFee: row.entrance_fee ?? null,
    designation: row.designation ?? null,
    isFeatured: row.is_featured === true,
    averageRating: toNumberOrNull(row.average_rating) ?? 0,
    reviewCount: Number(row.review_count ?? 0),
    images,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function serializeReview(review: ReviewWithAuthor): PortalReview {
  return {
    id: review.id,
    siteId: review.siteId,
    rating: review.rating,
    comment: review.comment,
    isAnonymous: review.isAnonymous,
    // getReviewAuthorName returns the anonymous label for anonymous reviews.
    authorName: getReviewAuthorName(review),
    criteria: review.criteria.map((c) => ({ key: c.key, score: c.score })),
    tags: [...review.tags],
    media: review.media.map((m) => ({ mediaType: m.mediaType, url: m.fileUrl, sortOrder: m.sortOrder })),
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  }
}
