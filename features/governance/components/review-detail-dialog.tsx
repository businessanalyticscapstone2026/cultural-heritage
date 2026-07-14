"use client"

import { useState } from "react"
import { X, Clock, CheckCircle, XCircle, Archive, Loader2 } from "lucide-react"
import type { GovernanceReviewWithSite } from "@/types/heritage"

interface ReviewDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  review: GovernanceReviewWithSite | null
  onApprove: (reviewId: string, comment?: string) => Promise<void>
  onReject: (reviewId: string, comment: string) => Promise<void>
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ReviewDetailDialog({
  open,
  onOpenChange,
  review,
  onApprove,
  onReject,
}: ReviewDetailDialogProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open || !review) return null

  const snapshot = review.snapshot as Record<string, unknown>
  const siteName = (snapshot.site_name as string) ?? review.siteName
  const shortDesc = (snapshot.short_description as string) ?? null
  const detailedDesc = (snapshot.detailed_description as string) ?? null
  const historicalPeriod = (snapshot.historical_period as string) ?? null
  const yearEstablished = (snapshot.year_established as string) ?? null
  const entranceFee = (snapshot.entrance_fee as string) ?? null
  const designation = (snapshot.designation as string) ?? null

  const handleClose = () => {
    onOpenChange(false)
    setAction(null)
    setComment("")
    setError(null)
  }

  const handleSubmit = async () => {
    if (!action) return
    if (action === "reject" && !comment.trim()) {
      setError("Comment is required for rejection")
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (action === "approve") {
        await onApprove(review.id, comment.trim() || undefined)
      } else {
        await onReject(review.id, comment.trim())
      }
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-50 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-background shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Review Submission</h2>
            <p className="text-sm text-muted-foreground">{siteName}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Review Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Municipality</p>
              <p className="font-medium">{review.municipalityName ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{review.categoryName ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Submitted By</p>
              <p className="font-medium">{review.submittedByName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Submitted At</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="size-3.5" />
                {formatDate(review.submittedAt)}
                {review.status === "submitted" && review.daysPending > 0 && (
                  <span className="text-xs text-yellow-600">({review.daysPending} days pending)</span>
                )}
              </p>
            </div>
            {review.reviewedByName && (
              <>
                <div>
                  <p className="text-muted-foreground">Reviewed By</p>
                  <p className="font-medium">{review.reviewedByName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reviewed At</p>
                  <p className="font-medium">{formatDate(review.reviewedAt!)}</p>
                </div>
              </>
            )}
          </div>

          {/* Previous Reviewer Comment (if rejected before) */}
          {review.status === "submitted" && review.reviewerComment && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-medium text-yellow-800">Previous Reviewer Comment</p>
              <p className="mt-1 text-sm text-yellow-700">{review.reviewerComment}</p>
            </div>
          )}

          {/* Snapshot Content */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Submitted Content</h3>

            {shortDesc && (
              <div>
                <p className="text-sm font-medium">Short Description</p>
                <p className="mt-1 text-sm text-muted-foreground">{shortDesc}</p>
              </div>
            )}

            {detailedDesc && (
              <div>
                <p className="text-sm font-medium">Detailed Description</p>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{detailedDesc}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {historicalPeriod && (
                <div>
                  <p className="text-sm font-medium">Historical Period</p>
                  <p className="mt-1 text-sm text-muted-foreground">{historicalPeriod}</p>
                </div>
              )}
              {yearEstablished && (
                <div>
                  <p className="text-sm font-medium">Year Established</p>
                  <p className="mt-1 text-sm text-muted-foreground">{yearEstablished}</p>
                </div>
              )}
              {entranceFee && (
                <div>
                  <p className="text-sm font-medium">Entrance Fee</p>
                  <p className="mt-1 text-sm text-muted-foreground">{entranceFee}</p>
                </div>
              )}
              {designation && (
                <div>
                  <p className="text-sm font-medium">Designation</p>
                  <p className="mt-1 text-sm text-muted-foreground">{designation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons or Action Form */}
          {review.status === "submitted" && !action && (
            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setAction("reject")}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
              >
                <XCircle className="size-4" />
                Reject
              </button>
              <button
                type="button"
                onClick={() => setAction("approve")}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                <CheckCircle className="size-4" />
                Approve
              </button>
            </div>
          )}

          {/* Action Form */}
          {action && review.status === "submitted" && (
            <div className="space-y-4 border-t pt-4">
              <div className={`flex items-center gap-2 rounded-lg p-3 ${
                action === "approve"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}>
                {action === "approve" ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
                <span className="text-sm font-medium">
                  {action === "approve" ? "Approve this submission" : "Reject this submission"}
                </span>
              </div>

              <div>
                <label htmlFor="review-comment" className="block text-sm font-medium">
                  Comment {action === "reject" ? "(required)" : "(optional)"}
                </label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => { setComment(e.target.value); setError(null) }}
                  placeholder={action === "approve" ? "Any notes for the MTO staff..." : "Explain why this submission was rejected..."}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setAction(null); setComment(""); setError(null) }}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || (action === "reject" && !comment.trim())}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                    action === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : action === "approve" ? (
                    <CheckCircle className="size-4" />
                  ) : (
                    <XCircle className="size-4" />
                  )}
                  {action === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          )}

          {/* Status badges for non-submitted reviews */}
          {review.status !== "submitted" && (
            <div className="border-t pt-4">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                review.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : review.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-600"
              }`}>
                {review.status === "approved" && <CheckCircle className="size-4" />}
                {review.status === "rejected" && <XCircle className="size-4" />}
                {review.status === "archived" && <Archive className="size-4" />}
                <span className="capitalize">{review.status}</span>
              </div>
              {review.reviewerComment && (
                <div className="mt-3 rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium">Reviewer Comment</p>
                  <p className="mt-1 text-sm text-muted-foreground">{review.reviewerComment}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
