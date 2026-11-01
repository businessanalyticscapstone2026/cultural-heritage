import { describe, expect, test } from "bun:test"
import { ReviewWriteError, type ReviewWriteErrorCode } from "@/features/reviews/services/review-errors"
import { PortalApiError, toPortalApiError } from "./portal-errors"
import type { PortalErrorCode } from "../types"

describe("toPortalApiError", () => {
  const cases: [ReviewWriteErrorCode, number, PortalErrorCode][] = [
    ["unauthenticated", 401, "unauthenticated"],
    ["no_tourist_profile", 403, "no_tourist_profile"],
    ["forbidden", 403, "forbidden"],
    ["not_found", 404, "not_found"],
    ["validation", 422, "validation_failed"],
    ["moderation", 422, "moderation_rejected"],
    ["invalid_media", 422, "invalid_media"],
    ["write_failed", 503, "dependency_unavailable"],
    ["upload_failed", 500, "internal_error"],
  ]

  for (const [code, status, portalCode] of cases) {
    test(`ReviewWriteError ${code} -> ${status}`, () => {
      const err = toPortalApiError(new ReviewWriteError(code, "msg", "pg internal detail"))
      expect(err.status).toBe(status)
      expect(err.code).toBe(portalCode)
      expect(JSON.stringify(err.toBody())).not.toContain("pg internal detail")
    })
  }

  test("503 from write_failed carries Retry-After", () => {
    expect(toPortalApiError(new ReviewWriteError("write_failed", "x")).retryAfterSeconds).toBeGreaterThan(0)
  })

  test("validation field errors are passed through as details", () => {
    const err = toPortalApiError(new ReviewWriteError("validation", "bad", undefined, { siteId: ["Invalid"] }))
    expect(err.toBody().details).toEqual({ siteId: ["Invalid"] })
  })

  test("unknown errors become a generic 500 without internals", () => {
    const err = toPortalApiError(new Error("relation reviews does not exist at /srv/app.ts:12"))
    expect(err.status).toBe(500)
    expect(err.toBody()).toEqual({ error: "Something went wrong. Please try again.", code: "internal_error" })
  })

  test("PortalApiError passes through unchanged", () => {
    const original = new PortalApiError(404, "not_found", "nope")
    expect(toPortalApiError(original)).toBe(original)
  })
})
