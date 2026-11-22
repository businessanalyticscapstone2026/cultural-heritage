import { describe, it, expect, afterEach, beforeEach, mock } from "bun:test"
import { getRoadMatrix, clearMatrixCache, coordinateProblem } from "./matrix"

const A = { id: "a", latitude: 13.8783, longitude: 120.9238 }
const B = { id: "b", latitude: 13.775, longitude: 120.649 }

describe("getRoadMatrix", () => {
  const originalFetch = globalThis.fetch
  beforeEach(() => clearMatrixCache())
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("parses an OSRM table response (metres/seconds to km/min) in the caller's order", async () => {
    // OSRM sees the points sorted by id: a, b. Values are asymmetric on purpose.
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ code: "Ok", distances: [[0, 30000], [31000, 0]], durations: [[0, 1800], [1860, 0]] })),
    ) as unknown as typeof fetch

    const m = await getRoadMatrix([B, A])
    expect(m.estimated).toBe(false)
    expect(m.distanceKm).toEqual([[0, 31], [30, 0]])
    expect(m.durationMin).toEqual([[0, 31], [30, 0]])
  })

  it("falls back to straight-line estimates when OSRM fails", async () => {
    globalThis.fetch = mock(async () => {
      throw new Error("offline")
    }) as unknown as typeof fetch

    const m = await getRoadMatrix([A, B])
    expect(m.estimated).toBe(true)
    expect(m.distanceKm[0][1]).toBeGreaterThan(30)
    expect(m.distanceKm[0][1]).toBeCloseTo(m.distanceKm[1][0], 6)
    expect(m.durationMin[0][1]).toBeCloseTo((m.distanceKm[0][1] / 40) * 60, 6)
  })

  it("uses an estimate for a pair OSRM returns as null", async () => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ code: "Ok", distances: [[0, null], [31000, 0]], durations: [[0, null], [1860, 0]] })),
    ) as unknown as typeof fetch
    const m = await getRoadMatrix([A, B])
    expect(m.estimated).toBe(true)
    expect(m.distanceKm[1][0]).toBe(31)
  })

  it("serves the same set of points from the cache (no second fetch)", async () => {
    const fetchMock = mock(async () =>
      new Response(JSON.stringify({ code: "Ok", distances: [[0, 1000], [1000, 0]], durations: [[0, 60], [60, 0]] })),
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch
    await getRoadMatrix([A, B])
    const again = await getRoadMatrix([B, A])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(again.distanceKm).toEqual([[0, 1], [1, 0]])
  })

  it("does not cache estimates, so a recovered OSRM is used next time", async () => {
    const fetchMock = mock(async () => new Response("down", { status: 503 }))
    globalThis.fetch = fetchMock as unknown as typeof fetch
    await getRoadMatrix([A, B])
    await getRoadMatrix([A, B])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe("coordinateProblem", () => {
  it("rejects null, 0/0 and out-of-Batangas coordinates with a reason", () => {
    expect(coordinateProblem(null, 120.9)).toBe("No map location")
    expect(coordinateProblem(13.8, null)).toBe("No map location")
    expect(coordinateProblem(0, 0)).toBe("No map location")
    expect(coordinateProblem(14.6, 121.0)).toBe("Map location is outside Batangas") // Manila
    expect(coordinateProblem(13.88, 120.92)).toBeNull()
  })
})
