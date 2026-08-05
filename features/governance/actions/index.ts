"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { CACHE_TAGS, CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"
import {
  submitForReview,
  getGovernanceQueue,
  getGovernanceReviewById,
  approveSubmission,
  rejectSubmission,
  archiveRecord,
  getGovernanceHistory,
  getGovernanceStats,
} from "../services"
import { revokeQrCodesForSite } from "@/features/qr-code/services/qr-management"

export async function submitForReviewAction(heritageSiteId: string, heritageSiteVersionId: string) {
  const review = await submitForReview(heritageSiteId, heritageSiteVersionId)
  revalidatePath("/admin/data-governance")
  revalidatePath("/mto/heritage-sites")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })
  return review
}

export async function getGovernanceQueueAction(options?: {
  municipalityId?: string
  status?: string
}) {
  return getGovernanceQueue(options)
}

export async function getGovernanceReviewByIdAction(reviewId: string) {
  return getGovernanceReviewById(reviewId)
}

export async function approveSubmissionAction(reviewId: string, comment?: string) {
  const review = await approveSubmission(reviewId, comment)
  revalidatePath("/admin/data-governance")
  revalidatePath("/admin/heritage-repository")
  revalidatePath("/mto/heritage-sites")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })
  return review
}

export async function rejectSubmissionAction(reviewId: string, comment: string) {
  const review = await rejectSubmission(reviewId, comment)
  revalidatePath("/admin/data-governance")
  revalidatePath("/mto/heritage-sites")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })
  return review
}

export async function archiveRecordAction(heritageSiteId: string, comment: string) {
  const review = await archiveRecord(heritageSiteId, comment)
  await revokeQrCodesForSite(heritageSiteId)
  revalidatePath("/admin/data-governance")
  revalidatePath("/admin/heritage-repository")
  revalidatePath("/mto/heritage-sites")
  revalidatePath("/mto/qr-codes")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })
  return review
}

export async function getGovernanceHistoryAction(heritageSiteId: string) {
  return getGovernanceHistory(heritageSiteId)
}

export async function getGovernanceStatsAction() {
  return getGovernanceStats()
}
