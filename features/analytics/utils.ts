import type { AnalyticsFilters } from "./types"

const MUNICIPALITY_COLORS = [
  "#2E5BFF",
  "#0F2747",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
]

export { MUNICIPALITY_COLORS }

function getDefaultDateFrom(): string {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  return from.toISOString().slice(0, 10)
}

function getDefaultDateTo(): string {
  return new Date().toISOString().slice(0, 10)
}

export function parseFiltersFromSearchParams(
  searchParams: Record<string, string | undefined>
): AnalyticsFilters {
  return {
    dateFrom: searchParams.dateFrom ?? getDefaultDateFrom(),
    dateTo: searchParams.dateTo ?? getDefaultDateTo(),
    municipalityId: searchParams.municipality ?? null,
    categoryId: searchParams.category ?? null,
  }
}

export function computeChange(current: number, prior: number): {
  changePercent: number
  changeDirection: "up" | "down" | "stable"
} {
  if (prior === 0 && current === 0) return { changePercent: 0, changeDirection: "stable" }
  if (prior === 0) return { changePercent: 100, changeDirection: "up" }
  const pct = Math.round(((current - prior) / prior) * 100)
  return {
    changePercent: Math.abs(pct),
    changeDirection: pct > 0 ? "up" : pct < 0 ? "down" : "stable",
  }
}
