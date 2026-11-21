import { describe, expect, test } from "bun:test"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  mapPublishedFeedRow,
  mapReviewRow,
  REVIEW_COLUMNS,
  PUBLISHED_FEED_COLUMNS,
  type ReviewRow,
  type PublishedFeedRow,
} from "./review-mappers"
import { getPublishedReviews, getReviewsBySiteId, getUserReviewForSite, getReviewAggregate } from "./index"

const AUTHOR_ID = "aaaaaaaa-1111-4111-8111-111111111111"
const VIEWER_ID = "bbbbbbbb-2222-4222-8222-222222222222"
const SITE = "33333333-3333-4333-8333-333333333333"

function reviewRow(overrides: Partial<ReviewRow> = {}): ReviewRow {
  return {
    id: "r1",
    tourist_id: AUTHOR_ID,
    site_id: SITE,
    rating: 4,
    comment: "Nice",
    status: "published",
    is_anonymous: true,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-02T00:00:00Z",
    tourist: { first_name: "Maria", last_name: "Santos" },
    criteria: [{ criterion_key: "safety", score: 4 }],
    tags: [{ tag_key: "crowded" }],
    media: [],
    ...overrides,
  }
}

function feedRow(overrides: Partial<PublishedFeedRow> = {}): PublishedFeedRow {
  return {
    id: "r1",
    tourist_id: AUTHOR_ID,
    site_id: SITE,
    rating: 5,
    comment: "Great",
    is_anonymous: true,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: null,
    tourist: [{ first_name: "Maria", last_name: "Santos" }],
    site: { site_name: "Basilica" },
    ...overrides,
  }
}

function assertNoLeak(value: unknown) {
  const json = JSON.stringify(value)
  expect(json).not.toContain(AUTHOR_ID)
  expect(json).not.toContain("Maria")
  expect(json).not.toContain("Santos")
  expect(json).not.toContain("touristId")
  expect(json).not.toContain("tourist_id")
}

describe("review mappers: anonymity", () => {
  test("anonymous review exposes no author name or tourist id", () => {
    const mapped = mapReviewRow(reviewRow(), VIEWER_ID)
    expect(mapped.authorFirstName).toBeNull()
    expect(mapped.authorLastName).toBeNull()
    expect(mapped.isAnonymous).toBe(true)
    expect(mapped.isOwn).toBe(false)
    assertNoLeak(mapped)
  })

  test("anonymous review is still recognised as own by its author (server-computed)", () => {
    const mapped = mapReviewRow(reviewRow(), AUTHOR_ID)
    expect(mapped.isOwn).toBe(true)
    assertNoLeak(mapped)
  })

  test("named review exposes names but never the tourist id", () => {
    const mapped = mapReviewRow(reviewRow({ is_anonymous: false }), null)
    expect(mapped.authorFirstName).toBe("Maria")
    expect(JSON.stringify(mapped)).not.toContain(AUTHOR_ID)
    expect(mapped.isOwn).toBe(false)
  })

  test("published feed rows follow the same rules", () => {
    assertNoLeak(mapPublishedFeedRow(feedRow(), VIEWER_ID))
    expect(mapPublishedFeedRow(feedRow(), AUTHOR_ID).isOwn).toBe(true)
    const named = mapPublishedFeedRow(feedRow({ is_anonymous: false }), null)
    expect(named.authorLastName).toBe("Santos")
    expect(JSON.stringify(named)).not.toContain(AUTHOR_ID)
  })

  test("reads use explicit column lists, not select(*)", () => {
    expect(REVIEW_COLUMNS).not.toContain("*")
    expect(PUBLISHED_FEED_COLUMNS).not.toContain("*")
    expect(REVIEW_COLUMNS).toContain("is_anonymous")
  })

  test("maps criteria, tags and media in display order", () => {
    const mapped = mapReviewRow(
      reviewRow({
        media: [
          { id: "m2", media_type: "video", file_url: "u2", storage_path: "p2", file_name: "b.mp4", file_size_bytes: 20, mime_type: "video/mp4", sort_order: 1 },
          { id: "m1", media_type: "image", file_url: "u1", storage_path: "p1", file_name: "a.jpg", file_size_bytes: 10, mime_type: "image/jpeg", sort_order: 0 },
        ],
      }),
      null
    )
    expect(mapped.media.map((m) => m.id)).toEqual(["m1", "m2"])
    expect(mapped.criteria).toEqual([{ key: "safety", score: 4 }])
    expect(mapped.tags).toEqual(["crowded"])
  })

  test("legacy review without criteria still maps (rating fallback)", () => {
    const mapped = mapReviewRow(reviewRow({ criteria: null, tags: null, media: null, is_anonymous: null }), null)
    expect(mapped.criteria).toEqual([])
    expect(mapped.isAnonymous).toBe(false)
    expect(mapped.rating).toBe(4)
  })
})

