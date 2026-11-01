export type ReviewStatus = "published" | "flagged" | "hidden"

export type ReviewMediaKind = "image" | "video"

export interface ReviewMedia {
  id: string
  mediaType: ReviewMediaKind
  fileUrl: string
  /** Random "<uuid>/<uuid>.<ext>" object name; never contains the author id. */
  storagePath: string
  fileName: string
  fileSizeBytes: number
  mimeType: string
  sortOrder: number
}

export interface ReviewCriterionScore {
  key: string
  score: number
}

/**
 * Browser-safe review shape. Never carries the author's user id: ownership is
 * exposed only as the server-computed `isOwn` flag, and author names are null
 * when `isAnonymous` is true.
 */
export interface Review {
  id: string
  siteId: string
  rating: number
  comment: string | null
  status: ReviewStatus
  isAnonymous: boolean
  isOwn: boolean
  createdAt: string
  updatedAt: string
}

export interface ReviewWithAuthor extends Review {
  authorFirstName: string | null
  authorLastName: string | null
  criteria: ReviewCriterionScore[]
  tags: string[]
  media: ReviewMedia[]
}

export interface ReviewAggregate {
  averageRating: number
  reviewCount: number
}

export interface ReviewReport {
  id: string
  reviewId: string
  reportedBy: string
  reason: string
  createdAt: string
}

export interface ReviewListResponse {
  aggregate: ReviewAggregate
  reviews: ReviewWithAuthor[]
}

export type ReviewSortOption = "recent" | "highest" | "lowest"
