"use client"

import { useState } from "react"
import { Flag } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { StarDisplay } from "./star-display"
import { ReviewReportDialog } from "./review-report-dialog"
import { formatDistanceToNow } from "@/lib/format-time"
import type { ReviewWithAuthor } from "@/types/review"
import { ReviewCriteriaBreakdown } from "./review-criteria-breakdown"
import { ReviewMediaGallery } from "./review-media-gallery"
import { getReviewAuthorInitials, getReviewAuthorName } from "../utils/review-author"

interface ReviewCardProps {
  review: ReviewWithAuthor
  siteId: string
}

export function ReviewCard({ review, siteId }: ReviewCardProps) {
  const [showReport, setShowReport] = useState(false)
  const { session } = useAuth()
  const router = useRouter()

  const isOwnReview = review.isOwn
  const authorName = getReviewAuthorName(review)
  const initials = getReviewAuthorInitials(review)
  const date = new Date(review.createdAt)

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-heading">
                  {authorName}
                  {isOwnReview && review.isAnonymous && (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you, posted anonymously)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(date)}
                </p>
              </div>
              <StarDisplay rating={review.rating} size="sm" />
            </div>

            {review.comment && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {review.comment}
              </p>
            )}

            <ReviewCriteriaBreakdown criteria={review.criteria} tags={review.tags} />
            <ReviewMediaGallery media={review.media} authorLabel={authorName} />
          </div>

          {!isOwnReview && (
            <button
              onClick={() => {
                if (!session) {
                  router.push(`/login?redirect=/heritage/${siteId}`)
                  return
                }
                setShowReport(true)
              }}
              className="shrink-0 p-1 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
              aria-label="Report this review"
            >
              <Flag className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {showReport && (
        <ReviewReportDialog
          reviewId={review.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  )
}
