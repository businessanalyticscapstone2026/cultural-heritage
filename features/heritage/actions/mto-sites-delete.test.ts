import { describe, expect, test, mock } from "bun:test"

const MUNI = "11111111-1111-4111-8111-111111111111"
const STAFF = "22222222-2222-4222-8222-222222222222"
const SITE_A = "33333333-3333-4333-8333-333333333333"
const SITE_B = "44444444-4444-4444-8444-444444444444"

type FakeResp = { data?: unknown; error?: unknown }

function createDeleteFakeSupabase(handlers: {
  onQuery?: (table: string, op: string, filter: Record<string, unknown>) => FakeResp
} = {}) {
  function respond(table: string, op: string, filter: Record<string, unknown>): FakeResp {
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
      auth: {
        getUser: async () => ({ data: { user: { id: STAFF } }, error: null }),
      },
    },
  }
}

describe("deleteMtoSitesAction", () => {
  test("returns per-site results for a mixed success/failure batch", async () => {
    const auditCalls: unknown[] = []
    const { client } = createDeleteFakeSupabase({
      onQuery: (table, op, filter) => {
        if (table === "staff_profiles") {
          return { data: { id: STAFF, municipality_id: MUNI, first_name: "Balayan", last_name: "MTO" }, error: null }
        }
        if (table === "heritage_sites" && op === "select") {
          return {
            data: {
              id: filter.id,
              site_name: filter.id === SITE_A ? "Site A" : "Site B",
              municipality_id: MUNI,
              publication_status: "archived",
            },
            error: null,
          }
        }
        if (table === "reviews" || table === "qr_codes") return { data: [], error: null }
        if (table === "heritage_sites" && op === "delete") {
          if (filter.id === SITE_A) return { data: [{ id: SITE_A }], error: null }
          return { data: null, error: { code: "23503", message: 'violates foreign key "reviews_site_id_fkey"' } }
        }
        return { data: null, error: null }
      },
    })

    mock.module("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
    mock.module("@/utils/supabase/server", () => ({ createClient: () => client }))
    mock.module("next/cache", () => ({ revalidatePath: () => {}, revalidateTag: () => {} }))
    mock.module("@/features/audit/services", () => ({
      logAuditEvent: async (params: unknown) => { auditCalls.push(params) },
    }))

    const { deleteMtoSitesAction } = await import("./mto-sites")

    const result = await deleteMtoSitesAction([SITE_A, SITE_B])

    expect(result.deleted.map((d) => d.id)).toEqual([SITE_A])
    expect(result.deleted[0].siteName).toBe("Site A")
    expect(result.failed.map((f) => f.id)).toEqual([SITE_B])
    expect(result.failed[0].reason).toContain("still referenced")

    // One audit entry per deleted site only.
    expect(auditCalls.length).toBe(1)
  })
})
