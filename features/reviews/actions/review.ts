"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type { ReviewSortOption, ReviewListResponse } from "@/types/review"
import {
  getReviewsBySiteId,
  getUserReviewForSite,
  createReview,
  deleteReview,
  reportReview,
  getPublishedReviews,
  getReviewsPageStats,
} from "../services"
import { BLOCKED_WORDS, MAX_COMMENT_LENGTH } from "../constants"

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase()
  return BLOCKED_WORDS.some((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return new RegExp(`\\b${escaped}\\b`, "i").test(lower)
  })
}

export async function getReviewsAction(
  siteId: string,
  sort?: ReviewSortOption,
  page?: number
): Promise<ReviewListResponse> {
  const limit = 10
  const offset = (page ?? 0) * limit
  return getReviewsBySiteId(siteId, { sort, limit, offset })
}

export async function getPublishedReviewsAction(page: number) {
  return getPublishedReviews(page, 9)
}

export async function getReviewsPageStatsAction() {
  return getReviewsPageStats()
}

export async function getUserReviewAction(siteId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get tourist profile ID from auth user
  const { data: profile } = await supabase
    .from("tourist_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) return null

  return getUserReviewForSite(profile.id, siteId)
}

export async function submitReviewAction(
  siteId: string,
  rating: number,
  comment?: string
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Validate rating
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw new Error("Rating must be an integer between 1 and 5")
  }

  // Validate comment length
  if (comment && comment.length > MAX_COMMENT_LENGTH) {
    throw new Error(`Comment must be ${MAX_COMMENT_LENGTH} characters or less`)
  }

  // Profanity check
  if (comment && containsProfanity(comment)) {
    throw new Error("Your review contains language that is not allowed. Please revise and try again.")
  }

  // Get tourist profile ID
  const { data: profile } = await supabase
    .from("tourist_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) throw new Error("Tourist profile not found")

  return createReview(profile.id, siteId, { rating, comment: comment ?? "" })
}

export async function deleteReviewAction(reviewId: string, siteId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Get tourist profile ID
  const { data: profile } = await supabase
    .from("tourist_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) throw new Error("Tourist profile not found")

  return deleteReview(profile.id, reviewId, siteId)
}

export async function reportReviewAction(reviewId: string, reason: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  if (!reason || reason.trim().length === 0) {
    throw new Error("A reason is required to report a review")
  }

  // Get tourist profile ID
  const { data: profile } = await supabase
    .from("tourist_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) throw new Error("Tourist profile not found")

  return reportReview(profile.id, reviewId, reason.trim())
}
