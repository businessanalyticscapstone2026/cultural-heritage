import { describe, it, expect } from "bun:test"
import { planRouteOptions, summarize, withDeltas, type PlanInput } from "./options"

/**
 * Point 0 is the start. Going 0->1->2->3 is short but slow (small roads);
 * 0->2->1->3 is longer but uses the fast highway.
 */
function base(overrides: Partial<PlanInput> = {}): PlanInput {
  return {
    legKm: [
      [0, 1, 5, 9],
      [1, 0, 1, 5],
      [5, 1, 0, 1],
      [9, 5, 1, 0],
    ],
    legMin: [
      [0, 30, 2, 40],
      [30, 0, 30, 2],
      [2, 30, 0, 35],
      [40, 2, 35, 0],
    ],
    towns: [null, "Taal", "Lemery", "Taal"],
    ratings: [0, 0.6, 0.7, 0.9],
    start: 0,
    roundTrip: false,
    maxTravelTimeMinutes: 480,
    preferShortestDistance: true,
    myOrder: null,
    ...overrides,
  }
}

describe("planRouteOptions", () => {
  it("Shortest minimizes distance and Fastest minimizes time, and they differ here", () => {
    const { options } = planRouteOptions(base())
    const shortest = options.find((o) => o.labels.includes("shortest"))!
    const fastest = options.find((o) => o.labels.includes("fastest"))!
    expect(shortest.order).toEqual([0, 1, 2, 3])
    expect(fastest.order).toEqual([0, 2, 1, 3])
    expect(shortest).not.toBe(fastest)
    expect(shortest.totalDistanceKm).toBeLessThanOrEqual(fastest.totalDistanceKm)
    expect(fastest.totalDurationMin).toBeLessThanOrEqual(shortest.totalDurationMin)
  })

  it("merges identical orders into one card and computes deltas vs Shortest", () => {
    const sameEverywhere = base({ legMin: base().legKm.map((r) => r.map((v) => v * 2)), towns: [null, "A", "A", "A"] })
    const { options } = planRouteOptions(sameEverywhere)
    const keys = options.map((o) => o.order.join(","))
    expect(new Set(keys).size).toBe(keys.length)
    const first = options[0]
    expect(first.labels).toContain("shortest")
    expect(first.labels).toContain("fastest")
    expect(first.deltaVsShortest).toEqual({ km: 0, min: 0 })

    const { options: differing } = planRouteOptions(base())
    const fastest = differing.find((o) => o.labels.includes("fastest"))!
    expect(fastest.deltaVsShortest.km).toBe(Math.round((fastest.totalDistanceKm - differing[0].totalDistanceKm) * 10) / 10)
    expect(fastest.deltaVsShortest.min).toBe(fastest.totalDurationMin - differing[0].totalDurationMin)
  })

  it("One town at a time never has more town changes than Shortest", () => {
    const { options } = planRouteOptions(base())
    const shortest = options.find((o) => o.labels.includes("shortest"))!
    const oneTown = options.find((o) => o.labels.includes("one-town"))!
    expect(oneTown.townChanges).toBeLessThanOrEqual(shortest.townChanges)
    expect(oneTown.townChanges).toBe(1)
  })

  it("Highlights puts the best-rated stops first when time allows", () => {
    const { options } = planRouteOptions(base())
    const highlights = options.find((o) => o.labels.includes("highlights"))!
    expect(highlights.order).toEqual([0, 3, 2, 1])
    expect(highlights.exceedsTimeLimit).toBe(false)
  })

  it("Highlights respects the time limit when possible", () => {
    // Fastest takes 34 min; best-rated-first takes 105 min.
    const { options } = planRouteOptions(base({ maxTravelTimeMinutes: 60 }))
    const highlights = options.find((o) => o.labels.includes("highlights"))!
    expect(highlights.totalDurationMin).toBeLessThanOrEqual(60)
    expect(highlights.exceedsTimeLimit).toBe(false)
  })

  it("sets exceedsTimeLimit when no order fits", () => {
    const { options } = planRouteOptions(base({ maxTravelTimeMinutes: 10 }))
    expect(options.every((o) => o.exceedsTimeLimit)).toBe(true)
    const highlights = options.find((o) => o.labels.includes("highlights"))!
    expect(highlights.order).toEqual([0, 3, 2, 1])
  })

  it("recommends Fastest when preferShortestDistance is false", () => {
    expect(planRouteOptions(base()).recommendedKind).toBe("shortest")
    expect(planRouteOptions(base({ preferShortestDistance: false })).recommendedKind).toBe("fastest")
  })

  it("adds My order only when asked", () => {
    expect(planRouteOptions(base()).options.some((o) => o.labels.includes("my-order"))).toBe(false)
    const { options } = planRouteOptions(base({ myOrder: [0, 3, 1, 2] }))
    expect(options.find((o) => o.labels.includes("my-order"))?.order).toEqual([0, 3, 1, 2])
  })

  it("round trip adds the leg back to the start", () => {
    const open = summarize([0, 1, 2, 3], base())
    const loop = summarize([0, 1, 2, 3], base({ roundTrip: true }))
    expect(loop.totalDistanceKm).toBe(open.totalDistanceKm + 9)
    expect(loop.totalDurationMin).toBe(open.totalDurationMin + 40)
  })

  it("withDeltas falls back to the first option when there is no Shortest card", () => {
    const out = withDeltas([
      { labels: ["fastest" as const], totalDistanceKm: 10, totalDurationMin: 20, deltaVsShortest: { km: 0, min: 0 } },
      { labels: ["balanced" as const], totalDistanceKm: 12.5, totalDurationMin: 18, deltaVsShortest: { km: 0, min: 0 } },
    ])
    expect(out[1].deltaVsShortest).toEqual({ km: 2.5, min: -2 })
  })
})
