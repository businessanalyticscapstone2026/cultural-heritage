import type { ReviewMediaKind } from "@/types/review"

/** Pagination block returned with every list response. */
export interface PortalPageMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
  updatedSince: string | null
}

export interface PortalListResponse<T> {
  data: T[]
  meta: PortalPageMeta
}

export interface PortalErrorBody {
  error: string
  code: PortalErrorCode
  /** Field-level messages, only on 422 validation failures. */
  details?: Record<string, string[]>
}

export type PortalErrorCode =
  | "bad_request"
  | "invalid_json"
  | "unauthenticated"
  | "forbidden"
  | "origin_not_allowed"
  | "no_tourist_profile"
  | "not_found"
  | "payload_too_large"
  | "unsupported_media_type"
  | "validation_failed"
  | "moderation_rejected"
  | "invalid_media"
  | "rate_limited"
  | "maintenance"
  | "dependency_unavailable"
  | "internal_error"

export interface PortalHeritageSiteImage {
  url: string
  caption: string | null
  isPrimary: boolean
}

/** Public heritage-site payload. Explicit fields only; no internal columns. */
export interface PortalHeritageSite {
  id: string
  name: string
  alternativeName: string | null
  municipality: string
  category: string | null
  barangay: string | null
  address: string | null
  shortDescription: string | null
  detailedDescription: string | null
  historicalPeriod: string | null
  yearEstablished: string | null
  historicalSignificance: string | null
  culturalSignificance: string | null
  latitude: number | null
  longitude: number | null
  accessibilityInfo: string | null
  operatingHours: string | null
  entranceFee: string | null
  designation: string | null
  isFeatured: boolean
  averageRating: number
  reviewCount: number
  images: PortalHeritageSiteImage[]
  createdAt: string
  updatedAt: string
}

export interface PortalReviewMedia {
  mediaType: ReviewMediaKind
  url: string
  sortOrder: number
}

/**
 * Public review payload. Never contains a user id, email, moderation status,
 * the uploader's original file names, or (for anonymous reviews) a name.
 */
export interface PortalReview {
  id: string
  siteId: string
  rating: number
  comment: string | null
  isAnonymous: boolean
  authorName: string
  criteria: { key: string; score: number }[]
  tags: string[]
  media: PortalReviewMedia[]
  createdAt: string
  updatedAt: string
}
