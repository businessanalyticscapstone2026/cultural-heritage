import { formatCategoryName } from "@/lib/format-category"
import type {
  DashboardStat,
  MonthlyVisitsPoint,
  TopAttraction,
  CategoryDistributionPoint,
  ScanDeviceBreakdownPoint,
  VisitorStats,
  DashboardInsight,
} from "@/types/mto-dashboard"

export function computeChange(
  current: number,
  prior: number,
): { changePercent: number; changeDirection: "up" | "down" | "stable" } {
  if (prior === 0 && current === 0) return { changePercent: 0, changeDirection: "stable" }
  if (prior === 0) return { changePercent: 100, changeDirection: "up" }
  const pct = Math.round(((current - prior) / prior) * 100)
  return {
    changePercent: Math.abs(pct),
    changeDirection: pct > 0 ? "up" : pct < 0 ? "down" : "stable",
  }
}

export function deriveMTODashboardInsights(deps: {
  stats: DashboardStat[]
  visitsOverview: MonthlyVisitsPoint[]
  topAttractions: TopAttraction[]
  categoryDistribution: CategoryDistributionPoint[]
  scanDeviceBreakdown: ScanDeviceBreakdownPoint[]
  visitorStats: VisitorStats
}): DashboardInsight[] {
  const insights: DashboardInsight[] = []

  const scansStat = deps.stats.find((s) => s.label === "QR Scans")
  if (scansStat && scansStat.changeDirection !== "stable") {
    const rising = scansStat.changeDirection === "up"
    insights.push({
      id: "scans-momentum",
      label: "QR Scans",
      value: `${rising ? "+" : "-"}${scansStat.changePercent}%`,
      detail: rising ? "Scans are up vs last month" : "Scans are down vs last month",
      tone: rising ? "positive" : "negative",
      icon: "ScanLine",
    })
  } else if (scansStat) {
    insights.push({
      id: "scans-momentum",
      label: "QR Scans",
      value: "Flat",
      detail: "Scan volume is steady vs last month",
      tone: "neutral",
      icon: "ScanLine",
    })
  }

  const top = deps.topAttractions[0]
  if (top) {
    insights.push({
      id: "top-attraction",
      label: "Top Attraction",
      value: top.siteName,
      detail: `${top.visits.toLocaleString()} visits this month (${top.percentage}% of all)`,
      tone: "info",
      icon: "Trophy",
    })
  }

  const topCategory = deps.categoryDistribution[0]
  if (topCategory) {
    const catDisplayName = formatCategoryName(topCategory.name)
    insights.push({
      id: "top-category",
      label: "Top Category",
      value: catDisplayName,
      detail: `${topCategory.count} site${topCategory.count === 1 ? "" : "s"} · ${topCategory.percentage}% of your heritage sites`,
      tone: "info",
      icon: "LayoutGrid",
    })
  }

  const totalVisitors = deps.visitorStats.local + deps.visitorStats.domestic + deps.visitorStats.international
  if (totalVisitors > 0) {
    const nonLocalCount = deps.visitorStats.domestic + deps.visitorStats.international
    const nonLocalShare = Math.round((nonLocalCount / totalVisitors) * 100)
    insights.push({
      id: "non-local-share",
      label: "Non-Local Visitors",
      value: `${nonLocalShare}%`,
      detail: `${nonLocalCount.toLocaleString()} of ${totalVisitors.toLocaleString()} visits this year from outside the municipality`,
      tone: "info",
      icon: "Globe",
    })
  }

  return insights
}
