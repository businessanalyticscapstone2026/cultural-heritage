import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test"
import {
  fetchDrivingDirections,
  fetchMultiStopRoadRoute,
  fetchDrivingAlternatives,
} from "./directions"

describe("fetchMultiStopRoadRoute", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("returns null if fewer than 2 waypoints are provided", async () => {
    const result = await fetchMultiStopRoadRoute([[120.649, 13.775]])
    expect(result).toBeNull()
  })

  it("parses multi-stop road route with geometry and legs from OSRM response", async () => {
    const mockOsmResponse = {
      code: "Ok",
      routes: [
        {
          geometry: {
            coordinates: [
              [120.649, 13.775],
              [120.648, 13.78],
              [120.635, 13.82],
              [120.614, 14.0845],
            ],
            type: "LineString",
          },
          distance: 41139,
          duration: 2670,
          legs: [
            { distance: 20000, duration: 1300 },
            { distance: 21139, duration: 1370 },
          ],
        },
      ],
    }

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockOsmResponse), { status: 200 })),
    ) as unknown as typeof fetch

    const result = await fetchMultiStopRoadRoute([
      [120.649, 13.775],
      [120.635, 13.82],
      [120.614, 14.0845],
    ])

    expect(result).not.toBeNull()
    expect(result?.coordinates).toHaveLength(4)
    expect(result?.totalDistanceKm).toBe(41.1)
    expect(result?.totalDurationMin).toBe(45)
    expect(result?.legs).toHaveLength(2)
    expect(result?.legs[0]).toEqual({ distanceKm: 20, durationMin: 22 })
    expect(result?.legs[1]).toEqual({ distanceKm: 21.1, durationMin: 23 })
  })

  it("returns null gracefully when response is not ok or json is malformed", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Service Unavailable", { status: 503 })),
    ) as unknown as typeof fetch

    const result = await fetchMultiStopRoadRoute([
      [120.649, 13.775],
      [120.614, 14.0845],
    ])
    expect(result).toBeNull()
  })

  it("returns null gracefully when fetch throws an error or aborts", async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error("Network timeout")),
    ) as unknown as typeof fetch

    const result = await fetchMultiStopRoadRoute([
      [120.649, 13.775],
      [120.614, 14.0845],
    ])
    expect(result).toBeNull()
  })
})

describe("fetchDrivingDirections", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("parses single pair driving directions from OSRM response", async () => {
    const mockOsmResponse = {
      code: "Ok",
      routes: [
        {
          geometry: {
            coordinates: [
              [120.649, 13.775],
              [120.614, 14.0845],
            ],
            type: "LineString",
          },
          distance: 41139,
          duration: 2670,
        },
      ],
    }

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockOsmResponse), { status: 200 })),
    ) as unknown as typeof fetch

    const result = await fetchDrivingDirections([120.649, 13.775], [120.614, 14.0845])

    expect(result).not.toBeNull()
    expect(result?.coordinates).toHaveLength(2)
    expect(result?.distanceKm).toBe(41.1)
    expect(result?.durationMin).toBe(45)
  })
})

describe("fetchDrivingAlternatives", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("asks OSRM for alternatives and returns the roads fastest first", async () => {
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(
        JSON.stringify({
          code: "Ok",
          routes: [
            { geometry: { coordinates: [[1, 1], [2, 2]] }, distance: 8000, duration: 900 },
            { geometry: { coordinates: [[1, 1], [3, 3], [2, 2]] }, distance: 9500, duration: 660 },
          ],
        }),
      )
    }) as unknown as typeof fetch

    const routes = await fetchDrivingAlternatives([1, 1], [2, 2])
    expect(calledUrl).toContain("alternatives=2")
    expect(routes?.map((r) => r.durationMin)).toEqual([11, 15])
    expect(routes?.[0].distanceKm).toBe(9.5)
  })

  it("returns null when OSRM fails or finds no road", async () => {
    globalThis.fetch = mock(async () => new Response(JSON.stringify({ code: "NoRoute", routes: [] }))) as unknown as typeof fetch
    expect(await fetchDrivingAlternatives([1, 1], [2, 2])).toBeNull()
    globalThis.fetch = mock(async () => {
      throw new Error("offline")
    }) as unknown as typeof fetch
    expect(await fetchDrivingAlternatives([1, 1], [2, 2])).toBeNull()
  })
})
