import { describe, expect, test } from "bun:test"
import {
  ratingOnlyReviewSchema,
  reviewMediaUploadRequestSchema,
  reviewSubmissionSchema,
  toReviewFieldErrors,
} from "./review"
import { MAX_COMMENT_LENGTH, MAX_REVIEW_TAGS, REVIEW_CRITERIA } from "../constants"

const SITE = "33333333-3333-4333-8333-333333333333"
const path = (n: number, ext = "jpg") =>
  `aaaaaaaa-aaaa-4aaa-8aaa-${String(n).padStart(12, "0")}/bbbbbbbb-bbbb-4bbb-8bbb-${String(n).padStart(12, "0")}.${ext}`

const allCriteria = (score = 4) =>
  Object.fromEntries(REVIEW_CRITERIA.map((c) => [c.key, score])) as Record<string, number>

function image(n: number, overrides: Record<string, unknown> = {}) {
  return {
    storagePath: path(n),
    mediaType: "image",
    fileName: `photo-${n}.jpg`,
    fileSizeBytes: 1024,
    mimeType: "image/jpeg",
    ...overrides,
  }
}

function video(n: number) {
  return {
    storagePath: path(n, "mp4"),
    mediaType: "video",
    fileName: `clip-${n}.mp4`,
    fileSizeBytes: 10 * 1024 * 1024,
    mimeType: "video/mp4",
  }
}

function payload(overrides: Record<string, unknown> = {}) {
  return {
    siteId: SITE,
    criteria: allCriteria(),
    tags: ["well_maintained", "crowded"],
    comment: "Lovely old church.",
    isAnonymous: false,
    media: [],
    ...overrides,
  }
}

describe("reviewSubmissionSchema", () => {
  test("accepts a complete rich review", () => {
    expect(reviewSubmissionSchema.safeParse(payload()).success).toBe(true)
  })

  test("requires every configured criterion", () => {
    const criteria = allCriteria()
    delete criteria.safety
    const result = reviewSubmissionSchema.safeParse(payload({ criteria }))
    expect(result.success).toBe(false)
  })

  test("rejects unrated (0) and out-of-range criterion scores", () => {
    expect(reviewSubmissionSchema.safeParse(payload({ criteria: { ...allCriteria(), safety: 0 } })).success).toBe(false)
    expect(reviewSubmissionSchema.safeParse(payload({ criteria: { ...allCriteria(), safety: 6 } })).success).toBe(false)
    expect(reviewSubmissionSchema.safeParse(payload({ criteria: { ...allCriteria(), safety: 3.5 } })).success).toBe(false)
  })

  test("rejects unknown criterion keys", () => {
    const result = reviewSubmissionSchema.safeParse(payload({ criteria: { ...allCriteria(), parking: 3 } }))
    expect(result.success).toBe(false)
  })

  test("reports criterion errors under criteria.<key>", () => {
    const result = reviewSubmissionSchema.safeParse(payload({ criteria: { ...allCriteria(), safety: 0 } }))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(Object.keys(toReviewFieldErrors(result.error))).toContain("criteria.safety")
    }
  })

  test("rejects unknown, duplicate and too many tags", () => {
    expect(reviewSubmissionSchema.safeParse(payload({ tags: ["not_a_tag"] })).success).toBe(false)
    expect(reviewSubmissionSchema.safeParse(payload({ tags: ["crowded", "crowded"] })).success).toBe(false)
    const many = ["well_maintained", "informative_guide", "rich_history", "great_photo_spot", "clean_facilities", "family_friendly", "easy_to_find"]
    expect(many.length).toBeGreaterThan(MAX_REVIEW_TAGS)
    expect(reviewSubmissionSchema.safeParse(payload({ tags: many })).success).toBe(false)
  })

  test("comment is optional but limited to MAX_COMMENT_LENGTH", () => {
    expect(reviewSubmissionSchema.safeParse(payload({ comment: "" })).success).toBe(true)
    expect(reviewSubmissionSchema.safeParse(payload({ comment: "a".repeat(MAX_COMMENT_LENGTH) })).success).toBe(true)
    expect(reviewSubmissionSchema.safeParse(payload({ comment: "a".repeat(MAX_COMMENT_LENGTH + 1) })).success).toBe(false)
  })

  test("rejects a non-UUID site id", () => {
    expect(reviewSubmissionSchema.safeParse(payload({ siteId: "abc" })).success).toBe(false)
  })

  test("allows up to 5 images and 1 video", () => {
    const media = [1, 2, 3, 4, 5].map((n) => image(n)).concat([video(6)] as never[])
    expect(reviewSubmissionSchema.safeParse(payload({ media })).success).toBe(true)
  })

  test("rejects a 6th image and a 2nd video", () => {
    const sixImages = [1, 2, 3, 4, 5, 6].map((n) => image(n))
    expect(reviewSubmissionSchema.safeParse(payload({ media: sixImages })).success).toBe(false)
    expect(reviewSubmissionSchema.safeParse(payload({ media: [video(1), video(2)] })).success).toBe(false)
  })

  test("rejects oversized, mistyped, duplicate and badly-named media", () => {
    expect(reviewSubmissionSchema.safeParse(payload({ media: [image(1, { fileSizeBytes: 5 * 1024 * 1024 + 1 })] })).success).toBe(false)
    expect(reviewSubmissionSchema.safeParse(payload({ media: [image(1, { mimeType: "image/gif" })] })).success).toBe(false)
    expect(reviewSubmissionSchema.safeParse(payload({ media: [image(1, { mimeType: "video/mp4" })] })).success).toBe(false)
    expect(reviewSubmissionSchema.safeParse(payload({ media: [image(1), image(1)] })).success).toBe(false)
    // Path containing a user id / arbitrary prefix is not a valid review-media reference
    expect(reviewSubmissionSchema.safeParse(payload({ media: [image(1, { storagePath: "user-123/photo.jpg" })] })).success).toBe(false)
  })
})

describe("ratingOnlyReviewSchema", () => {
  test("accepts a single 1-5 rating", () => {
    expect(ratingOnlyReviewSchema.safeParse({ siteId: SITE, rating: 5, comment: "" }).success).toBe(true)
    expect(ratingOnlyReviewSchema.safeParse({ siteId: SITE, rating: 0, comment: "" }).success).toBe(false)
  })
})

describe("reviewMediaUploadRequestSchema", () => {
  test("enforces type and per-type size limits", () => {
    expect(reviewMediaUploadRequestSchema.safeParse({ fileName: "a.jpg", mimeType: "image/jpeg", fileSizeBytes: 100 }).success).toBe(true)
    expect(reviewMediaUploadRequestSchema.safeParse({ fileName: "a.heic", mimeType: "image/heic", fileSizeBytes: 100 }).success).toBe(false)
    expect(reviewMediaUploadRequestSchema.safeParse({ fileName: "v.mp4", mimeType: "video/mp4", fileSizeBytes: 30 * 1024 * 1024 + 1 }).success).toBe(false)
    expect(reviewMediaUploadRequestSchema.safeParse({ fileName: "v.mov", mimeType: "video/quicktime", fileSizeBytes: 29 * 1024 * 1024 }).success).toBe(true)
  })
})
