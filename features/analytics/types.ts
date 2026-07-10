export interface AnalyticsMetric {
  label: string
  value: number
  change: number
  trend: "up" | "down" | "stable"
}

export interface DashboardData {
  totalSites: number
  totalVisitors: number
  totalMunicipalities: number
  topCategories: { name: string; count: number }[]
  visitsOverTime: { date: string; count: number }[]
}
