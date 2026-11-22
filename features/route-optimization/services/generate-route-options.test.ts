import { describe, it, expect, mock, afterEach, beforeEach } from "bun:test"

// Routing settings as the admin saved them: at most 3 stops.
const routingConfig = { maxStops: 3, maxTravelTimeMinutes: 480, preferShortestDistance: false }
mock.module("next/headers", () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }))
mock.module("@/utils/supabase/cached", () => ({
  createTokenClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { value: routingConfig }, error: null }) }) }),
    }),
  }),
}))

const { generateRouteOptions } = await import("./index")
const { clearMatrixCache } = await import("./matrix")

const site = (id: string, name: string, lat: number | null, lng: number | null, town = "Taal") => ({
  id,
  site_name: name,
  latitude: lat,
  longitude: lng,
  average_rating: 4,
  review_count: 3,
  municipality: { name: town },
  media: [],
})

const ID = {
  basilica: "0ef2c605-310f-4633-9e4e-f0d014c3bc49",
  ilagan: "dafb0b3f-a473-4640-aed5-19e4054d1649",
  lighthouse: "7886de8c-0d0a-4069-9ee7-fae95c598029",
  noCoords: "11111111-1111-4111-8111-111111111111",
  zero: "22222222-2222-4222-8222-222222222222",
}
const ROWS = [
  site(ID.basilica, "Taal Basilica", 13.880419, 120.924362),
  site(ID.ilagan, "Emma Ilagan House", 13.878331, 120.923779),
  site(ID.lighthouse, "Cape Santiago Lighthouse", 13.775, 120.649, "Calatagan"),
  site(ID.noCoords, "Old Well", null, null),
  site(ID.zero, "Zero House", 0, 0),
]

function fakeSupabase() {
  return {
    from: () => ({
      select: () => ({ in: async (_col: string, ids: string[]) => ({ data: ROWS.filter((r) => ids.includes(r.id)), error: null }) }),
    }),
  } as unknown as Parameters<typeof generateRouteOptions>[0]
}

const baseInput = { startMode: "first" as const, origin: null, roundTrip: false, travelMode: "auto" as const, includeMyOrder: false }

describe("generateRouteOptions", () => {
  const originalFetch = globalThis.fetch
  beforeEach(() => {
    clearMatrixCache()
    // Road service offline: every OSRM call fails.
    globalThis.fetch = mock(async () => {
      throw new Error("offline")
    }) as unknown as typeof fetch
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("rejects more stops than routing_config.maxStops with a clear message", async () => {
    const ids = [ID.basilica, ID.ilagan, ID.lighthouse, ID.noCoords]
    await expect(generateRouteOptions(fakeSupabase(), { ...baseInput, siteIds: ids })).rejects.toThrow(
      "A route can have at most 3 stops. You picked 4, please remove 1.",
    )
  })

  it("leaves out sites without a usable map location and never makes a 0,0 stop", async () => {
    const result = await generateRouteOptions(fakeSupabase(), { ...baseInput, siteIds: [ID.basilica, ID.zero, ID.ilagan] })
    expect(result.excludedSites).toEqual([{ id: ID.zero, name: "Zero House", reason: "No map location" }])
    for (const option of result.options) {
      expect(option.stops.map((s) => s.siteId).sort()).toEqual([ID.basilica, ID.ilagan].sort())
      expect(option.stops.every((s) => s.latitude !== 0 && s.longitude !== 0)).toBe(true)
    }
  })

  it("gives a friendly error when fewer than 2 sites can be routed", async () => {
    await expect(
      generateRouteOptions(fakeSupabase(), { ...baseInput, siteIds: [ID.basilica, ID.noCoords, ID.zero] }),
    ).rejects.toThrow("Not enough sites have map locations to build a route. Left out: Old Well, Zero House.")
  })

  it("still works offline: estimated numbers, dashed fallback line, Fastest recommended by setting", async () => {
    const result = await generateRouteOptions(fakeSupabase(), {
      ...baseInput,
      siteIds: [ID.lighthouse, ID.basilica, ID.ilagan],
      roundTrip: true,
    })
    expect(result.recommendedKind).toBe("fastest")
    expect(result.warnings[0]).toContain("estimated")
    expect(result.options.length).toBeGreaterThan(0)
    for (const option of result.options) {
      expect(option.estimated).toBe(true)
      expect(option.stops[0].siteId).toBe(ID.lighthouse) // "first stop I picked"
      expect(option.path.length).toBe(4) // 3 stops + back to start
      expect(option.totalDistanceKm).toBeGreaterThan(0)
    }
  })

  it("auto mode walks a town-centre tour (OSRM foot server) and drives across towns", async () => {
    const urls: string[] = []
    globalThis.fetch = mock(async (url: string) => {
      urls.push(String(url))
      throw new Error("offline")
    }) as unknown as typeof fetch

    const walk = await generateRouteOptions(fakeSupabase(), { ...baseInput, siteIds: [ID.basilica, ID.ilagan] })
    expect(walk.travelMode).toBe("walking")
    expect(urls.every((u) => u.includes("routed-foot"))).toBe(true)

    urls.length = 0
    const drive = await generateRouteOptions(fakeSupabase(), { ...baseInput, siteIds: [ID.basilica, ID.lighthouse] })
    expect(drive.travelMode).toBe("driving")
    expect(urls.some((u) => u.includes("routed-foot"))).toBe(false)

    const forced = await generateRouteOptions(fakeSupabase(), {
      ...baseInput,
      travelMode: "driving",
      siteIds: [ID.basilica, ID.ilagan],
    })
    expect(forced.travelMode).toBe("driving")
  })
})
