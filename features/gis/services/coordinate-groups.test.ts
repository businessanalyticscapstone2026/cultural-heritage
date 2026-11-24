import { describe, expect, test } from "bun:test"
import { SPIDERFY_MAX_SITES, groupByCoordinate, placeStackedSitesAtBarangay, spiderfyOffsets } from "./coordinate-groups"

describe("groupByCoordinate", () => {
  test("stacks sites with identical coordinates and skips unpinned sites", () => {
    const groups = groupByCoordinate([
      { id: "a", latitude: 13.8808, longitude: 120.9225 },
      { id: "b", latitude: 13.8808, longitude: 120.9225 },
      { id: "c", latitude: 13.88, longitude: 120.93 },
      { id: "d", latitude: null, longitude: null },
      { id: "e", latitude: 13.9, longitude: null },
    ])

    expect(groups).toHaveLength(2)
    expect(groups[0].sites.map((s) => s.id)).toEqual(["a", "b"])
    expect(groups[1].sites.map((s) => s.id)).toEqual(["c"])
    // Every pinned site lands in exactly one group: pinned + unpinned = total.
    expect(groups.reduce((n, g) => n + g.sites.length, 0)).toBe(3)
  })
})

describe("spiderfyOffsets", () => {
  test("fans small stacks into distinct pins that stay close to the real point", () => {
    for (let count = 2; count <= SPIDERFY_MAX_SITES; count++) {
      const offsets = spiderfyOffsets(count)
      expect(offsets).toHaveLength(count)
      expect(new Set(offsets.map((o) => o.join(","))).size).toBe(count)
      for (const [x, y] of offsets) {
        const distance = Math.hypot(x, y)
        expect(distance).toBeGreaterThan(20)
        // regression: a 45-site spiral reached ~1000px and drew pins over other towns
        expect(distance).toBeLessThanOrEqual(60)
      }
    }
  })

  test("never returns more offsets than SPIDERFY_MAX_SITES (large stacks use a list)", () => {
    expect(spiderfyOffsets(45)).toHaveLength(SPIDERFY_MAX_SITES)
  })
})

describe("placeStackedSitesAtBarangay", () => {
  const centres = { Taal: { "Poblacion 1": [13.8799, 120.9203] as [number, number], Seiran: [13.8866, 120.9207] as [number, number] } }
  const site = (id: string, barangay: string | null, lat: number | null, lng: number | null) => ({
    id, barangay, municipalityName: "Taal", latitude: lat, longitude: lng,
  })

  test("moves sites off a mixed-barangay placeholder to their barangay centre", () => {
    const placed = placeStackedSitesAtBarangay(
      [
        site("a", "Poblacion 1", 13.8808, 120.9225),
        site("b", "Seiran", 13.8808, 120.9225),
        site("c", "Mahabang Ludlod", 13.8808, 120.9225), // centre unknown: stays
        site("d", null, null, null), // no pin: untouched
      ],
      centres,
    )
    expect(placed.map((s) => [s.id, s.latitude, s.longitude, s.approximateLocation])).toEqual([
      ["a", 13.8799, 120.9203, "barangay"],
      ["b", 13.8866, 120.9207, "barangay"],
      ["c", 13.8808, 120.9225, null],
      ["d", null, null, null],
    ])
  })

  test("keeps same-barangay stacks and unique coordinates as recorded", () => {
    const placed = placeStackedSitesAtBarangay(
      [
        site("a", "Poblacion 1", 13.8766, 120.9207),
        site("b", "poblacion 1 ", 13.8766, 120.9207),
        site("c", "Seiran", 13.9, 120.95),
      ],
      centres,
    )
    expect(placed.every((s) => s.approximateLocation === null)).toBe(true)
    expect(placed.map((s) => s.latitude)).toEqual([13.8766, 13.8766, 13.9])
  })
})
