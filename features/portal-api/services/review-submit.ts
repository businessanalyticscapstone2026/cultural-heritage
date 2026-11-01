import { reviewSubmissionSchema, toReviewFieldErrors } from "@/features/reviews/schemas/review"
import { submitRichReview } from "@/features/reviews/services/review-write"
import { revalidateReviewCaches } from "@/features/reviews/services/review-cache"
import type { PortalReview } from "../types"
import type { PortalAuthContext } from "./auth"
import { PortalApiError } from "./portal-errors"
import { serializeReview } from "./serializers"
import { getTaalSiteIds } from "./taal-data"

export interface PortalReviewWriteResult {
  review: PortalReview
  created: boolean
}

/**
 * Create or update the caller's review of a Taal site from the portal.
 * Same Zod schema and the same atomic write path (submit_review RPC via
 * submitRichReview) as the main site; nothing about the write is
 * re-implemented here. Media must be objects the caller already uploaded to
 * the review-media bucket through the main platform (ownership is verified by
 * the write path and by storage/table RLS).
 */
export async function submitPortalReview(
  auth: PortalAuthContext,
  body: unknown
): Promise<PortalReviewWriteResult> {
  const parsed = reviewSubmissionSchema.safeParse(body)
  if (!parsed.success) {
    throw new PortalApiError(422, "validation_failed", "Review is invalid.", {
      details: toReviewFieldErrors(parsed.error),
    })
  }

  const taalSiteIds = await getTaalSiteIds()
  if (!taalSiteIds.includes(parsed.data.siteId)) {
    throw new PortalApiError(404, "not_found", "Heritage site not found in this municipality.")
  }

  const result = await submitRichReview(auth.supabase, auth.userId, parsed.data)
  revalidateReviewCaches()

  return { review: serializeReview(result.review), created: result.created }
}
