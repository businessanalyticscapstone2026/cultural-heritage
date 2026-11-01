import { z } from "zod"
import {
  MAX_COMMENT_LENGTH,
  MAX_REVIEW_TAGS,
  REVIEW_CRITERION_KEYS,
  REVIEW_MEDIA_LIMITS,
  REVIEW_MEDIA_PATH_PATTERN,
  REVIEW_TAG_KEYS,
} from "../constants"
import { getMediaTypeForMime } from "../utils/review-media-validation"

/**
 * Validation for CHT-135 rich reviews. Used by React Hook Form on the client
 * and re-run on the server by features/reviews/services/review-write.ts, which
 * is callable from Server Actions and plain route handlers alike.
 */

const criterionScoreSchema = z
  .number({ error: "Please rate this criterion" })
  .int("Ratings must be whole stars")
  .min(1, "Please rate this criterion")
  .max(5, "Ratings go up to 5 stars")

/** Every configured criterion is required (Zod v4 enum-keyed records are exhaustive). */
export const reviewCriteriaSchema = z.record(z.enum(REVIEW_CRITERION_KEYS), criterionScoreSchema)

export const reviewTagsSchema = z
  .array(z.enum(REVIEW_TAG_KEYS, { error: "Unknown feedback tag" }))
  .max(MAX_REVIEW_TAGS, `Choose up to ${MAX_REVIEW_TAGS} tags`)
  .refine((tags) => new Set(tags).size === tags.length, "Tags must be unique")

export const reviewCommentSchema = z
  .string()
  .max(MAX_COMMENT_LENGTH, `Comment must be ${MAX_COMMENT_LENGTH} characters or less`)

export const reviewMediaRefSchema = z
  .object({
    storagePath: z.string().regex(REVIEW_MEDIA_PATH_PATTERN, "Invalid media reference"),
    mediaType: z.enum(["image", "video"]),
    fileName: z.string().trim().min(1).max(255),
    fileSizeBytes: z.number().int().positive(),
    mimeType: z.string().min(1),
  })
  .superRefine((ref, ctx) => {
    const typeForMime = getMediaTypeForMime(ref.mimeType)
    if (typeForMime !== ref.mediaType) {
      ctx.addIssue({ code: "custom", message: "Unsupported file type", path: ["mimeType"] })
      return
    }
    if (ref.fileSizeBytes > REVIEW_MEDIA_LIMITS[ref.mediaType].maxBytes) {
      ctx.addIssue({ code: "custom", message: "File is too large", path: ["fileSizeBytes"] })
    }
  })

export const reviewMediaListSchema = z.array(reviewMediaRefSchema).superRefine((media, ctx) => {
  const images = media.filter((m) => m.mediaType === "image").length
  const videos = media.filter((m) => m.mediaType === "video").length
  if (images > REVIEW_MEDIA_LIMITS.image.maxCount) {
    ctx.addIssue({
      code: "custom",
      message: `You can attach up to ${REVIEW_MEDIA_LIMITS.image.maxCount} photos`,
    })
  }
  if (videos > REVIEW_MEDIA_LIMITS.video.maxCount) {
    ctx.addIssue({
      code: "custom",
      message: `You can attach up to ${REVIEW_MEDIA_LIMITS.video.maxCount} video`,
    })
  }
  if (new Set(media.map((m) => m.storagePath)).size !== media.length) {
    ctx.addIssue({ code: "custom", message: "Duplicate media file" })
  }
})

/** Full rich-review payload (client form submit and server re-validation). */
export const reviewSubmissionSchema = z.object({
  siteId: z.uuid("Invalid heritage site"),
  criteria: reviewCriteriaSchema,
  tags: reviewTagsSchema,
  comment: reviewCommentSchema,
  isAnonymous: z.boolean(),
  media: reviewMediaListSchema,
})

export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>
export type ReviewMediaRef = z.infer<typeof reviewMediaRefSchema>

/**
 * React Hook Form values. Unrated criteria start at 0 so the star inputs render
 * empty; the resolver (reviewSubmissionSchema) rejects 0 with a field message.
 */
export type ReviewFormValues = ReviewSubmissionInput

/** Legacy single-rating write (public feedback form). */
export const ratingOnlyReviewSchema = z.object({
  siteId: z.uuid("Invalid heritage site"),
  rating: criterionScoreSchema,
  comment: reviewCommentSchema,
})

export type RatingOnlyReviewInput = z.infer<typeof ratingOnlyReviewSchema>

/** Request for a signed review-media upload URL. */
export const reviewMediaUploadRequestSchema = z
  .object({
    fileName: z.string().trim().min(1).max(255),
    mimeType: z.string().min(1),
    fileSizeBytes: z.number().int().positive(),
  })
  .superRefine((req, ctx) => {
    const mediaType = getMediaTypeForMime(req.mimeType)
    if (!mediaType) {
      ctx.addIssue({ code: "custom", message: "Unsupported file type", path: ["mimeType"] })
      return
    }
    if (req.fileSizeBytes > REVIEW_MEDIA_LIMITS[mediaType].maxBytes) {
      ctx.addIssue({ code: "custom", message: "File is too large", path: ["fileSizeBytes"] })
    }
  })

export type ReviewMediaUploadRequest = z.infer<typeof reviewMediaUploadRequestSchema>

/** Flatten Zod issues into { "criteria.safety": ["..."] } for form display. */
export function toReviewFieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_form"
    ;(out[key] ??= []).push(issue.message)
  }
  return out
}