/** Minimal thenable query-builder fake that returns fixed rows per table. */
function fakeSupabase(rowsByTable: Record<string, unknown>) {
  const selects: { table: string; columns: string }[] = []
  function from(table: string) {
    const result = { data: rowsByTable[table] ?? null, error: null, count: 1 }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builder: any = {
      select: (columns: string) => {
        selects.push({ table, columns })
        return builder
      },
      eq: () => builder,
      order: () => builder,
      range: () => builder,
      maybeSingle: () => Promise.resolve({ ...result, data: Array.isArray(result.data) ? result.data[0] : result.data }),
      then: (resolve: (v: unknown) => void) => resolve(result),
    }
    return builder
  }
  return { client: { from } as unknown as SupabaseClient, selects }
}

describe("review read services: anonymity end-to-end", () => {
  test("getReviewsBySiteId never returns author identity for anonymous reviews", async () => {
    const { client, selects } = fakeSupabase({
      reviews: [reviewRow(), reviewRow({ id: "r2", is_anonymous: false })],
      heritage_sites: { average_rating: 4.2, review_count: 2 },
    })
    const result = await getReviewsBySiteId(client, SITE, VIEWER_ID)
    assertNoLeak(result.reviews[0])
    expect(result.reviews[1].authorFirstName).toBe("Maria")
    expect(JSON.stringify(result)).not.toContain(AUTHOR_ID)
    expect(selects.every((s) => !s.columns.includes("*"))).toBe(true)
  })

  test("getPublishedReviews never returns author identity for anonymous reviews", async () => {
    const { client } = fakeSupabase({ reviews: [feedRow()] })
    const result = await getPublishedReviews(client, VIEWER_ID, 0, 9)
    assertNoLeak(result.items)
  })

  test("getUserReviewForSite marks the caller's anonymous review as own without the id", async () => {
    const { client } = fakeSupabase({ reviews: reviewRow() })
    const review = await getUserReviewForSite(client, AUTHOR_ID, SITE)
    expect(review?.isOwn).toBe(true)
    assertNoLeak(review)
  })

  test("getReviewAggregate uses cached heritage_sites aggregate when review_count > 0", async () => {
    const { client } = fakeSupabase({
      heritage_sites: { average_rating: 4.5, review_count: 10 },
    })
    const aggregate = await getReviewAggregate(client, SITE)
    expect(aggregate.reviewCount).toBe(10)
    expect(aggregate.averageRating).toBe(4.5)
  })

  test("getReviewAggregate falls back to computing from reviews table when heritage_sites.review_count is 0", async () => {
    const { client } = fakeSupabase({
      heritage_sites: { average_rating: 0, review_count: 0 },
      reviews: [{ rating: 5 }, { rating: 4 }],
    })
    const aggregate = await getReviewAggregate(client, SITE)
    expect(aggregate.reviewCount).toBe(2)
    expect(aggregate.averageRating).toBe(4.5)
  })
})
