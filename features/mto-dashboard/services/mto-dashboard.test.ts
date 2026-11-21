import { describe, expect, it } from "bun:test"
import { computeChange, deriveMTODashboardInsights } from "./insights"
import type {
  DashboardStat,
  MonthlyVisitsPoint,
  TopAttraction,
  CategoryDistributionPoint,
  ScanDeviceBreakdownPoint,
  VisitorStats,
} from "@/types/mto-dashboard"

describe("computeChange", () => {
  it("handles zero prior and zero current as stable 0%", () => {
    expect(computeChange(0, 0)).toEqual({ changePercent: 0, changeDirection: "stable" })
  })

  it("handles zero prior and positive current as up 100%", () => {
    expect(computeChange(15, 0)).toEqual({ changePercent: 100, changeDirection: "up" })
  })

  it("computes positive growth correctly", () => {
    expect(computeChange(150, 100)).toEqual({ changePercent: 50, changeDirection: "up" })
  })

  it("computes negative growth correctly", () => {
    expect(computeChange(75, 100)).toEqual({ changePercent: 25, changeDirection: "down" })
  })

  it("handles identical non-zero values as stable 0%", () => {
    expect(computeChange(50, 50)).toEqual({ changePercent: 0, changeDirection: "stable" })
  })
})

describe("deriveMTODashboardInsights", () => {
  const dummyStats: DashboardStat[] = [
    {
      label: "QR Scans",
      value: 120,
      changePercent: 25,
      changeDirection: "up",
      icon: "ScanLine",
      description: "this month",
    },
  ]

  const dummyVisitsOverview: MonthlyVisitsPoint[] = []

  const dummyTopAttractions: TopAttraction[] = [
    {
      siteId: "site-1",
      siteName: "Taal Heritage Village",
      visits: 450,
      percentage: 60,
    },
  ]

  const dummyCategoryDistribution: CategoryDistributionPoint[] = [
    {
      name: "Natural",
      count: 8,
      percentage: 50,
      color: "#2E5BFF",
    },
  ]

  const dummyScanDeviceBreakdown: ScanDeviceBreakdownPoint[] = []

  const dummyVisitorStats: VisitorStats = {
    local: 100,
    domestic: 200,
    international: 50,
    totalVisits: 350,
  }

  it("derives all key insights with formatted category and non-local visitor calculations", () => {
    const insights = deriveMTODashboardInsights({
      stats: dummyStats,
      visitsOverview: dummyVisitsOverview,
      topAttractions: dummyTopAttractions,
      categoryDistribution: dummyCategoryDistribution,
      scanDeviceBreakdown: dummyScanDeviceBreakdown,
      visitorStats: dummyVisitorStats,
    })

    // 1. Scans momentum
    const scansInsight = insights.find((i) => i.id === "scans-momentum")
    expect(scansInsight).toBeDefined()
    expect(scansInsight?.value).toBe("+25%")
    expect(scansInsight?.tone).toBe("positive")

    // 2. Top attraction
    const topAttractionInsight = insights.find((i) => i.id === "top-attraction")
    expect(topAttractionInsight).toBeDefined()
    expect(topAttractionInsight?.value).toBe("Taal Heritage Village")

    // 3. Top category formatted as "Natural Attraction"
    const topCategoryInsight = insights.find((i) => i.id === "top-category")
    expect(topCategoryInsight).toBeDefined()
    expect(topCategoryInsight?.value).toBe("Natural Attraction")

    // 4. Non-local visitors (domestic 200 + international 50 = 250 / 350 = 71%)
    const nonLocalInsight = insights.find((i) => i.id === "non-local-share")
    expect(nonLocalInsight).toBeDefined()
    expect(nonLocalInsight?.label).toBe("Non-Local Visitors")
    expect(nonLocalInsight?.value).toBe("71%")
  })
})
