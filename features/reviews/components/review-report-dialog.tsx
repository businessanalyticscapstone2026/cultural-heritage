"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { reportReviewAction } from "../actions/review"

interface ReviewReportDialogProps {
  reviewId: string
  onClose: () => void
}

const reasons = [
  "Spam or advertising",
  "Inappropriate content",
  "Offensive language",
  "False information",
  "Other",
]

export function ReviewReportDialog({
  reviewId,
  onClose,
}: ReviewReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [customReason, setCustomReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const reason = selectedReason === "Other" ? customReason.trim() : selectedReason
    if (!reason) {
      setError("Please select or enter a reason.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await reportReviewAction(reviewId, reason)
      setSubmitted(true)
      setTimeout(onClose, 2000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit report. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
          <p className="text-center text-sm font-medium text-heading">
            Thank you for your report. We will review it shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold text-heading">
            Report this review
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground transition-colors hover:text-heading"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {reasons.map((reason) => (
            <button
              key={reason}
              onClick={() => setSelectedReason(reason)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                selectedReason === reason
                  ? "border-primary bg-primary/5 text-heading"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {reason}
            </button>
          ))}
        </div>

        {selectedReason === "Other" && (
          <div className="mt-3">
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please describe the issue..."
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-heading placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-heading"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  )
}
