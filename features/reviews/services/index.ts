import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  ReviewWithAuthor,
  ReviewAggregate,
  ReviewListResponse,
  ReviewSortOption,
} from "@/types/review"
import { REVIEWS_PER_PAGE, REPORT_FLAG_THRESHOLD } from "../constants"
import {
  REVIEW_COLUMNS,
  PUBLISHED_FEED_COLUMNS,
  mapReviewRow,
  mapPublishedFeedRow,
  type ReviewRow,
  type PublishedFeedRow,
  type PublishedReviewItem,
} from "./review-mappers"

/**
 * Review reads and simple mutations. Every function takes the caller's
 * Supabase client (RLS applies) so it can be reused from Server Actions and
 * plain route handlers. Reads are anonymity-safe: see review-mappers.ts.
 */

export type { PublishedReviewItem } from "./review-mappers"

export async function getReviewAggregate(
  supabase: SupabaseClient,
  siteId: string
): Promise<ReviewAggregate> {
  const { data: siteRow, error } = await supabase
    .from("heritage_sites")
    .select("average_rating, review_count")
    .eq("id", siteId)
    .maybeSingle()

  if (error) throw error

  return {
    averageRating: Number(siteRow?.average_rating ?? 0),
    reviewCount: Number(siteRow?.review_count ?? 0),
  }
}

export async function getReviewsBySiteId(
  supabase: SupabaseClient,
  siteId: string,
  viewerId: string | null,
  options?: {
    sort?: ReviewSortOption
    limit?: number
    offset?: number
  }
): Promise<ReviewListResponse> {
  const sort = options?.sort ?? "recent"
  const limit = options?.limit ?? REVIEWS_PER_PAGE
  const offset = options?.offset ?? 0

  const orderColumn = sort === "recent" ? "created_at" : "rating"
  const ascending = sort === "lowest"

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .eq("site_id", siteId)
    .eq("status", "published")
    .order(orderColumn, { ascending })
    .range(offset, offset + limit - 1)

  if (error) throw error

  const reviews = ((data ?? []) as unknown as ReviewRow[]).map((row) => mapReviewRow(row, viewerId))
  const aggregate = await getReviewAggregate(supabase, siteId)

  return { aggregate, reviews }
}

/** The caller's own review for a site (any status), for preloading the edit form. */
export async function getUserReviewForSite(
  supabase: SupabaseClient,
  userId: string,
  siteId: string
): Promise<ReviewWithAuthor | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .eq("tourist_id", userId)
    .eq("site_id", siteId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return mapReviewRow(data as unknown as ReviewRow, userId)
}

export async function getReviewById(
  supabase: SupabaseClient,
  reviewId: string,
  viewerId: string | null
): Promise<ReviewWithAuthor | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .eq("id", reviewId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return mapReviewRow(data as unknown as ReviewRow, viewerId)
}

/** Soft-delete (status "hidden"); media rows stay for moderation history. */
export async function deleteReview(
  supabase: SupabaseClient,
  touristId: string,
  reviewId: string,
  siteId: string
): Promise<ReviewAggregate> {
  const { data: existing, error: fetchError } = await supabase
    .from("reviews")
    .select("id, tourist_id")
    .eq("id", reviewId)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!existing || existing.tourist_id !== touristId) {
    throw new Error("Not authorized to delete this review")
  }

  const { error } = await supabase
    .from("reviews")
    .update({ status: "hidden" })
    .eq("id", reviewId)

  if (error) throw error

  return getReviewAggregate(supabase, siteId)
}

export async function reportReview(
  supabase: SupabaseClient,
  touristId: string,
  reviewId: string,
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from("review_reports")
    .insert({
      review_id: reviewId,
      reported_by: touristId,
      reason,
    })

  if (error) throw error

  // Auto-flag if threshold reached
  const { count } = await supabase
    .from("review_reports")
    .select("id", { count: "exact", head: true })
    .eq("review_id", reviewId)

  if ((count ?? 0) >= REPORT_FLAG_THRESHOLD) {
    await supabase
      .from("reviews")
      .update({ status: "flagged" })
      .eq("id", reviewId)
      .eq("status", "published")
  }
}

export interface PublishedReviewsResult {
  items: PublishedReviewItem[]
  total: number
  page: number
  pageSize: number
}

export interface ReviewsPageStats {
  averageRating: number
  explorerCount: number
  reviewCount: number
}

/** Global newest-first feed of published reviews across all sites. */
export async function getPublishedReviews(
  supabase: SupabaseClient,
  viewerId: string | null,
  page: number,
  pageSize: number
): Promise<PublishedReviewsResult> {
  const offset = page * pageSize
  const { data, error, count } = await supabase
    .from("reviews")
    .select(PUBLISHED_FEED_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  const items = ((data ?? []) as unknown as PublishedFeedRow[]).map((row) =>
    mapPublishedFeedRow(row, viewerId)
  )

  return { items, total: count ?? 0, page, pageSize }
}

/** Aggregate stats for the Tourist Reviews page header (server-side only). */
export async function getReviewsPageStats(supabase: SupabaseClient): Promise<ReviewsPageStats> {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating, tourist_id")
    .eq("status", "published")

  if (error) throw error

  const rows = (data ?? []) as { rating: number; tourist_id: string }[]
  const reviewCount = rows.length
  const averageRating =
    reviewCount === 0
      ? 0
      : Math.round((rows.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviewCount) * 10) / 10
  const explorerCount = new Set(rows.map((r) => r.tourist_id)).size

  return { averageRating, explorerCount, reviewCount }
}
