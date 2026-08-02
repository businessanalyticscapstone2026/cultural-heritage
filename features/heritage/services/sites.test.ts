import { describe, expect, test, mock } from "bun:test"

/**
 * Fake Postgrest-like client for heritage_sites that actually applies the
 * chained .eq() filters against an in-memory fixture table, so these tests
 * exercise the real publication_status/visibility guard logic in
 * getHeritageSiteById rather than a canned response queue.
 */
function createFakeSupabase(rows: Record<string, unknown>[]) {
  function from(_table: string) {
    const filters: Record<string, unknown> = {}
    const builder: Record<string, unknown> = {}
    builder.select = () => builder
    builder.eq = (col: string, val: unknown) => {
      filters[col] = val
      return builder
    }
    builder.order = () => builder
    const resolve = () => {
      const match = rows.find((row) =>
        Object.entries(filters).every(([k, v]) => row[k] === v),
      )
      return { data: match ?? null, error: null }
    }
    builder.maybeSingle = () => Promise.resolve(resolve())
    builder.single = () => Promise.resolve(resolve())
    return builder
  }
  return { from }
}

const PUBLISHED_ID = "11111111-1111-1111-1111-111111111111"
const ARCHIVED_ID = "22222222-2222-2222-2222-222222222222"
const DRAFT_ID = "33333333-3333-3333-3333-333333333333"
const NONEXISTENT_ID = "99999999-9999-9999-9999-999999999999"

function baseRow(overrides: Record<string, unknown>) {
  return {
    site_name: "Taal Basilica",
    category: null,
    municipality: null,
    tags: [],
    media: [],
    reference_links: [],
    ...overrides,
  }
}

const FIXTURE_ROWS = [
  baseRow({ id: PUBLISHED_ID, publication_status: "published", visibility: "public" }),
  // CHT-037: archived duplicate row with the same name — must legitimately 404 for tourists.
  baseRow({ id: ARCHIVED_ID, publication_status: "archived", visibility: "public" }),
  baseRow({ id: DRAFT_ID, publication_status: "draft", visibility: "public" }),
]

function setup() {
  const { from } = createFakeSupabase(FIXTURE_ROWS)
  mock.module("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
  mock.module("@/utils/supabase/server", () => ({ createClient: () => ({ from }) }))
}

describe("getHeritageSiteById", () => {
  test("published + public site is returned", async () => {
    setup()
    const { getHeritageSiteById } = await import("./sites")

    const site = await getHeritageSiteById(PUBLISHED_ID)

    expect(site).not.toBeNull()
    expect(site?.id).toBe(PUBLISHED_ID)
    expect(site?.publicationStatus).toBe("published")
  })

  test("archived site is guarded out (null), not an error", async () => {
    setup()
    const { getHeritageSiteById } = await import("./sites")

    const site = await getHeritageSiteById(ARCHIVED_ID)

    expect(site).toBeNull()
  })

  test("draft site is guarded out (null), not an error", async () => {
    setup()
    const { getHeritageSiteById } = await import("./sites")

    const site = await getHeritageSiteById(DRAFT_ID)

    expect(site).toBeNull()
  })

  test("nonexistent id returns null", async () => {
    setup()
    const { getHeritageSiteById } = await import("./sites")

    const site = await getHeritageSiteById(NONEXISTENT_ID)

    expect(site).toBeNull()
  })
})
