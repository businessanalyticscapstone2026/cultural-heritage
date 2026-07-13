export type ReviewStatus = "published" | "flagged" | "hidden"

export interface Review {
  id: string
  touristId: string
  siteId: string
  rating: number
  comment: string | null
  status: ReviewStatus
  createdAt: string
  updatedAt: string
}

export interface ReviewWithAuthor extends Review {
  authorFirstName: string | null
  authorLastName: string | null
}

export interface ReviewAggregate {
  averageRating: number
  reviewCount: number
}

export interface ReviewFormData {
  rating: number
  comment: string
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
