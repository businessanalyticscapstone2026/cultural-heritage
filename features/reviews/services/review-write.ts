import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type { ReviewAggregate, ReviewWithAuthor } from "@/types/review"
import {
  ratingOnlyReviewSchema,
  reviewSubmissionSchema,
  toReviewFieldErrors,
  type ReviewMediaRef,
} from "../schemas/review"
import { checkReviewComment } from "./moderation"
import { getReviewAggregate, getReviewById } from "./index"
import {
  removeReviewMediaObjects,
  verifyReviewMediaObject,
  type VerifiedReviewMedia,
} from "./review-media"
import { ReviewWriteError } from "./review-errors"

/**
 * Review write path (CHT-135). Framework-agnostic: takes the caller's
 * RLS-scoped Supabase client and the authenticated user id, so it can be
 * called from a Server Action or a plain route handler. Throws
 * ReviewWriteError for expected failures.
 *
 * The multi-table write is atomic: it is a single call to the Postgres
 * function public.submit_review() (SECURITY INVOKER, so RLS applies).
 */

export interface SubmitReviewResult {
  review: ReviewWithAuthor
  aggregate: ReviewAggregate
}

interface SubmitReviewRpcResult {
  review_id: string
  removed_storage_paths: string[] | null
}

interface ExistingMediaRow {
  storage_path: string
  media_type: "image" | "video"
  file_url: string
  file_name: string
  file_size_bytes: number
  mime_type: string
}

async function assertTouristProfile(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("tourist_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle()

  if (error) throw new ReviewWriteError("write_failed", "Could not verify your account.", error.message)
  if (!data) throw new ReviewWriteError("no_tourist_profile", "Tourist profile not found")
}

/** Media rows currently attached to the caller's review for this site. */
async function getExistingMedia(
  supabase: SupabaseClient,
  userId: string,
  siteId: string
): Promise<Map<string, ExistingMediaRow>> {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "media:review_media(storage_path, media_type, file_url, file_name, file_size_bytes, mime_type)"
    )
    .eq("tourist_id", userId)
    .eq("site_id", siteId)
    .maybeSingle()

  if (error) throw new ReviewWriteError("write_failed", "Could not load your review.", error.message)

  const rows = ((data as { media?: ExistingMediaRow[] | null } | null)?.media ?? []) as ExistingMediaRow[]
  return new Map(rows.map((row) => [row.storage_path, row]))
}

/**
 * Kept media reuse the stored (already verified) metadata; new media are
 * re-verified against storage. Objects that fail verification are deleted
 * immediately (they can never be attached). Valid new uploads are left in
 * place on other failures so the user can retry; the client removes them if
 * the form is abandoned.
 */
async function resolveMedia(
  supabase: SupabaseClient,
  media: readonly ReviewMediaRef[],
  existing: Map<string, ExistingMediaRow>
): Promise<VerifiedReviewMedia[]> {
  const results = await Promise.allSettled(
    media.map(async (ref, index): Promise<VerifiedReviewMedia> => {
      const kept = existing.get(ref.storagePath)
      if (kept) return { ...kept, sort_order: index }
      return verifyReviewMediaObject(supabase, ref, index)
    })
  )

  const rejectedPaths: string[] = []
  let firstError: unknown = null
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      if (!existing.has(media[index].storagePath)) rejectedPaths.push(media[index].storagePath)
      firstError ??= result.reason
    }
  })

  if (firstError) {
    await removeReviewMediaObjects(supabase, rejectedPaths)
    throw firstError
  }

  return results.map((r) => (r as PromiseFulfilledResult<VerifiedReviewMedia>).value)
}

function toWriteError(error: PostgrestError): ReviewWriteError {
  if (error.code === "28000") {
    return new ReviewWriteError("unauthenticated", "Please sign in to write a review.", error.message)
  }
  if (error.code === "42501") {
    return new ReviewWriteError(
      "forbidden",
      "You are not allowed to save this review or attach one of these files.",
      error.message
    )
  }
  if (error.code === "23503") {
    return new ReviewWriteError("not_found", "This heritage site no longer exists.", error.message)
  }
  if (error.code === "22023" || error.code === "23514") {
    return new ReviewWriteError("validation", "Some review details are invalid.", error.message)
  }
  return new ReviewWriteError("write_failed", "Could not save your review. Please try again.", error.message)
}

