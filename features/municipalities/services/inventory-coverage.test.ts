import { describe, expect, test } from "bun:test"
import { computeInventoryCoverage } from "./inventory-coverage"

describe("computeInventoryCoverage", () => {
  const municipalities = [
    { id: "taal", name: "Taal", documented_site_count: 147 },
    { id: "calaca", name: "Calaca", documented_site_count: 3 },
    { id: "new", name: "New Town", documented_site_count: null },
  ]

  test("counts encoded sites live and caps coverage at 100% with a review flag", () => {
    const ids = [
      ...Array<string>(74).fill("taal"),
      ...Array<string>(6).fill("calaca"),
      "new",
      null,
    ]
    const coverage = computeInventoryCoverage(municipalities, ids)

    const taal = coverage.rows.find((r) => r.name === "Taal")!
    expect(taal).toMatchObject({ encoded: 74, documented: 147, percent: 50.3, needsReview: false })

    const calaca = coverage.rows.find((r) => r.name === "Calaca")!
    expect(calaca).toMatchObject({ encoded: 6, documented: 3, percent: 100, needsReview: true })

    const unknown = coverage.rows.find((r) => r.name === "New Town")!
    expect(unknown).toMatchObject({ encoded: 1, documented: null, percent: null, needsReview: false })

    expect(coverage.totalEncoded).toBe(81)
    expect(coverage.totalDocumented).toBe(150)
    expect(coverage.percent).toBe(54)
    expect(coverage.needsReview).toBe(true)
  })

  test("paper Table 4.1 totals: 105 encoded of 180 documented is 58.3%", () => {
    const docs = { Balayan: 8, Calaca: 3, Calatagan: 4, Lemery: 4, Lian: 4, Nasugbu: 6, Taal: 147, Tuy: 4 }
    const live = { Balayan: 7, Calaca: 6, Calatagan: 5, Lemery: 3, Lian: 3, Nasugbu: 4, Taal: 74, Tuy: 3 }
    const muns = Object.entries(docs).map(([name, n]) => ({ id: name, name, documented_site_count: n }))
    const ids = Object.entries(live).flatMap(([name, n]) => Array<string>(n).fill(name))

    const coverage = computeInventoryCoverage(muns, ids)
    expect(coverage.totalEncoded).toBe(105)
    expect(coverage.totalDocumented).toBe(180)
    expect(coverage.percent).toBe(58.3)
    expect(coverage.rows.filter((r) => r.needsReview).map((r) => r.name)).toEqual(["Calaca", "Calatagan"])
  })
})
