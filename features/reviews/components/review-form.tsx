"use client"

import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { notifySuccess } from "@/lib/toast"
import { CriteriaRatingGroup } from "./criteria-rating-group"
import { ReviewTagPills } from "./review-tag-pills"
import { ReviewCommentField } from "./review-comment-field"
import { AnonymousReviewToggle } from "./anonymous-review-toggle"
import { ReviewMediaUploader } from "./review-media-uploader"
import { submitReviewAction, deleteReviewAction } from "../actions/review"
import { reviewSubmissionSchema, type ReviewFormValues } from "../schemas/review"
import { useReviewMediaUpload } from "../hooks/use-review-media-upload"
import { REVIEW_TAG_KEYS, type ReviewCriterionKey, type ReviewTagKey } from "../constants"
import { criteriaScoresFromReview, emptyCriteriaScores } from "../utils/review-criteria"
import type { ReviewWithAuthor, ReviewAggregate } from "@/types/review"

interface ReviewFormProps {
  siteId: string
  existingReview: ReviewWithAuthor | null
  onSubmit: (review: ReviewWithAuthor, aggregate: ReviewAggregate) => void
  onDelete: (aggregate: ReviewAggregate) => void
  /** Shown as a Cancel button when the parent controls edit mode. */
  onCancel?: () => void
}

function isKnownTag(tag: string): tag is ReviewTagKey {
  return (REVIEW_TAG_KEYS as readonly string[]).includes(tag)
}

function buildDefaults(siteId: string, review: ReviewWithAuthor | null): ReviewFormValues {
  return {
    siteId,
    criteria: review ? criteriaScoresFromReview(review.criteria) : emptyCriteriaScores(),
    tags: review ? review.tags.filter(isKnownTag) : [],
    comment: review?.comment ?? "",
    isAnonymous: review?.isAnonymous ?? false,
    media: [],
  }
}

export function ReviewForm({ siteId, existingReview, onSubmit, onDelete, onCancel }: ReviewFormProps) {
  const [showForm, setShowForm] = useState(!existingReview)
  const [formError, setFormError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const media = useReviewMediaUpload(existingReview?.media ?? [])

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSubmissionSchema),
    defaultValues: buildDefaults(siteId, existingReview),
  })

  const isEditing = !!existingReview
  const isLegacyReview = isEditing && existingReview.criteria.length === 0
  const commentLength = (useWatch({ control, name: "comment" }) ?? "").length
  const busy = isSubmitting || isDeleting

  const onValid = async (values: ReviewFormValues) => {
    setFormError(null)
    const result = await submitReviewAction(values)
    if (!result.ok) {
      setFormError(result.error)
      for (const [path, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (path !== "_form") setError(path as keyof ReviewFormValues, { message: messages[0] })
      }
      return
    }
    media.markAllAttached()
    notifySuccess(isEditing ? "Your review was updated." : "Thanks for sharing your experience!")
    onSubmit(result.data.review, result.data.aggregate)
    setShowForm(false)
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    setFormError(null)
    if (media.isUploading) {
      event.preventDefault()
      setFormError("Please wait for your uploads to finish.")
      return
    }
    if (media.hasFailedUploads) {
      event.preventDefault()
      setFormError("Some files failed to upload. Retry or remove them before submitting.")
      return
    }
    setValue("media", media.mediaRefs)
    return handleSubmit(onValid, () => setFormError("Please fix the highlighted fields."))(event)
  }

  const handleDelete = async () => {
    if (!existingReview) return
    setIsDeleting(true)
    setFormError(null)
    try {
      const aggregate = await deleteReviewAction(existingReview.id, siteId)
      onDelete(aggregate)
      reset(buildDefaults(siteId, null))
      setShowForm(false)
    } catch {
      setFormError("Failed to delete review. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!showForm && !isEditing) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="w-full rounded-xl border border-dashed border-border bg-card p-4 text-left text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Share your experience with this site...
      </button>
    )
  }

  const criteriaErrors = Object.fromEntries(
    Object.entries(errors.criteria ?? {}).map(([key, err]) => [
      key,
      (err as { message?: string } | undefined)?.message,
    ])
  ) as Partial<Record<ReviewCriterionKey, string>>

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-busy={busy}
      className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading text-sm font-semibold text-heading">
          {isEditing ? "Edit your review" : "Write a review"}
        </h3>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="rounded text-xs text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete review"}
          </button>
        )}
      </div>

      {isLegacyReview && (
        <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Your earlier review had a single {existingReview.rating}-star rating. Please rate each
          criterion below to update it.
        </p>
      )}

      <Controller
        name="criteria"
        control={control}
        render={({ field }) => (
          <CriteriaRatingGroup
            value={field.value}
            onChange={(key, score) => field.onChange({ ...field.value, [key]: score })}
            errors={criteriaErrors}
          />
        )}
      />

      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <ReviewTagPills value={field.value} onChange={field.onChange} error={errors.tags?.message} />
        )}
      />

      <ReviewCommentField
        id="review-comment"
        length={commentLength}
        error={errors.comment?.message}
        {...register("comment")}
      />

      <ReviewMediaUploader
        items={media.items}
        rejections={media.rejections}
        error={errors.media?.message}
        onAddFiles={media.addFiles}
        onRetry={media.retry}
        onRemove={media.remove}
      />

      <Controller
        name="isAnonymous"
        control={control}
        render={({ field }) => (
          <AnonymousReviewToggle checked={field.value} onCheckedChange={field.onChange} />
        )}
      />

      {formError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {formError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={busy || media.isUploading}>
          {isSubmitting ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-3.5" aria-hidden="true" />
          )}
          {isSubmitting ? "Saving..." : isEditing ? "Update Review" : "Submit Review"}
        </Button>
      </div>
    </form>
  )
}
