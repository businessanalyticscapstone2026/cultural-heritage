"use client"

import { useCallback, useState } from "react"
import { Inbox, Database } from "lucide-react"
import { createBackupAction, getBackupsListAction } from "../actions/backup"
import {
  getGovernanceQueueAction,
  approveSubmissionAction,
  rejectSubmissionAction,
  getGovernanceReviewByIdAction,
} from "@/features/governance/actions"
import { useBackups } from "../hooks"
import { useGovernanceQueue } from "@/features/governance/hooks"
import BackupPanel from "./backup-panel"
import GovernanceQueueTable from "@/features/governance/components/governance-queue-table"
import ReviewDetailDialog from "@/features/governance/components/review-detail-dialog"
import type { HeritageBackup, GovernanceReviewWithSite } from "../types"

interface AdminGovernanceClientProps {
  initialBackups: HeritageBackup[]
  initialReviews: GovernanceReviewWithSite[]
  municipalities: { id: string; name: string }[]
}

export default function AdminGovernanceClient({
  initialBackups,
  initialReviews,
  municipalities,
}: AdminGovernanceClientProps) {
  const [activeTab, setActiveTab] = useState<"queue" | "backups">("queue")

  const fetchBackups = useCallback(async () => {
    return getBackupsListAction()
  }, [])

  const fetchQueue = useCallback(async () => {
    return getGovernanceQueueAction()
  }, [])

  const { backups, refetch: refetchBackups } = useBackups(fetchBackups)
  const { reviews, refetch: refetchQueue } = useGovernanceQueue(fetchQueue)
  const displayBackups = backups.length > 0 ? backups : initialBackups
  const displayReviews = reviews.length > 0 ? reviews : initialReviews

  const [selectedReview, setSelectedReview] = useState<GovernanceReviewWithSite | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleCreateBackup = useCallback(async () => {
    await createBackupAction()
    refetchBackups()
  }, [refetchBackups])

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
    refetchQueue()
  }, [refetchQueue])

  const handleReject = useCallback(async (reviewId: string, comment: string) => {
    await rejectSubmissionAction(reviewId, comment)
    setDetailOpen(false)
    setSelectedReview(null)
    refetchQueue()
  }, [refetchQueue])

  return (
    <>
      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "queue"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Inbox className="size-4" />
          Review Queue
          {displayReviews.filter((r) => r.status === "submitted").length > 0 && (
            <span className="ml-1 rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800">
              {displayReviews.filter((r) => r.status === "submitted").length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("backups")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "backups"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Database className="size-4" />
          Backups
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "queue" ? (
        <GovernanceQueueTable
          reviews={displayReviews}
          municipalities={municipalities}
          onViewReview={handleViewReview}
        />
      ) : (
        <BackupPanel
          backups={displayBackups}
          onCreateBackup={handleCreateBackup}
        />
      )}

      {/* Review Detail Dialog */}
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
