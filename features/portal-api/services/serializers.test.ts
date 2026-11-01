import { describe, expect, test } from "bun:test"
import { mapReviewRow, type ReviewRow } from "@/features/reviews/services/review-mappers"
import { ANONYMOUS_AUTHOR_LABEL } from "@/features/reviews/constants"
import { serializeHeritageSite, serializeReview, type PortalSiteRow } from "./serializers"

const TOURIST_ID = "aaaaaaaa-1111-4111-8111-111111111111"
const SITE_ID = "33333333-3333-4333-8333-333333333333"

function reviewRow(overrides: Partial<ReviewRow> = {}): ReviewRow {
  return {
    id: "review-1",
    tourist_id: TOURIST_ID,
    site_id: SITE_ID,
    rating: 4,
    comment: "Lovely basilica",
    status: "published",
    is_anonymous: false,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-02T00:00:00Z",
    tourist: { first_name: "Ana", last_name: "Reyes" },
    criteria: [{ criterion_key: "safety", score: 5 }],
    tags: [{ tag_key: "rich_history" }],
    media: [
      {
        id: "m1",
        media_type: "image",
        file_url: "https://x.supabase.co/storage/v1/object/public/review-media/a/b.jpg",
        storage_path: "a/b.jpg",
        file_name: "ana-reyes-selfie.jpg",
        file_size_bytes: 1000,
        mime_type: "image/jpeg",
        sort_order: 0,
      },
    ],
    ...overrides,
  }
}

const serialize = (row: ReviewRow) => serializeReview(mapReviewRow(row, null))

describe("serializeReview", () => {
  test("exposes only the public whitelist", () => {
    const out = serialize(reviewRow())
    expect(Object.keys(out).sort()).toEqual(
      ["authorName", "comment", "createdAt", "criteria", "id", "isAnonymous", "media", "rating", "siteId", "tags", "updatedAt"].sort()
    )
    expect(out.authorName).toBe("Ana Reyes")
    expect(out.media).toEqual([
      { mediaType: "image", url: "https://x.supabase.co/storage/v1/object/public/review-media/a/b.jpg", sortOrder: 0 },
    ])
  })

  test("anonymous review leaks no author identity anywhere in the payload", () => {
    const json = JSON.stringify(serialize(reviewRow({ is_anonymous: true })))
    expect(json).toContain(ANONYMOUS_AUTHOR_LABEL)
    for (const secret of ["Ana", "Reyes", TOURIST_ID, "selfie", "tourist", "status", "isOwn", "storagePath", "email"]) {
      expect(json).not.toContain(secret)
    }
  })

  test("never includes tourist id, moderation status or file names for named reviews either", () => {
    const json = JSON.stringify(serialize(reviewRow({ status: "flagged" })))
    for (const secret of [TOURIST_ID, "flagged", "ana-reyes-selfie", "storagePath", "fileName"]) {
      expect(json).not.toContain(secret)
    }
  })
})

describe("serializeHeritageSite", () => {
  const row: PortalSiteRow = {
    id: SITE_ID,
    site_name: "Basilica of St. Martin de Tours",
    alternative_name: null,
    barangay: "Poblacion",
    exact_address: null,
    short_description: "Largest church in Asia",
    detailed_description: null,
    historical_period: "Spanish",
    year_established: "1856",
    historical_significance: null,
    cultural_significance: null,
    latitude: "13.88",
    longitude: "120.92",
    accessibility_info: null,
    operating_hours: null,
    entrance_fee: null,
    designation: null,
    is_featured: true,
    average_rating: "4.5",
    review_count: 12,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    category: [{ name: "Church" }],
    municipality: { name: "Taal" },
    media: [
      { media_type: "document", file_url: "doc.pdf", caption: null, is_primary: false, sort_order: 0 },
      { media_type: "image", file_url: "b.jpg", caption: null, is_primary: false, sort_order: 1 },
      { media_type: "image", file_url: "a.jpg", caption: "Facade", is_primary: true, sort_order: 2 },
    ],
  }

  test("maps explicit fields, numbers and primary-first images", () => {
    const out = serializeHeritageSite(row, "Taal")
    expect(out.latitude).toBe(13.88)
    expect(out.averageRating).toBe(4.5)
    expect(out.category).toBe("Church")
    expect(out.images.map((i) => i.url)).toEqual(["a.jpg", "b.jpg"])
    const json = JSON.stringify(out)
    for (const internal of ["publication_status", "visibility", "created_by", "municipality_id"]) {
      expect(json).not.toContain(internal)
    }
  })
})
