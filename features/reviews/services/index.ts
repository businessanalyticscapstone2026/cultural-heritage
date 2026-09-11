import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type {
  ReviewWithAuthor,
  ReviewAggregate,
  ReviewListResponse,
  ReviewSortOption,
  ReviewFormData,
} from "@/types/review"
import { REVIEWS_PER_PAGE, REPORT_FLAG_THRESHOLD } from "../constants"

function mapDbReview(row: Record<string, unknown>): ReviewWithAuthor {
  const profile = row.tourist as Record<string, unknown> | null
  const firstName = (profile?.first_name as string) ?? null
  const lastName = (profile?.last_name as string) ?? null

  return {
    id: row.id as string,
    touristId: row.tourist_id as string,
    siteId: row.site_id as string,
    rating: row.rating as number,
    comment: (row.comment ?? null) as string | null,
    status: (row.status as string) as ReviewWithAuthor["status"],
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at ?? row.created_at) as string,
    authorFirstName: firstName,
    authorLastName: lastName,
  }
}

export async function getReviewsBySiteId(
  siteId: string,
  options?: {
    sort?: ReviewSortOption
    limit?: number
    offset?: number
  }
): Promise<ReviewListResponse> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const sort = options?.sort ?? "recent"
  const limit = options?.limit ?? REVIEWS_PER_PAGE
  const offset = options?.offset ?? 0

  const orderColumn = sort === "recent" ? "created_at" : "rating"
  const ascending = sort === "lowest"

  // Fetch published reviews with author profile
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      tourist:tourist_profiles(first_name, last_name)
    `)
    .eq("site_id", siteId)
    .eq("status", "published")
    .order(orderColumn, { ascending })
    .range(offset, offset + limit - 1)

  if (error) throw error

  const reviews = (data ?? []).map(mapDbReview)

  // Read aggregate from denormalized columns on heritage_sites
  const { data: siteRow } = await supabase
    .from("heritage_sites")
    .select("average_rating, review_count")
    .eq("id", siteId)
    .maybeSingle()

  const aggregate: ReviewAggregate = {
    averageRating: (siteRow?.average_rating as number) ?? 0,
    reviewCount: (siteRow?.review_count as number) ?? 0,
  }

  return { aggregate, reviews }
}

export async function getUserReviewForSite(
  touristId: string,
  siteId: string
): Promise<ReviewWithAuthor | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      tourist:tourist_profiles(first_name, last_name)
    `)
    .eq("tourist_id", touristId)
    .eq("site_id", siteId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return mapDbReview(data)
}

export async function createReview(
  touristId: string,
  siteId: string,
  data: ReviewFormData
): Promise<{ review: ReviewWithAuthor; aggregate: ReviewAggregate }> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Upsert: if unique constraint hit, update existing review
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("tourist_id", touristId)
    .eq("site_id", siteId)
    .maybeSingle()

  let reviewRow: Record<string, unknown> | null = null

  if (existing) {
    const { data: updated, error } = await supabase
      .from("reviews")
      .update({
        rating: data.rating,
        comment: data.comment || null,
        status: "published",
      })
      .eq("id", existing.id)
      .select(`
        *,
        tourist:tourist_profiles(first_name, last_name)
      `)
      .maybeSingle()

    if (error) throw error
    reviewRow = updated
  } else {
    const { data: inserted, error } = await supabase
      .from("reviews")
      .insert({
        tourist_id: touristId,
        site_id: siteId,
        rating: data.rating,
        comment: data.comment || null,
        status: "published",
      })
      .select(`
        *,
        tourist:tourist_profiles(first_name, last_name)
      `)
      .maybeSingle()

    if (error) throw error
    reviewRow = inserted
  }

  // Read updated aggregate
  const { data: siteRow } = await supabase
    .from("heritage_sites")
    .select("average_rating, review_count")
    .eq("id", siteId)
    .maybeSingle()

  return {
    review: mapDbReview(reviewRow!),
    aggregate: {
      averageRating: (siteRow?.average_rating as number) ?? 0,
      reviewCount: (siteRow?.review_count as number) ?? 0,
    },
  }
}

export async function deleteReview(
  touristId: string,
  reviewId: string,
  siteId: string
): Promise<ReviewAggregate> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Verify ownership before soft-deleting
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

  // Read updated aggregate
  const { data: siteRow } = await supabase
    .from("heritage_sites")
    .select("average_rating, review_count")
    .eq("id", siteId)
    .maybeSingle()

  return {
    averageRating: (siteRow?.average_rating as number) ?? 0,
    reviewCount: (siteRow?.review_count as number) ?? 0,
  }
}

export async function reportReview(
  touristId: string,
  reviewId: string,
  reason: string
): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Insert report
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

export interface PublishedReviewItem {
  id: string
  touristId: string
  siteId: string
  siteName: string
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
  authorFirstName: string | null
  authorLastName: string | null
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

function unwrapJoin<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

/** Global newest-first feed of published reviews across all sites. */
export async function getPublishedReviews(
  page: number,
  pageSize: number
): Promise<PublishedReviewsResult> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const offset = page * pageSize
  const { data, error, count } = await supabase
    .from("reviews")
    .select(
      `
      id, tourist_id, site_id, rating, comment, created_at, updated_at,
      tourist:tourist_profiles(first_name, last_name),
      site:heritage_sites(site_name)
    `,
      { count: "exact" }
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  const items = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>
    const tourist = unwrapJoin(
      r.tourist as { first_name: string | null; last_name: string | null } | null
    )
    const site = unwrapJoin(r.site as { site_name: string } | null)
    return {
      id: r.id as string,
      touristId: r.tourist_id as string,
      siteId: r.site_id as string,
      siteName: site?.site_name ?? "Unknown site",
      rating: r.rating as number,
      comment: (r.comment ?? null) as string | null,
      createdAt: r.created_at as string,
      updatedAt: (r.updated_at ?? r.created_at) as string,
      authorFirstName: tourist?.first_name ?? null,
      authorLastName: tourist?.last_name ?? null,
    }
  })

  return { items, total: count ?? 0, page, pageSize }
}

/** Aggregate stats for the Tourist Reviews page header. */
export async function getReviewsPageStats(): Promise<ReviewsPageStats> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

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
