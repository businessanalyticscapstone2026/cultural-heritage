import { describe, expect, test, mock } from "bun:test"

/**
 * Fake in-memory Postgrest-like client, scoped to exactly what
 * createMtoSite / createHeritageSiteVersion / getMtoSiteById issue:
 * from().insert().select().single() and from().select(...).eq(...).maybeSingle().
 * Each table has an insertion-ordered response queue; the terminal call
 * (.single()/.maybeSingle()) pops the next queued response for that table.
 */
function createFakeSupabase(responses: Record<string, { data: unknown; error: unknown }[]>) {
  const queues: Record<string, { data: unknown; error: unknown }[]> = {}
  for (const [table, list] of Object.entries(responses)) queues[table] = [...list]

  const inserted: Record<string, unknown[]> = {}

  function from(table: string) {
    const builder: Record<string, unknown> = {}
    const resolve = () => {
      const next = queues[table]?.shift()
      if (!next) throw new Error(`No mocked response left for table "${table}"`)
      return next
    }
    builder.insert = (payload: unknown) => {
      inserted[table] = inserted[table] ?? []
      inserted[table].push(payload)
      return builder
    }
    builder.select = () => builder
    builder.eq = () => builder
    builder.neq = () => builder
    builder.ilike = () => builder
    builder.limit = () => builder
    builder.order = () => builder
    builder.delete = () => builder
    builder.single = () => Promise.resolve(resolve())
    builder.maybeSingle = () => Promise.resolve(resolve())
    return builder
  }

  return {
    client: { from, auth: { getUser: () => Promise.resolve({ data: { user: null } }) } },
    inserted,
  }
}

const MUNICIPALITY_ID = "11111111-1111-1111-1111-111111111111"
const STAFF_ID = "22222222-2222-2222-2222-222222222222"
const SITE_ID = "33333333-3333-3333-3333-333333333333"

describe("createMtoSite", () => {
  test("persists a site with no category selected and it is retrievable afterward", async () => {
    const rawSiteRow = {
      id: SITE_ID,
      site_name: "Taal Basilica",
      alternative_name: null,
      category_id: null,
      municipality_id: MUNICIPALITY_ID,
      barangay: null,
      exact_address: null,
      short_description: null,
      detailed_description: null,
      historical_period: null,
      year_established: null,
      architect_builder: null,
      architectural_style: null,
      designation: null,
      historical_significance: null,
      cultural_significance: null,
      latitude: null,
      longitude: null,
      elevation: null,
      geo_accuracy: null,
      accessibility_info: null,
      operating_hours: null,
      entrance_fee: null,
      publication_status: "draft",
      is_featured: false,
      visibility: "public",
      created_by: STAFF_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const fullSiteRow = { ...rawSiteRow, category: null, tags: [], media: [], reference_links: [], creator: null }

    const { client, inserted } = createFakeSupabase({
      heritage_sites: [
        { data: null, error: null }, // duplicate-name check: no existing match
        { data: { id: SITE_ID }, error: null }, // insert().select("id").single()
        { data: rawSiteRow, error: null }, // raw snapshot select().single()
        { data: fullSiteRow, error: null }, // getMtoSiteById embedded select().maybeSingle()
      ],
      heritage_site_versions: [{ data: { ...rawSiteRow, id: "v1", snapshot: rawSiteRow }, error: null }],
    })

    mock.module("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
    mock.module("@/utils/supabase/server", () => ({ createClient: () => client }))

    const { createMtoSite } = await import("./mto-sites")

    const result = await createMtoSite(
      {
        siteName: "Taal Basilica",
        categoryId: null, // simulates the unselected <select> after schema preprocessing
        municipalityId: MUNICIPALITY_ID,
      },
      STAFF_ID,
    )

    const insertPayload = inserted.heritage_sites[0] as Record<string, unknown>
    expect(insertPayload.site_name).toBe("Taal Basilica")
    expect(insertPayload.category_id).toBeNull()
    expect(insertPayload.municipality_id).toBe(MUNICIPALITY_ID)
    expect(insertPayload.created_by).toBe(STAFF_ID)

    // The site is retrievable (round-tripped through getMtoSiteById) after creation.
    expect(result.id).toBe(SITE_ID)
    expect(result.siteName).toBe("Taal Basilica")
    expect(result.municipalityId).toBe(MUNICIPALITY_ID)
  })

  test("rejects a duplicate site name within the same municipality", async () => {
    // Regression: CHT-037 — production had two "Taal Basilica" rows in the same
    // municipality (one archived, one published). Creation must be blocked
    // before insert, matched case-insensitively and trimmed, regardless of the
    // existing row's publication_status.
    const existingMatch = {
      id: "44444444-4444-4444-4444-444444444444",
      site_name: "Taal Basilica",
      publication_status: "archived",
      municipality: { name: "Taal" },
    }

    const { client, inserted } = createFakeSupabase({
      heritage_sites: [
        { data: existingMatch, error: null }, // duplicate-name check finds the archived row
      ],
    })

    mock.module("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
    mock.module("@/utils/supabase/server", () => ({ createClient: () => client }))

    const { createMtoSite } = await import("./mto-sites")

    await expect(
      createMtoSite(
        {
          siteName: "  taal basilica  ", // untrimmed, different case — must still match
          categoryId: null,
          municipalityId: MUNICIPALITY_ID,
        },
        STAFF_ID,
      ),
    ).rejects.toThrow('A heritage site named "Taal Basilica" already exists in Taal.')

    // No insert should have been attempted once the duplicate was found.
    expect(inserted.heritage_sites).toBeUndefined()
  })
})
