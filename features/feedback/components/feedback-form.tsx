"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Send, CheckCircle2 } from "lucide-react"
import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import { submitRatingOnlyReviewAction } from "@/features/reviews/actions/review"
import { StarRating } from "@/features/reviews/components/star-rating"
import { MAX_COMMENT_LENGTH } from "@/features/reviews/constants"

const FEEDBACK_CATEGORIES = ["suggestion", "issue", "compliment", "question"] as const

type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]

const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  suggestion: "Suggestion",
  issue: "Report an issue",
  compliment: "Compliment",
  question: "Question",
}

const feedbackSchema = z.object({
  siteId: z.string().min(1, "Please choose a heritage site"),
  rating: z.number().min(1, "Please select a rating").max(5),
  category: z.enum(FEEDBACK_CATEGORIES, "Please choose a feedback category"),
  message: z
    .string()
    .trim()
    .min(1, "Please enter your feedback")
    .max(MAX_COMMENT_LENGTH, `Feedback must be ${MAX_COMMENT_LENGTH} characters or less`),
})

type FeedbackFormValues = z.infer<typeof feedbackSchema>

export function FeedbackForm({ sites }: { sites: { id: string; name: string }[] }) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { siteId: "", rating: 0, category: "suggestion", message: "" },
  })

  const messageLength = (watch("message") ?? "").length

  const onSave = async (data: FeedbackFormValues) => {
    try {
      const comment = `[${FEEDBACK_CATEGORY_LABELS[data.category]}] ${data.message.trim()}`
      const result = await submitRatingOnlyReviewAction({
        siteId: data.siteId,
        rating: data.rating,
        comment,
      })
      if (!result.ok) {
        notifyError(result.error)
        return
      }
      setSubmitted(true)
      notifySuccess("Thank you — your feedback was received.")
    } catch (err) {
      notifyError(errorReason(err, "Failed to submit feedback. Please try again."))
    }
  }

  const handleSubmitAnother = () => {
    reset({ siteId: "", rating: 0, category: "suggestion", message: "" })
    setSubmitted(false)
  }

  if (sites.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No published heritage sites are available right now. Please check back later.
        </p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h2 className="mt-3 font-heading text-lg font-semibold text-heading">
          Feedback received
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Thank you for sharing your thoughts. Your feedback helps improve heritage tourism
          across Batangas.
        </p>
        <button
          type="button"
          onClick={handleSubmitAnother}
          className="mt-5 rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Submit another
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSave, () =>
        notifyError("Please fix the highlighted fields and try again.")
      )}
      className="space-y-4 rounded-xl border border-border bg-card p-5"
      noValidate
    >
      <div>
        <label htmlFor="feedback-site" className="mb-1 block text-xs font-medium text-muted-foreground">
          Heritage Site *
        </label>
        <select
          id="feedback-site"
          {...register("siteId")}
          defaultValue=""
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="" disabled>
            Select a heritage site
          </option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {errors.siteId && <p className="mt-1 text-xs text-destructive">{errors.siteId.message}</p>}
      </div>

      <div>
        <span id="feedback-rating-label" className="mb-1 block text-xs font-medium text-muted-foreground">
          Rating *
        </span>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <StarRating value={field.value} onChange={field.onChange} size="lg" />
          )}
        />
        {errors.rating && <p className="mt-1 text-xs text-destructive">{errors.rating.message}</p>}
      </div>

      <div>
        <label htmlFor="feedback-category" className="mb-1 block text-xs font-medium text-muted-foreground">
          Category *
        </label>
        <select
          id="feedback-category"
          {...register("category")}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-heading outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:max-w-xs"
        >
          {FEEDBACK_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {FEEDBACK_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
      </div>

      <div>
        <label htmlFor="feedback-message" className="mb-1 block text-xs font-medium text-muted-foreground">
          Your Feedback *
        </label>
        <textarea
          id="feedback-message"
          {...register("message")}
          placeholder="Share your experience, suggestion, or concern..."
          maxLength={MAX_COMMENT_LENGTH}
          rows={5}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-heading placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {messageLength}/{MAX_COMMENT_LENGTH}
          </span>
          {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </form>
  )
}
