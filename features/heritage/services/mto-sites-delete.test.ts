import { describe, expect, test, mock } from "bun:test"
import { SiteDeleteError } from "../errors"

/**
 * Thenable fake Supabase client for the delete flow. Routes every query through
 * an optional handler (table, op, filter) -> { data, error }, and records all
 * calls so tests can assert ordering/params. `select()` is treated as a row
 * modifier (it does not change the DML operation set by delete/insert/update).
 */
type FakeResp = { data?: unknown; error?: unknown }

function createDeleteFakeSupabase(handlers: {
  onQuery?: (table: string, op: string, filter: Record<string, unknown>) => FakeResp
} = {}) {
  const calls: { table: string; op: string; filter: Record<string, unknown> }[] = []

  function respond(table: string, op: string, filter: Record<string, unknown>): FakeResp {
    calls.push({ table, op, filter })
    if (handlers.onQuery) return handlers.onQuery(table, op, filter)
    return { data: null, error: null }
  }

  function from(table: string) {
    let op = "select"
    const filter: Record<string, unknown> = {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builder: any = {
      select: () => builder,
      delete: () => { op = "delete"; return builder },
      insert: () => { op = "insert"; return builder },
      update: () => { op = "update"; return builder },
      eq: (col: string, val: unknown) => { filter[col] = val; return builder },
      neq: (col: string, val: unknown) => { filter[col] = val; return builder },
      in: (col: string, vals: unknown[]) => { filter[col] = vals; return builder },
      order: () => builder,
      limit: () => builder,
      ilike: () => builder,
      maybeSingle: () => {
        const r = respond(table, op, filter)
        return Promise.resolve({ data: r.data ?? null, error: r.error ?? null })
      },
      single: () => {
        const r = respond(table, op, filter)
        return Promise.resolve(r)
      },
      then: (resolve: (v: unknown) => void) => {
        const r = respond(table, op, filter)
        resolve({ data: r.data ?? null, error: r.error ?? null })
      },
    }
    return builder
  }

  return {
    client: {
      from,
      auth: { getUser: async () => ({ data: { user: { id: "00000000-0000-0000-0000-000000000000" } }, error: null }) },
    },
    calls,
  }
}

const MUNI = "11111111-1111-1111-1111-111111111111"
const OTHER_MUNI = "99999999-9999-9999-9999-999999999999"
const SITE_ID = "33333333-3333-3333-3333-333333333333"

function archivedSite(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: SITE_ID,
    site_name: "Balayan Church",
    municipality_id: MUNI,
    publication_status: "archived",
    ...overrides,
  }
}

async function captureReason(promise: Promise<unknown>): Promise<SiteDeleteError["reason"]> {
  try {
    await promise
  } catch (err) {
    expect(err).toBeInstanceOf(SiteDeleteError)
    return (err as SiteDeleteError).reason
  }
  throw new Error("expected the promise to reject")
}

describe("deleteMtoSite", () => {
  test("deletes an archived site in the caller's municipality", async () => {
    const { client, calls } = createDeleteFakeSupabase({
      onQuery: (table, op) => {
        if (table === "heritage_sites" && op === "select") return { data: archivedSite(), error: null }
        if (table === "reviews" || table === "qr_codes") return { data: [], error: null }
        if (table === "heritage_sites" && op === "delete") return { data: [{ id: SITE_ID }], error: null }
        return { data: null, error: null }
      },
    })

    mock.module("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
    mock.module("@/utils/supabase/server", () => ({ createClient: () => client }))

    const { deleteMtoSite } = await import("./mto-sites")

    const result = await deleteMtoSite(SITE_ID, MUNI)
    expect(result.siteName).toBe("Balayan Church")

    // The final delete must be issued with the municipality guard.
    const finalDelete = calls.find(
      (c) => c.table === "heritage_sites" && c.op === "delete"
    )
    expect(finalDelete?.filter).toMatchObject({ id: SITE_ID, municipality_id: MUNI })
  })

  test("rejects a site that is not archived", async () => {
    const { client } = createDeleteFakeSupabase({
      onQuery: (table, op) => {
        if (table === "heritage_sites" && op === "select") {
          return { data: archivedSite({ publication_status: "draft" }), error: null }
        }
        return { data: null, error: null }
      },
    })

    mock.module("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
    mock.module("@/utils/supabase/server", () => ({ createClient: () => client }))

    const { deleteMtoSite } = await import("./mto-sites")

    expect(await captureReason(deleteMtoSite(SITE_ID, MUNI))).toBe("not_archived")
  })

  test("rejects a site from another municipality", async () => {
    const { client } = createDeleteFakeSupabase({
      onQuery: (table, op) => {
        if (table === "heritage_sites" && op === "select") {
          return { data: archivedSite({ municipality_id: OTHER_MUNI }), error: null }
        }
        return { data: null, error: null }
      },
    })

    mock.module("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
    mock.module("@/utils/supabase/server", () => ({ createClient: () => client }))

    const { deleteMtoSite } = await import("./mto-sites")

    expect(await captureReason(deleteMtoSite(SITE_ID, MUNI))).toBe("wrong_municipality")
  })

  test("rejects a missing site", async () => {
    const { client } = createDeleteFakeSupabase({
      onQuery: (table, op) => {
        if (table === "heritage_sites" && op === "select") return { data: null, error: null }
        return { data: null, error: null }
      },
    })

    mock.module("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
    mock.module("@/utils/supabase/server", () => ({ createClient: () => client }))

    const { deleteMtoSite } = await import("./mto-sites")

    expect(await captureReason(deleteMtoSite(SITE_ID, MUNI))).toBe("not_found")
  })

  test("surfaces an FK violation as still-referenced, not success", async () => {
    const { client } = createDeleteFakeSupabase({
      onQuery: (table, op) => {
        if (table === "heritage_sites" && op === "select") return { data: archivedSite(), error: null }
        if (table === "reviews" || table === "qr_codes") return { data: [], error: null }
        if (table === "heritage_sites" && op === "delete") {
          return {
            data: null,
            error: { code: "23503", message: 'violates foreign key "qr_codes_site_id_fkey"' },
          }
        }
        return { data: null, error: null }
      },
    })

    mock.module("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
    mock.module("@/utils/supabase/server", () => ({ createClient: () => client }))

    const { deleteMtoSite } = await import("./mto-sites")

    expect(await captureReason(deleteMtoSite(SITE_ID, MUNI))).toBe("still_referenced")
  })

  test("surfaces a silent 0-row delete as permission-denied, not success", async () => {
    const { client } = createDeleteFakeSupabase({
      onQuery: (table, op) => {
        if (table === "heritage_sites" && op === "select") return { data: archivedSite(), error: null }
        if (table === "reviews" || table === "qr_codes") return { data: [], error: null }
        if (table === "heritage_sites" && op === "delete") return { data: [], error: null }
        return { data: null, error: null }
      },
    })

    mock.module("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
    mock.module("@/utils/supabase/server", () => ({ createClient: () => client }))

    const { deleteMtoSite } = await import("./mto-sites")

    expect(await captureReason(deleteMtoSite(SITE_ID, MUNI))).toBe("permission_denied")
  })
})
