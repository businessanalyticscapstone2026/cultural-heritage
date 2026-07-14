"use client"

import { useCallback, useState } from "react"
import {
  getGovernanceQueueAction,
  approveSubmissionAction,
  rejectSubmissionAction,
  getGovernanceReviewByIdAction,
} from "../actions"
import GovernanceQueueTable from "./governance-queue-table"
import ReviewDetailDialog from "./review-detail-dialog"
import { useGovernanceQueue } from "../hooks"
import type { GovernanceReviewWithSite } from "@/types/heritage"

interface GovernanceClientProps {
  initialReviews: GovernanceReviewWithSite[]
  municipalities: { id: string; name: string }[]
}

export default function GovernanceClient({
  initialReviews,
  municipalities,
}: GovernanceClientProps) {
  const fetchQueue = useCallback(async () => {
    return getGovernanceQueueAction()
  }, [])

  const { reviews, refetch } = useGovernanceQueue(fetchQueue)
  const displayReviews = reviews.length > 0 ? reviews : initialReviews

  const [selectedReview, setSelectedReview] = useState<GovernanceReviewWithSite | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleViewReview = useCallback(async (review: GovernanceReviewWithSite) => {
    const fullReview = await getGovernanceReviewByIdAction(review.id)
    if (fullReview) {
      setSelectedReview(fullReview)
      setDetailOpen(true)
    }
  }, [])

  const handleApprove = useCallback(async (reviewId: string, comment?: string) => {
    await approveSubmissionAction(reviewId, comment)
    setDetailOpen(false)
    setSelectedReview(null)
    refetch()
  }, [refetch])

  const handleReject = useCallback(async (reviewId: string, comment: string) => {
    await rejectSubmissionAction(reviewId, comment)
    setDetailOpen(false)
    setSelectedReview(null)
    refetch()
  }, [refetch])

  return (
    <>
      <GovernanceQueueTable
        reviews={displayReviews}
        municipalities={municipalities}
        onViewReview={handleViewReview}
      />

      <ReviewDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        review={selectedReview}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  )
}
