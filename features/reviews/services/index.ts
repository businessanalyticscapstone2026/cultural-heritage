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
