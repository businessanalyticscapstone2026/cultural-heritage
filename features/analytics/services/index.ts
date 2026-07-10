import type { DashboardData, AnalyticsMetric } from "../types"

export async function getDashboardData(): Promise<DashboardData> {
  return {
    totalSites: 0,
    totalVisitors: 0,
    totalMunicipalities: 0,
    topCategories: [],
    visitsOverTime: [],
  }
}

export async function getMetrics(): Promise<AnalyticsMetric[]> {
  return []
}

export function aggregateByMonth(data: { date: string; count: number }[]) {
  return data
}
