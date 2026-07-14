import type { MonitoringFilters, MonitoringActivityType } from "./types"

function getDefaultDateFrom(): string {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
  return from.toISOString().slice(0, 10)
}

function getDefaultDateTo(): string {
  return new Date().toISOString().slice(0, 10)
}

export function parseMonitoringFilters(
  searchParams: Record<string, string | undefined>
): MonitoringFilters {
  return {
    dateFrom: searchParams.dateFrom ?? getDefaultDateFrom(),
    dateTo: searchParams.dateTo ?? getDefaultDateTo(),
    siteId: searchParams.siteId ?? null,
    categoryId: searchParams.category ?? null,
    activityType: (searchParams.activityType as MonitoringActivityType) ?? null,
  }
}

export const ACTIVITY_TYPE_CONFIG: Record<
  MonitoringActivityType,
  { label: string; icon: string; color: string }
> = {
  visit: { label: "Site Visit", icon: "Users", color: "#2E5BFF" },
  qr_scan: { label: "QR Scan", icon: "QrCode", color: "#8B5CF6" },
  recommendation_click: { label: "Recommendation", icon: "Sparkles", color: "#F59E0B" },
  bookmark: { label: "Bookmark", icon: "Bookmark", color: "#10B981" },
  review: { label: "Review", icon: "Star", color: "#EF4444" },
}
