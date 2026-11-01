"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { ReviewCard } from "./review-card"
import { SortControl } from "./sort-control"
import type { ReviewWithAuthor, ReviewSortOption } from "@/types/review"
import { REVIEWS_PER_PAGE } from "../constants"

interface ReviewsListProps {
  siteId: string
  initialReviews: ReviewWithAuthor[]
  totalCount: number
  onSortChange: (sort: ReviewSortOption) => void
  currentSort: ReviewSortOption
}

export function ReviewsList({
  siteId,
  initialReviews,
  totalCount,
  onSortChange,
  currentSort,
}: ReviewsListProps) {
  const [visibleCount, setVisibleCount] = useState(initialReviews.length)

  const visibleReviews = initialReviews.slice(0, visibleCount)
  const hasMore = visibleCount < initialReviews.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount} {totalCount === 1 ? "review" : "reviews"}
        </p>
        <SortControl value={currentSort} onChange={onSortChange} />
      </div>

      {visibleReviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No reviews yet. Be the first to share your experience!
        </p>
      ) : (
        <div className="space-y-3">
          {visibleReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              siteId={siteId}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() =>
              setVisibleCount((prev) => prev + REVIEWS_PER_PAGE)
            }
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-heading"
          >
            Load more
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
