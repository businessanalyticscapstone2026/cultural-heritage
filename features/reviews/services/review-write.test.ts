import { afterEach, describe, expect, test } from "bun:test"
import type { SupabaseClient } from "@supabase/supabase-js"
import { submitRatingOnlyReview, submitRichReview } from "./review-write"
import { ReviewWriteError } from "./review-errors"
import { REVIEW_CRITERIA } from "../constants"

const USER = "aaaaaaaa-1111-4111-8111-111111111111"
const SITE = "33333333-3333-4333-8333-333333333333"
const NEW_PATH = "cccccccc-cccc-4ccc-8ccc-cccccccccccc/dddddddd-dddd-4ddd-8ddd-dddddddddddd.jpg"
const KEPT_PATH = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee/ffffffff-ffff-4fff-8fff-ffffffffffff.png"
const REMOVED_PATH = "11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa/22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb.webp"

const JPEG_HEADER = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
const HTML_HEADER = new TextEncoder().encode("<html><body>....")

const originalFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = originalFetch
})

function mockFetch(bytes: Uint8Array) {
  const body = new Blob([new Uint8Array(bytes)])
  globalThis.fetch = (async () => new Response(body, { status: 206 })) as unknown as typeof fetch
}

const allCriteria = (score = 4) => Object.fromEntries(REVIEW_CRITERIA.map((c) => [c.key, score]))

function fakeSupabase(options: {
  existingMedia?: Record<string, unknown>[]
  /** Simulate a first-time review (no existing row for tourist+site). */
  noExistingReview?: boolean
  info?: { size: number; contentType: string } | null
  rpcResult?: { data: unknown; error: unknown }
}) {
  const rpcCalls: { fn: string; params: Record<string, unknown> }[] = []
  const removed: string[][] = []

  function from(table: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builder: any = {
      select: () => builder,
      eq: () => builder,
      in: () => builder,
      maybeSingle: () => {
        if (table === "tourist_profiles") return Promise.resolve({ data: { id: USER }, error: null })
        if (table === "heritage_sites") {
          return Promise.resolve({ data: { average_rating: 4, review_count: 1 }, error: null })
        }
        if (table === "reviews" && rpcCalls.length === 0) {
          if (options.noExistingReview) return Promise.resolve({ data: null, error: null })
          return Promise.resolve({ data: { media: options.existingMedia ?? [] }, error: null })
        }
        return Promise.resolve({
          data: {
            id: "review-1", tourist_id: USER, site_id: SITE, rating: 4, comment: null,
            status: "published", is_anonymous: true, created_at: "2026-11-01", updated_at: "2026-11-01",
            tourist: { first_name: "Ana", last_name: "Reyes" }, criteria: [], tags: [], media: [],
          },
          error: null,
        })
      },
    }
    return builder
  }

  const bucket = {
    info: async () =>
      options.info ? { data: options.info, error: null } : { data: null, error: { message: "not found" } },
    getPublicUrl: (p: string) => ({
      data: { publicUrl: `https://x.supabase.co/storage/v1/object/public/review-media/${p}` },
    }),
    remove: async (paths: string[]) => {
      removed.push(paths)
      return { data: [], error: null }
    },
  }

  const client = {
    from,
    rpc: async (fn: string, params: Record<string, unknown>) => {
      rpcCalls.push({ fn, params })
      return options.rpcResult ?? { data: { review_id: "review-1", removed_storage_paths: [] }, error: null }
    },
    storage: { from: () => bucket },
  } as unknown as SupabaseClient

  return { client, rpcCalls, removed }
}

function payload(overrides: Record<string, unknown> = {}) {
  return {
    siteId: SITE,
    criteria: allCriteria(),
    tags: ["well_maintained"],
    comment: "  Worth the trip.  ",
    isAnonymous: true,
    media: [],
    ...overrides,
  }
}

const newImageRef = {
  storagePath: NEW_PATH,
  mediaType: "image",
  fileName: "church.jpg",
  fileSizeBytes: 999, // client-declared; server must use storage metadata instead
  mimeType: "image/jpeg",
}

