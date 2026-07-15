"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { RatingSummary } from "./rating-summary"
import { ReviewForm } from "./review-form"
import { ReviewsList } from "./reviews-list"
import { EmptyReviews } from "./empty-reviews"
import { getReviewsAction, getUserReviewAction } from "../actions/review"
import type {
  ReviewWithAuthor,
  ReviewAggregate,
  ReviewSortOption,
} from "@/types/review"

interface ReviewsSectionProps {
  siteId: string
}

export function ReviewsSection({ siteId }: ReviewsSectionProps) {
  const { session } = useAuth()
  const [reviews, setReviews] = useState<ReviewWithAuthor[] | null>(null)
  const [aggregate, setAggregate] = useState<ReviewAggregate>({
    averageRating: 0,
    reviewCount: 0,
  })
  const [userReview, setUserReview] = useState<ReviewWithAuthor | null>(null)
  const [sort, setSort] = useState<ReviewSortOption>("recent")

  const isLoading = reviews === null

  useEffect(() => {
    let cancelled = false

    const reviewsPromise = getReviewsAction(siteId, sort)
    const userReviewPromise = session ? getUserReviewAction(siteId) : Promise.resolve(null)

    Promise.all([reviewsPromise, userReviewPromise])
      .then(([data, userData]) => {
        if (!cancelled) {
          setReviews(data.reviews)
          setAggregate(data.aggregate)
          setUserReview(userData)
        }
      })
      .catch(() => {
        if (!cancelled) setReviews([])
      })

    return () => {
      cancelled = true
    }
  }, [siteId, sort, session])

  const handleSortChange = (newSort: ReviewSortOption) => {
    setSort(newSort)
  }

  const handleSubmitReview = (review: ReviewWithAuthor, newAggregate: ReviewAggregate) => {
    setUserReview(review)
    setAggregate(newAggregate)
    setReviews((prev) => {
      if (!prev) return [review]
      const exists = prev.findIndex((r) => r.id === review.id)
      if (exists >= 0) {
        const updated = [...prev]
        updated[exists] = review
        return updated
      }
      return [review, ...prev]
    })
  }

  const handleDeleteReview = (newAggregate: ReviewAggregate) => {
    setUserReview(null)
    setAggregate(newAggregate)
    setReviews((prev) => {
      if (!prev) return prev
      return prev.filter((r) => r.touristId !== userReview?.touristId)
    })
  }

  // Compute distribution for the summary
  const distribution = [0, 0, 0, 0, 0]
  ;(reviews ?? []).forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating - 1]++
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-semibold text-heading">
          What Visitors Say
        </h2>
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  const displayReviews = reviews ?? []

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-semibold text-heading">
        What Visitors Say
      </h2>

      {aggregate.reviewCount > 0 ? (
        <RatingSummary aggregate={aggregate} distribution={distribution} />
      ) : (
        <EmptyReviews />
      )}

      <ReviewForm
        siteId={siteId}
        existingReview={userReview}
        onSubmit={handleSubmitReview}
        onDelete={handleDeleteReview}
      />

      {displayReviews.length > 0 && (
        <ReviewsList
          siteId={siteId}
          initialReviews={displayReviews}
          totalCount={aggregate.reviewCount}
          currentUserId={session?.user?.id ?? null}
          onSortChange={handleSortChange}
          currentSort={sort}
        />
      )}
    </div>
  )
}
