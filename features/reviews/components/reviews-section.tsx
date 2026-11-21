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
    setReviews((prev) => {
      const currentList = prev ?? []
      const existsIndex = currentList.findIndex((r) => r.id === review.id)
      let nextList: ReviewWithAuthor[]
      if (existsIndex >= 0) {
        nextList = [...currentList]
        nextList[existsIndex] = review
      } else {
        nextList = [review, ...currentList]
      }
      const updatedCount = Math.max(newAggregate.reviewCount, nextList.length)
      const updatedAvg =
        newAggregate.reviewCount >= nextList.length && newAggregate.averageRating > 0
          ? newAggregate.averageRating
          : Math.round(
              (nextList.reduce((sum, r) => sum + (r.rating || 0), 0) / nextList.length) * 10
            ) / 10
      setAggregate({
        averageRating: updatedAvg,
        reviewCount: updatedCount,
      })
      return nextList
    })
  }

  const handleDeleteReview = (newAggregate: ReviewAggregate) => {
    setUserReview(null)
    setReviews((prev) => {
      if (!prev) {
        setAggregate(newAggregate)
        return prev
      }
      const nextList = prev.filter((r) => !r.isOwn)
      const updatedCount = Math.max(newAggregate.reviewCount, nextList.length)
      const updatedAvg =
        nextList.length > 0
          ? Math.round(
              (nextList.reduce((sum, r) => sum + (r.rating || 0), 0) / nextList.length) * 10
            ) / 10
          : newAggregate.averageRating
      setAggregate({
        averageRating: updatedAvg,
        reviewCount: updatedCount,
      })
      return nextList
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

  // Ensure review count and average rating are always synchronized with actual rendered reviews
  const effectiveReviewCount = Math.max(aggregate.reviewCount, displayReviews.length)
  const effectiveAverageRating =
    aggregate.reviewCount >= displayReviews.length && aggregate.averageRating > 0
      ? aggregate.averageRating
      : displayReviews.length > 0
        ? Math.round(
            (displayReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / displayReviews.length) * 10
          ) / 10
        : aggregate.averageRating

  const effectiveAggregate: ReviewAggregate = {
    averageRating: effectiveAverageRating,
    reviewCount: effectiveReviewCount,
  }

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-semibold text-heading">
        What Visitors Say
      </h2>

      {effectiveAggregate.reviewCount > 0 ? (
        <RatingSummary aggregate={effectiveAggregate} distribution={distribution} />
      ) : (
        <EmptyReviews />
      )}

      <ReviewForm
        key={userReview?.id ?? "new"}
        siteId={siteId}
        existingReview={userReview}
        onSubmit={handleSubmitReview}
        onDelete={handleDeleteReview}
      />

      {displayReviews.length > 0 && (
        <ReviewsList
          siteId={siteId}
          initialReviews={displayReviews}
          totalCount={effectiveAggregate.reviewCount}
          onSortChange={handleSortChange}
          currentSort={sort}
        />
      )}
    </div>
  )
}
