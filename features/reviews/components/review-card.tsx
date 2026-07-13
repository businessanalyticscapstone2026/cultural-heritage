"use client"

import { useState } from "react"
import { Flag } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { StarDisplay } from "./star-display"
import { ReviewReportDialog } from "./review-report-dialog"
import { formatDistanceToNow } from "@/lib/format-time"
import type { ReviewWithAuthor } from "@/types/review"

interface ReviewCardProps {
  review: ReviewWithAuthor
  currentUserId: string | null
  siteId: string
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const f = firstName?.[0] ?? ""
  const l = lastName?.[0] ?? ""
  return (f + l).toUpperCase() || "?"
}

function getDisplayName(firstName: string | null, lastName: string | null): string {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(" ") : "Anonymous"
}

export function ReviewCard({ review, currentUserId, siteId }: ReviewCardProps) {
  const [showReport, setShowReport] = useState(false)
  const { session } = useAuth()
  const router = useRouter()

  const isOwnReview = currentUserId === review.touristId
  const authorName = getDisplayName(review.authorFirstName, review.authorLastName)
  const initials = getInitials(review.authorFirstName, review.authorLastName)
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
                <p className="text-sm font-medium text-heading">{authorName}</p>
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
              className="shrink-0 p-1 text-muted-foreground/40 transition-colors hover:text-muted-foreground"
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
