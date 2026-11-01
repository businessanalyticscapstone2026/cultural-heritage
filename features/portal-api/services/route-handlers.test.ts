import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { PORTAL_ALLOWED_ORIGINS_ENV } from "../constants"
import { reviewsQuerySchema } from "../schemas/portal-query"

// The data/write modules depend on next/cache, which only works inside the
// Next.js runtime. These tests cover paths that fail before any read or
// write, so the stubs throw if they are ever reached.
const unreachable = () => {
  throw new Error("database layer must not be reached in these tests")
}
mock.module("./taal-data", () => ({
  getTaalHeritageSitesPage: unreachable,
  getTaalReviewsPage: unreachable,
  getTaalSiteIds: unreachable,
}))
mock.module("./review-submit", () => ({ submitPortalReview: unreachable }))

const { REVIEWS_METHODS, buildPageMeta, handlePreflight, handleReviewsPost, parseQuery } = await import(
  "./route-handlers"
)

const PORTAL = "https://taal.example.gov.ph"
const URL_ = "https://tcdss.example/api/v1/taal/reviews"
const previous = process.env[PORTAL_ALLOWED_ORIGINS_ENV]

beforeEach(() => {
  process.env[PORTAL_ALLOWED_ORIGINS_ENV] = PORTAL
})
afterEach(() => {
  if (previous === undefined) delete process.env[PORTAL_ALLOWED_ORIGINS_ENV]
  else process.env[PORTAL_ALLOWED_ORIGINS_ENV] = previous
})

describe("preflight", () => {
  test("allowed origin gets 204 with CORS headers", () => {
    const res = handlePreflight(new Request(URL_, { method: "OPTIONS", headers: { Origin: PORTAL } }), REVIEWS_METHODS)
    expect(res.status).toBe(204)
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(PORTAL)
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, OPTIONS")
  })

  test("disallowed origin gets 403 and no Allow-Origin", async () => {
    const res = handlePreflight(
      new Request(URL_, { method: "OPTIONS", headers: { Origin: "https://evil.example" } }),
      REVIEWS_METHODS
    )
    expect(res.status).toBe(403)
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull()
    expect((await res.json()).code).toBe("origin_not_allowed")
  })
})

describe("POST /reviews auth failures (no database touched)", () => {
  test("missing Authorization is 401 with envelope and CORS", async () => {
    const res = await handleReviewsPost(
      new Request(URL_, { method: "POST", headers: { Origin: PORTAL, "content-type": "application/json" }, body: "{}" })
    )
    expect(res.status).toBe(401)
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(PORTAL)
    expect(res.headers.get("Cache-Control")).toBe("no-store")
    expect(await res.json()).toMatchObject({ code: "unauthenticated" })
  })

  test("malformed token is 401", async () => {
    const res = await handleReviewsPost(
      new Request(URL_, { method: "POST", headers: { Authorization: "Token abc" }, body: "{}" })
    )
    expect(res.status).toBe(401)
  })

  test("disallowed browser origin is 403 before auth", async () => {
    const res = await handleReviewsPost(
      new Request(URL_, { method: "POST", headers: { Origin: "https://evil.example", Authorization: "Bearer a.b.c" } })
    )
    expect(res.status).toBe(403)
  })
})

describe("pagination", () => {
  test("parseQuery maps schema failures to 400 bad_request", () => {
    expect(() => parseQuery(reviewsQuerySchema, new URL(`${URL_}?page=0`))).toThrow(
      expect.objectContaining({ status: 400, code: "bad_request" })
    )
  })

  test("buildPageMeta", () => {
    expect(buildPageMeta({ page: 1, page_size: 20 }, 45)).toEqual({
      page: 1, pageSize: 20, total: 45, totalPages: 3, hasMore: true, updatedSince: null,
    })
    expect(buildPageMeta({ page: 3, page_size: 20, updated_since: "2026-10-01T00:00:00.000Z" }, 45)).toMatchObject({
      hasMore: false, updatedSince: "2026-10-01T00:00:00.000Z",
    })
    expect(buildPageMeta({ page: 1, page_size: 20 }, 0)).toMatchObject({ totalPages: 0, hasMore: false })
  })
})
