import { describe, expect, test } from "bun:test"
import { heritageSitesQuerySchema, reviewsQuerySchema, searchParamsToObject } from "./portal-query"
import { PORTAL_PAGE_SIZE_DEFAULT, PORTAL_PAGE_SIZE_MAX } from "../constants"

const parse = (qs: string) => reviewsQuerySchema.safeParse(searchParamsToObject(new URLSearchParams(qs)))

describe("portal query parsing", () => {
  test("defaults", () => {
    const r = heritageSitesQuerySchema.parse({})
    expect(r).toEqual({ page: 1, page_size: PORTAL_PAGE_SIZE_DEFAULT, sort: "updated_desc" })
  })

  test("page_size above the hard cap is clamped", () => {
    const r = parse("page_size=1000")
    expect(r.success && r.data.page_size).toBe(PORTAL_PAGE_SIZE_MAX)
  })

  test("rejects invalid page and page_size", () => {
    for (const qs of ["page=0", "page=-1", "page=1.5", "page=abc", "page_size=0", "page_size=x", "page=99999999"]) {
      expect(parse(qs).success).toBe(false)
    }
  })

  test("updated_since requires a timezone and is normalised to UTC", () => {
    const ok = parse("updated_since=2026-10-01T08:00:00%2B08:00")
    expect(ok.success && ok.data.updated_since).toBe("2026-10-01T00:00:00.000Z")
    expect(parse("updated_since=2026-10-01").success).toBe(false)
    expect(parse("updated_since=2026-10-01T08:00:00").success).toBe(false)
    expect(parse("updated_since=yesterday").success).toBe(false)
  })

  test("site_id must be a UUID", () => {
    expect(parse("site_id=33333333-3333-4333-8333-333333333333").success).toBe(true)
    expect(parse("site_id=1 OR 1=1").success).toBe(false)
  })

  test("unknown parameters are rejected (sites endpoint has no site_id)", () => {
    expect(parse("siteid=x").success).toBe(false)
    expect(heritageSitesQuerySchema.safeParse({ site_id: "33333333-3333-4333-8333-333333333333" }).success).toBe(false)
  })

  test("only the first value of a repeated parameter is used", () => {
    expect(searchParamsToObject(new URLSearchParams("page=2&page=9"))).toEqual({ page: "2" })
  })
})
