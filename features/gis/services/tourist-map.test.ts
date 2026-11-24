import { describe, expect, test, mock } from "bun:test"

/**
 * Fake Postgrest-like client for the tourist map query. Supabase resolves a
 * to-one embed (heritage_sites -> heritage_categories via category_id) as a
 * plain object, not an array — the builder here mirrors that real shape so
 * the test would have caught CHT-046 (category/municipality embeds were cast
 * as arrays and indexed with `?.[0]`, which silently discarded real data).
 */
function createFakeSupabase(rows: Record<string, unknown>[]) {
  function from(_table: string) {
    const builder: Record<string, unknown> = {}
    builder.select = () => builder
    builder.eq = () => builder
    builder.not = () => builder
    builder.order = () => builder
    builder.then = (
      onfulfilled?: ((value: { data: unknown; error: null }) => unknown) | null,
      onrejected?: ((reason: unknown) => unknown) | null,
    ) => Promise.resolve({ data: rows, error: null }).then(onfulfilled ?? undefined, onrejected ?? undefined)
    return builder
  }
  return { from }
}

function setup(rows: Record<string, unknown>[]) {
  const { from } = createFakeSupabase(rows)
  mock.module("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
  mock.module("@/utils/supabase/server", () => ({ createClient: () => ({ from }) }))
  mock.module("@/utils/supabase/cached", () => ({ createTokenClient: () => ({ from }) }))
}

const SITE_WITH_CATEGORY_ID = "11111111-1111-1111-1111-111111111111"
const SITE_WITHOUT_CATEGORY_ID = "22222222-2222-2222-2222-222222222222"

describe("getTouristMapSites", () => {
  test("maps a site with a category assigned — category/municipality embeds arrive as objects, not arrays", async () => {
    setup([
      {
        id: SITE_WITH_CATEGORY_ID,
        site_name: "Basilica of St. Martin of Tours",
        latitude: 13.8872,
        longitude: 120.9297,
        short_description: null,
        barangay: "Poblacion",
        municipality_id: "mun-1",
        category_id: "cat-1",
        average_rating: 4.8,
        review_count: 152,
        // Real Supabase shape for a belongs-to embed: a single object, not [obj].
        category: { name: "Religious", color: "#8B4513", icon: "Church" },
        municipality: { name: "Taal" },
        media: [],
      },
    ])

    const { getTouristMapSites } = await import("./tourist-map")
    const [site] = await getTouristMapSites()

    expect(site.categoryName).toBe("Religious")
    expect(site.categoryColor).toBe("#8B4513")
    expect(site.categoryIcon).toBe("Church")
    expect(site.municipalityName).toBe("Taal")
  })

  test("regression CHT-046: site with no category assigned (null category_id) does not throw and maps to nulls", async () => {
    setup([
      {
        id: SITE_WITHOUT_CATEGORY_ID,
        site_name: "Unclassified Heritage Site",
        latitude: 13.9,
        longitude: 120.9,
        short_description: null,
        barangay: null,
        municipality_id: null,
        category_id: null,
        average_rating: 0,
        review_count: 0,
        // Supabase returns null (not []) when the FK is null.
        category: null,
        municipality: null,
        media: [],
      },
    ])

    const { getTouristMapSites } = await import("./tourist-map")

    const sites = await getTouristMapSites()
    const [site] = sites

    expect(site.categoryId).toBeNull()
    expect(site.categoryName).toBeNull()
    expect(site.categoryColor).toBeNull()
    expect(site.municipalityId).toBeNull()
    expect(site.municipalityName).toBeNull()
  })

  test("keeps sites without coordinates (listed as 'No pin yet') and maps numeric strings to numbers", async () => {
    setup([
      {
        id: SITE_WITH_CATEGORY_ID,
        site_name: "Pinned Site",
        latitude: "13.880800",
        longitude: "120.922500",
        geo_accuracy: "approximate",
        category: null,
        municipality: null,
        media: [],
      },
      {
        id: SITE_WITHOUT_CATEGORY_ID,
        site_name: "Unpinned Site",
        latitude: null,
        longitude: null,
        geo_accuracy: null,
        category: null,
        municipality: null,
        media: [],
      },
    ])

    const { getTouristMapSites } = await import("./tourist-map")
    const [pinned, unpinned] = await getTouristMapSites()

    expect(pinned.latitude).toBe(13.8808)
    expect(pinned.longitude).toBe(120.9225)
    expect(pinned.geoAccuracy).toBe("approximate")
    expect(unpinned.latitude).toBeNull()
    expect(unpinned.longitude).toBeNull()
  })
})

describe("getCuratedTrails", () => {
  test("drops stops whose site has no coordinates instead of drawing them at 0,0", async () => {
    setup([
      {
        id: "route-1",
        name: "Taal Walk",
        total_distance_km: 1.2,
        total_duration_minutes: 30,
        stops: [
          { stop_order: 2, site: { id: "b", site_name: "No Pin", latitude: null, longitude: null } },
          { stop_order: 1, site: { id: "a", site_name: "Basilica", latitude: 13.8872, longitude: 120.9297 } },
        ],
      },
    ])

    const { getCuratedTrails } = await import("./tourist-map")
    const [trail] = await getCuratedTrails()

    expect(trail.stops).toEqual([
      { siteId: "a", siteName: "Basilica", stopOrder: 1, latitude: 13.8872, longitude: 120.9297 },
    ])
  })
})
