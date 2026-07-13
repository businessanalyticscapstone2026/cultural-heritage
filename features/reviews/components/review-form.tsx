"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { StarRating } from "./star-rating"
import { submitReviewAction, deleteReviewAction } from "../actions/review"
import { MAX_COMMENT_LENGTH } from "../constants"
import type { ReviewWithAuthor, ReviewAggregate } from "@/types/review"

interface ReviewFormProps {
  siteId: string
  existingReview: ReviewWithAuthor | null
  onSubmit: (review: ReviewWithAuthor, aggregate: ReviewAggregate) => void
  onDelete: (aggregate: ReviewAggregate) => void
}

export function ReviewForm({
  siteId,
  existingReview,
  onSubmit,
  onDelete,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [comment, setComment] = useState(existingReview?.comment ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(!existingReview)

  const isEditing = !!existingReview
  const isExpanded = showForm || isEditing

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rating < 1 || rating > 5) {
      setError("Please select a rating before submitting.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitReviewAction(siteId, rating, comment)
      onSubmit(result.review, result.aggregate)
      setShowForm(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingReview) return
    setIsSubmitting(true)
    try {
      const aggregate = await deleteReviewAction(existingReview.id, siteId)
      onDelete(aggregate)
      setRating(0)
      setComment("")
      setShowForm(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete review. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full rounded-xl border border-dashed border-border bg-card p-4 text-left text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-heading"
      >
        Share your experience with this site...
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold text-heading">
          {isEditing ? "Edit your review" : "Write a review"}
        </h3>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            Delete review
          </button>
        )}
      </div>

      <div>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {error && rating < 1 && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>

      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think? (optional)"
          maxLength={MAX_COMMENT_LENGTH}
          rows={3}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-heading placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {comment.length}/{MAX_COMMENT_LENGTH}
          </span>
        </div>
      </div>

      {error && rating >= 1 && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || rating < 1}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {isEditing ? "Update Review" : "Submit Review"}
        </button>
      </div>
    </form>
  )
}
