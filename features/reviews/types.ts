export type {
  Review,
  ReviewWithAuthor,
  ReviewAggregate,
  ReviewReport,
  ReviewListResponse,
  ReviewSortOption,
  ReviewStatus,
  ReviewMedia,
  ReviewMediaKind,
  ReviewCriterionScore,
} from "@/types/review"

export type {
  ReviewSubmissionInput,
  ReviewFormValues,
  ReviewMediaRef,
  RatingOnlyReviewInput,
  ReviewMediaUploadRequest,
} from "./schemas/review"

/** Field-level validation messages keyed by form path (e.g. "criteria.safety"). */
export type ReviewFieldErrors = Record<string, string[]>

export type ReviewActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: ReviewFieldErrors }

export interface ReviewMediaUploadTicket {
  storagePath: string
  signedUrl: string
  publicUrl: string
}