async function callSubmitReview(
  supabase: SupabaseClient,
  params: {
    p_site_id: string
    p_criteria: Record<string, number>
    p_rating: number | null
    p_comment: string
    p_is_anonymous: boolean | null
    p_tags: string[] | null
    p_media: VerifiedReviewMedia[] | null
  }
): Promise<SubmitReviewRpcResult> {
  const { data, error } = await supabase.rpc("submit_review", params)
  if (error) throw toWriteError(error)
  const result = data as SubmitReviewRpcResult | null
  if (!result?.review_id) {
    throw new ReviewWriteError("write_failed", "Could not save your review. Please try again.")
  }
  return result
}

async function finishWrite(
  supabase: SupabaseClient,
  userId: string,
  siteId: string,
  result: SubmitReviewRpcResult
): Promise<SubmitReviewResult> {
  await removeReviewMediaObjects(supabase, result.removed_storage_paths ?? [])

  const [review, aggregate] = await Promise.all([
    getReviewById(supabase, result.review_id, userId),
    getReviewAggregate(supabase, siteId),
  ])
  if (!review) throw new ReviewWriteError("write_failed", "Your review was saved but could not be loaded.")
  return { review, aggregate }
}

/** Create or update the caller's rich review for a site (upsert per tourist+site). */
export async function submitRichReview(
  supabase: SupabaseClient,
  userId: string,
  rawInput: unknown
): Promise<SubmitReviewResult> {
  const parsed = reviewSubmissionSchema.safeParse(rawInput)
  if (!parsed.success) {
    throw new ReviewWriteError(
      "validation",
      "Please fix the highlighted fields and try again.",
      undefined,
      toReviewFieldErrors(parsed.error)
    )
  }
  const input = parsed.data
  const comment = input.comment.trim()

  const moderationError = checkReviewComment(comment)
  if (moderationError) {
    throw new ReviewWriteError("moderation", moderationError, undefined, { comment: [moderationError] })
  }

  await assertTouristProfile(supabase, userId)
  const existing = await getExistingMedia(supabase, userId, input.siteId)
  const media = await resolveMedia(supabase, input.media, existing)

  const result = await callSubmitReview(supabase, {
    p_site_id: input.siteId,
    p_criteria: input.criteria,
    p_rating: null,
    p_comment: comment,
    p_is_anonymous: input.isAnonymous,
    p_tags: input.tags,
    p_media: media,
  })

  return finishWrite(supabase, userId, input.siteId, result)
}

/**
 * Legacy single-rating write (public feedback form). Clears any criteria rows
 * (they would contradict the new rating); keeps tags, media and the anonymous
 * flag unchanged.
 */
export async function submitRatingOnlyReview(
  supabase: SupabaseClient,
  userId: string,
  rawInput: unknown
): Promise<SubmitReviewResult> {
  const parsed = ratingOnlyReviewSchema.safeParse(rawInput)
  if (!parsed.success) {
    throw new ReviewWriteError(
      "validation",
      parsed.error.issues[0]?.message ?? "Invalid review",
      undefined,
      toReviewFieldErrors(parsed.error)
    )
  }
  const comment = parsed.data.comment.trim()
  const moderationError = checkReviewComment(comment)
  if (moderationError) throw new ReviewWriteError("moderation", moderationError)

  await assertTouristProfile(supabase, userId)

  const result = await callSubmitReview(supabase, {
    p_site_id: parsed.data.siteId,
    p_criteria: {},
    p_rating: parsed.data.rating,
    p_comment: comment,
    p_is_anonymous: null,
    p_tags: null,
    p_media: null,
  })

  return finishWrite(supabase, userId, parsed.data.siteId, result)
}