describe("submitRichReview", () => {
  test("reports created=true for a first review and created=false for an edit", async () => {
    const fresh = fakeSupabase({ noExistingReview: true })
    expect((await submitRichReview(fresh.client, USER, payload())).created).toBe(true)

    const edit = fakeSupabase({})
    expect((await submitRichReview(edit.client, USER, payload())).created).toBe(false)
  })

  test("rejects invalid input before touching the database", async () => {
    const { client, rpcCalls } = fakeSupabase({})
    const err = await submitRichReview(client, USER, payload({ criteria: { safety: 3 } })).catch((e) => e)
    expect(err).toBeInstanceOf(ReviewWriteError)
    expect((err as ReviewWriteError).code).toBe("validation")
    expect((err as ReviewWriteError).fieldErrors).toBeDefined()
    expect(rpcCalls).toHaveLength(0)
  })

  test("rejects blocked language server-side", async () => {
    const { client, rpcCalls } = fakeSupabase({})
    const err = await submitRichReview(client, USER, payload({ comment: "what a scam" })).catch((e) => e)
    expect((err as ReviewWriteError).code).toBe("moderation")
    expect(rpcCalls).toHaveLength(0)
  })

  test("writes atomically through submit_review with verified media metadata", async () => {
    mockFetch(JPEG_HEADER)
    const { client, rpcCalls, removed } = fakeSupabase({
      info: { size: 123456, contentType: "image/jpeg" },
      existingMedia: [
        { storage_path: KEPT_PATH, media_type: "image", file_url: "kept-url", file_name: "kept.png", file_size_bytes: 50, mime_type: "image/png" },
        { storage_path: REMOVED_PATH, media_type: "image", file_url: "gone-url", file_name: "gone.webp", file_size_bytes: 60, mime_type: "image/webp" },
      ],
      rpcResult: { data: { review_id: "review-1", removed_storage_paths: [REMOVED_PATH] }, error: null },
    })

    const keptRef = { storagePath: KEPT_PATH, mediaType: "image", fileName: "kept.png", fileSizeBytes: 50, mimeType: "image/png" }
    const result = await submitRichReview(client, USER, payload({ media: [keptRef, newImageRef] }))

    expect(rpcCalls).toHaveLength(1)
    const { fn, params } = rpcCalls[0]
    expect(fn).toBe("submit_review")
    expect(params.p_site_id).toBe(SITE)
    expect(params.p_criteria).toEqual(allCriteria())
    expect(params.p_rating).toBeNull()
    expect(params.p_comment).toBe("Worth the trip.")
    expect(params.p_is_anonymous).toBe(true)
    expect(params.p_tags).toEqual(["well_maintained"])

    const media = params.p_media as Record<string, unknown>[]
    expect(media).toHaveLength(2)
    expect(media[0]).toMatchObject({ storage_path: KEPT_PATH, file_url: "kept-url", sort_order: 0 })
    expect(media[1]).toMatchObject({ storage_path: NEW_PATH, file_size_bytes: 123456, mime_type: "image/jpeg", sort_order: 1 })

    // Media removed on edit is deleted from storage after the atomic write
    expect(removed).toEqual([[REMOVED_PATH]])
    // Response is anonymity-safe
    expect(result.review.authorFirstName).toBeNull()
    expect(JSON.stringify(result)).not.toContain(USER)
  })

  test("rejects an upload whose bytes do not match its type and deletes the object", async () => {
    mockFetch(HTML_HEADER)
    const { client, rpcCalls, removed } = fakeSupabase({ info: { size: 1000, contentType: "image/jpeg" } })
    const err = await submitRichReview(client, USER, payload({ media: [newImageRef] })).catch((e) => e)
    expect((err as ReviewWriteError).code).toBe("invalid_media")
    expect(rpcCalls).toHaveLength(0)
    expect(removed).toEqual([[NEW_PATH]])
  })

  test("rejects an upload that exceeds the real size limit even if the client lied", async () => {
    mockFetch(JPEG_HEADER)
    const { client, rpcCalls } = fakeSupabase({ info: { size: 6 * 1024 * 1024, contentType: "image/jpeg" } })
    const err = await submitRichReview(client, USER, payload({ media: [newImageRef] })).catch((e) => e)
    expect((err as ReviewWriteError).code).toBe("invalid_media")
    expect(rpcCalls).toHaveLength(0)
  })

  test("rejects a reference to an object the caller cannot read (not uploaded / not owned)", async () => {
    const { client, rpcCalls } = fakeSupabase({ info: null })
    const err = await submitRichReview(client, USER, payload({ media: [newImageRef] })).catch((e) => e)
    expect((err as ReviewWriteError).code).toBe("invalid_media")
    expect(rpcCalls).toHaveLength(0)
  })

  test("maps database errors to safe messages", async () => {
    const { client } = fakeSupabase({
      rpcResult: { data: null, error: { code: "42501", message: "new row violates row-level security policy" } },
    })
    const err = await submitRichReview(client, USER, payload()).catch((e) => e)
    expect((err as ReviewWriteError).code).toBe("forbidden")
    expect((err as ReviewWriteError).message).not.toContain("row-level")
  })
})

describe("submitRatingOnlyReview", () => {
  test("sends an empty criteria object and leaves tags/media/anonymity untouched", async () => {
    const { client, rpcCalls } = fakeSupabase({})
    await submitRatingOnlyReview(client, USER, { siteId: SITE, rating: 5, comment: "[Compliment] Great" })
    expect(rpcCalls[0].params).toMatchObject({
      p_criteria: {},
      p_rating: 5,
      p_is_anonymous: null,
      p_tags: null,
      p_media: null,
    })
  })
})
