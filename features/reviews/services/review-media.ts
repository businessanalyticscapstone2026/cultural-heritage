import type { SupabaseClient } from "@supabase/supabase-js"
import { REVIEW_MEDIA_BUCKET, REVIEW_MEDIA_LIMITS, REVIEW_MEDIA_PATH_PATTERN } from "../constants"
import {
  reviewMediaUploadRequestSchema,
  type ReviewMediaRef,
} from "../schemas/review"
import {
  getExtensionForMime,
  getMediaTypeForMime,
  isSniffedMimeCompatible,
  sniffMediaMime,
} from "../utils/review-media-validation"
import type { ReviewMediaUploadTicket } from "../types"
import { ReviewWriteError } from "./review-errors"

/**
 * Review media storage (bucket "review-media"). Uses the signed-upload-URL
 * pattern from features/media/services, but authorization is "any signed-in
 * tourist" via the caller's own client (storage RLS: owner-only insert) rather
 * than the staff-only verifyMtoOwnership check.
 */

/** Bytes fetched from the start of an object to sniff its real type. */
const SNIFF_BYTE_COUNT = 32

export interface VerifiedReviewMedia {
  storage_path: string
  media_type: "image" | "video"
  file_url: string
  file_name: string
  file_size_bytes: number
  mime_type: string
  sort_order: number
}

/** Random object name; deliberately contains no user identifier. */
export function buildReviewMediaPath(mimeType: string): string {
  const ext = getExtensionForMime(mimeType)
  if (!ext) throw new ReviewWriteError("invalid_media", "Unsupported file type")
  return `${crypto.randomUUID()}/${crypto.randomUUID()}.${ext}`
}

export function getReviewMediaPublicUrl(supabase: SupabaseClient, storagePath: string): string {
  return supabase.storage.from(REVIEW_MEDIA_BUCKET).getPublicUrl(storagePath).data.publicUrl
}

export async function createReviewMediaUpload(
  supabase: SupabaseClient,
  rawRequest: unknown
): Promise<ReviewMediaUploadTicket> {
  const parsed = reviewMediaUploadRequestSchema.safeParse(rawRequest)
  if (!parsed.success) {
    throw new ReviewWriteError("invalid_media", parsed.error.issues[0]?.message ?? "Invalid file")
  }

  const storagePath = buildReviewMediaPath(parsed.data.mimeType)
  const { data, error } = await supabase.storage
    .from(REVIEW_MEDIA_BUCKET)
    .createSignedUploadUrl(storagePath)

  if (error || !data) {
    throw new ReviewWriteError(
      "upload_failed",
      "Could not prepare the upload. Please try again.",
      error?.message
    )
  }

  return {
    storagePath,
    signedUrl: data.signedUrl,
    publicUrl: getReviewMediaPublicUrl(supabase, storagePath),
  }
}

async function readObjectHeader(publicUrl: string): Promise<Uint8Array> {
  const res = await fetch(publicUrl, {
    headers: { Range: `bytes=0-${SNIFF_BYTE_COUNT - 1}` },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buffer = new Uint8Array(await res.arrayBuffer())
  return buffer.subarray(0, SNIFF_BYTE_COUNT)
}

/**
 * Re-verify a newly uploaded object at submit time: the stored size and type
 * come from storage metadata and the file's magic bytes, never from the
 * client-declared values. Storage RLS only lets the owner read object info, so
 * a successful info() also proves the caller uploaded it.
 */
export async function verifyReviewMediaObject(
  supabase: SupabaseClient,
  ref: ReviewMediaRef,
  sortOrder: number
): Promise<VerifiedReviewMedia> {
  const { data: info, error } = await supabase.storage
    .from(REVIEW_MEDIA_BUCKET)
    .info(ref.storagePath)

  if (error || !info) {
    throw new ReviewWriteError(
      "invalid_media",
      `${ref.fileName} was not uploaded successfully. Please remove it and try again.`,
      error?.message
    )
  }

  const actualSize = typeof info.size === "number" ? info.size : NaN
  const storedMime = (info.contentType ?? "").toLowerCase()
  const mediaType = getMediaTypeForMime(storedMime)

  if (!mediaType || mediaType !== ref.mediaType) {
    throw new ReviewWriteError("invalid_media", `${ref.fileName} has an unsupported file type.`)
  }
  if (!Number.isFinite(actualSize) || actualSize <= 0) {
    throw new ReviewWriteError("invalid_media", `${ref.fileName} is empty or unreadable.`)
  }
  if (actualSize > REVIEW_MEDIA_LIMITS[mediaType].maxBytes) {
    throw new ReviewWriteError("invalid_media", `${ref.fileName} is too large.`)
  }

  const fileUrl = getReviewMediaPublicUrl(supabase, ref.storagePath)
  let header: Uint8Array
  try {
    header = await readObjectHeader(fileUrl)
  } catch (err) {
    throw new ReviewWriteError(
      "invalid_media",
      `Could not verify ${ref.fileName}. Please try again.`,
      err instanceof Error ? err.message : String(err)
    )
  }
  if (!isSniffedMimeCompatible(storedMime, sniffMediaMime(header))) {
    throw new ReviewWriteError(
      "invalid_media",
      `${ref.fileName} does not look like a valid ${mediaType === "image" ? "photo" : "video"}.`
    )
  }

  return {
    storage_path: ref.storagePath,
    media_type: mediaType,
    file_url: fileUrl,
    file_name: ref.fileName,
    file_size_bytes: actualSize,
    mime_type: storedMime,
    sort_order: sortOrder,
  }
}

/**
 * Best-effort removal of review-media objects (orphan cleanup and media
 * removed on edit). Failures are logged, not thrown: the review write already
 * succeeded or failed on its own and must not be masked by cleanup.
 */
export async function removeReviewMediaObjects(
  supabase: SupabaseClient,
  storagePaths: readonly string[]
): Promise<void> {
  if (storagePaths.length === 0) return
  const { error } = await supabase.storage.from(REVIEW_MEDIA_BUCKET).remove([...storagePaths])
  if (error) {
    console.error("[reviews] Failed to remove review media objects:", error.message, storagePaths)
  }
}

/**
 * Remove uploads the user discarded before submitting (or abandoned when the
 * form closed). Paths already attached to a review are skipped, so this can
 * never break a saved review. Storage RLS restricts deletion to the owner.
 */
export async function removeUnattachedReviewMedia(
  supabase: SupabaseClient,
  storagePaths: readonly string[]
): Promise<void> {
  const paths = storagePaths.filter((p) => REVIEW_MEDIA_PATH_PATTERN.test(p))
  if (paths.length === 0) return

  const { data, error } = await supabase
    .from("review_media")
    .select("storage_path")
    .in("storage_path", paths)

  if (error) {
    throw new ReviewWriteError("write_failed", "Could not remove the file.", error.message)
  }

  const attached = new Set((data ?? []).map((row) => row.storage_path as string))
  await removeReviewMediaObjects(
    supabase,
    paths.filter((p) => !attached.has(p))
  )
}
