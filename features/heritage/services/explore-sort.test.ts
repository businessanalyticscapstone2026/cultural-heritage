import { describe, expect, test } from "bun:test"
import {
  DEFAULT_EXPLORE_SORT,
  compareByName,
  parseExploreOrigin,
  parseExploreSort,
  resolveExploreSort,
  sortExploreRows,
  type ExploreSortRow,
} from "./explore-sort"

function row(overrides: Partial<ExploreSortRow> & { id: string }): ExploreSortRow {
  return {
    siteName: overrides.id,
    latitude: null,
    longitude: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("parseExploreSort", () => {
  test("valid value is kept", () => {
    expect(parseExploreSort("alphabetical")).toBe("alphabetical")
    expect(parseExploreSort("distance")).toBe("distance")
    expect(parseExploreSort("recommended")).toBe("recommended")
  })

  test("invalid value falls back to default", () => {
    expect(parseExploreSort("bogus")).toBe(DEFAULT_EXPLORE_SORT)
  })

  test("undefined falls back to default", () => {
    expect(parseExploreSort(undefined)).toBe(DEFAULT_EXPLORE_SORT)
  })
})

describe("parseExploreOrigin", () => {
  test("valid pair returns numbers", () => {
    expect(parseExploreOrigin("13.75", "121.05")).toEqual({
      latitude: 13.75,
      longitude: 121.05,
    })
  })

  test("missing values return null", () => {
    expect(parseExploreOrigin(undefined, "121.05")).toBeNull()
    expect(parseExploreOrigin("13.75", undefined)).toBeNull()
    expect(parseExploreOrigin("", "")).toBeNull()
  })

  test("non-numeric values return null", () => {
    expect(parseExploreOrigin("abc", "121.05")).toBeNull()
  })

  test("latitude outside range returns null", () => {
    expect(parseExploreOrigin("91", "121.05")).toBeNull()
  })

  test("longitude outside range returns null", () => {
    expect(parseExploreOrigin("13.75", "181")).toBeNull()
  })
})

describe("resolveExploreSort", () => {
  test("distance without origin falls back to recommended", () => {
    expect(resolveExploreSort("distance", null)).toBe("recommended")
  })

  test("distance with origin stays distance", () => {
    expect(resolveExploreSort("distance", { latitude: 13.75, longitude: 121.05 })).toBe("distance")
  })
})

describe("compareByName", () => {
  test("sorts case-insensitively", () => {
    expect(compareByName("agido", "Bravo")).toBeLessThan(0)
  })
})

describe("sortExploreRows", () => {
  test("alphabetical order", () => {
    const rows = [
      row({ id: "1", siteName: "Susan" }),
      row({ id: "2", siteName: "Ernesto" }),
      row({ id: "3", siteName: "Agido" }),
      row({ id: "4", siteName: "Consuela" }),
    ]

    const result = sortExploreRows(rows, {
      sort: "alphabetical",
      recommendedIds: new Set(),
      origin: null,
    })

    expect(result.orderedIds).toEqual(["3", "4", "2", "1"])
  })

  test("alphabetical is case-insensitive", () => {
    const rows = [row({ id: "1", siteName: "Bravo" }), row({ id: "2", siteName: "agido" })]

    const result = sortExploreRows(rows, {
      sort: "alphabetical",
      recommendedIds: new Set(),
      origin: null,
    })

    expect(result.orderedIds).toEqual(["2", "1"])
  })

  test("recommended first, each group newest first", () => {
    const rows = [
      row({ id: "a", createdAt: "2024-01-01T00:00:00.000Z" }),
      row({ id: "b", createdAt: "2024-03-01T00:00:00.000Z" }),
      row({ id: "c", createdAt: "2024-02-01T00:00:00.000Z" }),
      row({ id: "d", createdAt: "2024-04-01T00:00:00.000Z" }),
    ]

    const result = sortExploreRows(rows, {
      sort: "recommended",
      recommendedIds: new Set(["a", "c"]),
      origin: null,
    })

    expect(result.orderedIds).toEqual(["c", "a", "d", "b"])
  })

  test("distance sorts closest first and puts rows without coordinates last", () => {
    const origin = { latitude: 13.75, longitude: 121.05 }
    const rows = [
      row({ id: "far", siteName: "Zeta", latitude: 14.5, longitude: 121.5 }),
      row({ id: "no-coords", siteName: "Alpha", latitude: null, longitude: null }),
      row({ id: "near", siteName: "Beta", latitude: 13.7501, longitude: 121.0501 }),
    ]

    const result = sortExploreRows(rows, {
      sort: "distance",
      recommendedIds: new Set(),
      origin,
    })

    expect(result.orderedIds).toEqual(["near", "far", "no-coords"])
    expect(result.distancesKm.near).toBeGreaterThan(0)
    expect(result.distancesKm.far).toBeGreaterThan(0)
    expect(result.distancesKm["no-coords"]).toBeUndefined()
    expect(Object.keys(result.distancesKm).sort()).toEqual(["far", "near"])
  })

  test("distance without origin behaves like recommended", () => {
    const rows = [
      row({ id: "a", createdAt: "2024-01-01T00:00:00.000Z" }),
      row({ id: "b", createdAt: "2024-03-01T00:00:00.000Z" }),
    ]

    const result = sortExploreRows(rows, {
      sort: "distance",
      recommendedIds: new Set(),
      origin: null,
    })

    expect(result.orderedIds).toEqual(["b", "a"])
    expect(result.distancesKm).toEqual({})
  })

  test("does not mutate the input array", () => {
    const rows = [
      row({ id: "1", siteName: "Susan" }),
      row({ id: "2", siteName: "Agido" }),
    ]
    const original = [...rows]

    sortExploreRows(rows, {
      sort: "alphabetical",
      recommendedIds: new Set(),
      origin: null,
    })

    expect(rows).toEqual(original)
  })
})
