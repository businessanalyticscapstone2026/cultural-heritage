"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import type { ReviewSortOption, ReviewListResponse, ReviewAggregate } from "@/types/review"
import {
  getReviewsBySiteId,
  getUserReviewForSite,
  deleteReview,
  reportReview,
  getPublishedReviews,
  getReviewsPageStats,
} from "../services"
import {
  submitRichReview,
  submitRatingOnlyReview,
  type SubmitReviewResult,
} from "../services/review-write"
import { createReviewMediaUpload, removeUnattachedReviewMedia } from "../services/review-media"
import { isReviewWriteError } from "../services/review-errors"
import { revalidateReviewCaches } from "../services/review-cache"
import type { ReviewActionResult, ReviewMediaUploadTicket } from "../types"

/**
 * Thin Server Action wrappers. Validation and the write path live in
 * features/reviews/{schemas,services} so route handlers can reuse them.
 * Write actions return a result object instead of throwing, because Next.js
 * hides thrown error messages from the client in production.
 */

async function getSessionContext() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, userId: user?.id ?? null }
}

function toActionError<T>(err: unknown, fallback: string): ReviewActionResult<T> {
  if (isReviewWriteError(err)) {
    if (err.detail) console.error(`[reviews] ${err.code}: ${err.detail}`)
    return { ok: false, error: err.message, fieldErrors: err.fieldErrors }
  }
  console.error("[reviews] unexpected error:", err)
  return { ok: false, error: fallback }
}

export async function getReviewsAction(
  siteId: string,
  sort?: ReviewSortOption,
  page?: number
): Promise<ReviewListResponse> {
  const { supabase, userId } = await getSessionContext()
  const limit = 10
  const offset = (page ?? 0) * limit
  return getReviewsBySiteId(supabase, siteId, userId, { sort, limit, offset })
}

export async function getPublishedReviewsAction(page: number) {
  const { supabase, userId } = await getSessionContext()
  return getPublishedReviews(supabase, userId, page, 9)
}

export async function getReviewsPageStatsAction() {
  const { supabase } = await getSessionContext()
  return getReviewsPageStats(supabase)
}

export async function getUserReviewAction(siteId: string) {
  const { supabase, userId } = await getSessionContext()
  if (!userId) return null
  return getUserReviewForSite(supabase, userId, siteId)
}

/** Create or update the caller's rich review (criteria, tags, media, anonymity). */
export async function submitReviewAction(
  input: unknown
): Promise<ReviewActionResult<SubmitReviewResult>> {
  const { supabase, userId } = await getSessionContext()
  if (!userId) return { ok: false, error: "Please sign in to write a review." }

  try {
    const data = await submitRichReview(supabase, userId, input)
    revalidateReviewCaches()
    return { ok: true, data }
  } catch (err) {
    return toActionError(err, "Could not save your review. Please try again.")
  }
}

/** Legacy single-rating submit used by the public feedback form. */
export async function submitRatingOnlyReviewAction(
  input: unknown
): Promise<ReviewActionResult<SubmitReviewResult>> {
  const { supabase, userId } = await getSessionContext()
  if (!userId) return { ok: false, error: "Please sign in to send feedback." }

  try {
    const data = await submitRatingOnlyReview(supabase, userId, input)
    revalidateReviewCaches()
    return { ok: true, data }
  } catch (err) {
    return toActionError(err, "Could not submit your feedback. Please try again.")
  }
}

/** Signed upload URL for one review photo/video (direct browser-to-storage upload). */
export async function createReviewMediaUploadAction(
  input: unknown
): Promise<ReviewActionResult<ReviewMediaUploadTicket>> {
  const { supabase, userId } = await getSessionContext()
  if (!userId) return { ok: false, error: "Please sign in to upload files." }

  try {
    return { ok: true, data: await createReviewMediaUpload(supabase, input) }
  } catch (err) {
    return toActionError(err, "Could not prepare the upload. Please try again.")
  }
}

/** Delete uploads the user removed or abandoned before they were attached. */
export async function discardReviewMediaUploadsAction(
  storagePaths: string[]
): Promise<ReviewActionResult<null>> {
  const { supabase, userId } = await getSessionContext()
  if (!userId) return { ok: false, error: "Please sign in." }
  if (!Array.isArray(storagePaths) || storagePaths.some((p) => typeof p !== "string")) {
    return { ok: false, error: "Invalid request" }
  }

  try {
    await removeUnattachedReviewMedia(supabase, storagePaths.slice(0, 10))
    return { ok: true, data: null }
  } catch (err) {
    return toActionError(err, "Could not remove the file.")
  }
}

export async function deleteReviewAction(
  reviewId: string,
  siteId: string
): Promise<ReviewAggregate> {
  const { supabase, userId } = await getSessionContext()
  if (!userId) throw new Error("Unauthorized")

  const aggregate = await deleteReview(supabase, userId, reviewId, siteId)
  revalidateReviewCaches()
  return aggregate
}

export async function reportReviewAction(reviewId: string, reason: string) {
  const { supabase, userId } = await getSessionContext()
  if (!userId) throw new Error("Unauthorized")

  if (!reason || reason.trim().length === 0) {
    throw new Error("A reason is required to report a review")
  }

  const { data: profile } = await supabase
    .from("tourist_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle()

  if (!profile) throw new Error("Tourist profile not found")

  await reportReview(supabase, profile.id, reviewId, reason.trim())
  revalidateReviewCaches()
}
