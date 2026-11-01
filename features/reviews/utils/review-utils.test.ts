import { describe, expect, test } from "bun:test"
import {
  averageCriteriaScore,
  criteriaScoresFromReview,
  deriveOverallRating,
  emptyCriteriaScores,
} from "./review-criteria"
import {
  isSniffedMimeCompatible,
  sniffMediaMime,
  validateMediaCandidate,
} from "./review-media-validation"
import { getReviewAuthorName } from "./review-author"
import { ANONYMOUS_AUTHOR_LABEL, REVIEW_CRITERIA } from "../constants"
import { containsProfanity, checkReviewComment } from "../services/moderation"

describe("deriveOverallRating", () => {
  test("is the rounded mean of the criteria (matches round(avg()) in SQL)", () => {
    expect(deriveOverallRating([4, 4, 4, 4, 4, 4])).toBe(4)
    expect(deriveOverallRating([3, 3, 4])).toBe(3) // 3.33
    expect(deriveOverallRating([4, 4, 4, 5, 5, 5])).toBe(5) // 4.5 rounds half up
    expect(deriveOverallRating([1, 2])).toBe(2) // 1.5
    expect(deriveOverallRating([1, 1, 1, 1, 1, 2])).toBe(1)
  })

  test("ignores unrated (0) criteria and returns 0 when nothing is rated", () => {
    expect(deriveOverallRating([0, 0, 0])).toBe(0)
    expect(deriveOverallRating([5, 0, 0])).toBe(5)
  })

  test("always stays within 1-5 for valid input", () => {
    for (let a = 1; a <= 5; a++) for (let b = 1; b <= 5; b++) {
      const r = deriveOverallRating([a, b])
      expect(r).toBeGreaterThanOrEqual(1)
      expect(r).toBeLessThanOrEqual(5)
    }
  })

  test("averageCriteriaScore keeps one decimal", () => {
    expect(averageCriteriaScore([3, 3, 4])).toBe(3.3)
  })
})

describe("criteria form helpers", () => {
  test("empty map has every criterion at 0", () => {
    const empty = emptyCriteriaScores()
    expect(Object.keys(empty).sort()).toEqual(REVIEW_CRITERIA.map((c) => c.key).sort())
    expect(Object.values(empty).every((v) => v === 0)).toBe(true)
  })

  test("preloads saved scores and ignores unknown keys", () => {
    const scores = criteriaScoresFromReview([
      { key: "safety", score: 2 },
      { key: "legacy_key", score: 5 },
    ])
    expect(scores.safety).toBe(2)
    expect(scores.site_condition).toBe(0)
    expect("legacy_key" in scores).toBe(false)
  })
})

describe("validateMediaCandidate", () => {
  const none = { image: 0, video: 0 }

  test("accepts allowed files within limits", () => {
    expect(validateMediaCandidate({ name: "a.jpg", type: "image/jpeg", size: 1000 }, none)).toBeNull()
    expect(validateMediaCandidate({ name: "a.mov", type: "video/quicktime", size: 1000 }, none)).toBeNull()
  })

  test("explains HEIC instead of rejecting silently", () => {
    const err = validateMediaCandidate({ name: "IMG_0001.HEIC", type: "image/heic", size: 1000 }, none)
    expect(err?.code).toBe("unsupported_type")
    expect(err?.message).toContain("HEIC")
  })

  test("enforces size and count limits", () => {
    expect(validateMediaCandidate({ name: "big.png", type: "image/png", size: 6 * 1024 * 1024 }, none)?.code).toBe("too_large")
    expect(validateMediaCandidate({ name: "a.png", type: "image/png", size: 10 }, { image: 5, video: 0 })?.code).toBe("too_many")
    expect(validateMediaCandidate({ name: "b.mp4", type: "video/mp4", size: 10 }, { image: 0, video: 1 })?.code).toBe("too_many")
  })
})

describe("sniffMediaMime", () => {
  const bytes = (...values: (number | string)[]) => {
    const out: number[] = []
    for (const v of values) {
      if (typeof v === "string") for (const ch of v) out.push(ch.charCodeAt(0))
      else out.push(v)
    }
    while (out.length < 16) out.push(0)
    return new Uint8Array(out)
  }

  test("detects real file signatures", () => {
    expect(sniffMediaMime(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg")
    expect(sniffMediaMime(bytes(0x89, "PNG", 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png")
    expect(sniffMediaMime(bytes("RIFF", 0, 0, 0, 0, "WEBP"))).toBe("image/webp")
    expect(sniffMediaMime(bytes(0, 0, 0, 0x18, "ftyp", "isom"))).toBe("video/mp4")
    expect(sniffMediaMime(bytes(0, 0, 0, 0x14, "ftyp", "qt  "))).toBe("video/quicktime")
    expect(sniffMediaMime(bytes("<html>"))).toBeNull()
  })

  test("declared type must match the sniffed type", () => {
    expect(isSniffedMimeCompatible("image/png", "image/jpeg")).toBe(false)
    expect(isSniffedMimeCompatible("image/jpeg", "image/jpeg")).toBe(true)
    expect(isSniffedMimeCompatible("video/quicktime", "video/mp4")).toBe(true)
    expect(isSniffedMimeCompatible("video/mp4", null)).toBe(false)
  })
})

describe("getReviewAuthorName", () => {
  test("anonymous reviews always show the anonymous label", () => {
    expect(
      getReviewAuthorName({ isAnonymous: true, authorFirstName: "Juan", authorLastName: "Cruz" })
    ).toBe(ANONYMOUS_AUTHOR_LABEL)
    expect(getReviewAuthorName({ isAnonymous: false, authorFirstName: "Juan", authorLastName: null })).toBe("Juan")
  })
})

describe("moderation", () => {
  test("flags blocked words on word boundaries only", () => {
    expect(containsProfanity("This is a scam")).toBe(true)
    expect(containsProfanity("A classic assembly hall")).toBe(false)
    expect(checkReviewComment("Beautiful place")).toBeNull()
    expect(checkReviewComment("total SCAM")).not.toBeNull()
    expect(checkReviewComment(null)).toBeNull()
  })
})
