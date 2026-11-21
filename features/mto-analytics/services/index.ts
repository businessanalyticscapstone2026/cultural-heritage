import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { cache } from "react"
import { unwrapOne } from "@/lib/unwrap-one"
import { ATTRACTION_COLORS, computeChange } from "../utils"
import { normalizeDeviceType } from "@/lib/device-type"
import { CHART_PALETTE } from "@/lib/chart-colors"
import type {
  MTOMetric,
  VisitorTrendPoint,
  TrendGranularity,
  AttractionVisit,
  AgeGroupBreakdown,
  VisitorTypeBreakdown,
  TopVisitedSite,
  RecommendationFunnel,
  WeekdayVisits,
  ComparisonPoint,
  ScanDevicePoint,
  MTOAnalyticsFilters,
  MTOAnalyticsBundle,
} from "../types"

export const resolveMunicipalityId = cache(async (): Promise<string> => {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("municipality_id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.municipality_id) throw new Error("No municipality assigned to this account")

  return profile.municipality_id as string
})

export const getCachedSiteIds = cache(async (municipalityId: string): Promise<string[]> => {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data } = await supabase
    .from("heritage_sites")
    .select("id")
    .eq("municipality_id", municipalityId)

  return data?.map((r) => r.id as string) ?? []
})

async function getSiteIds(
  _supabase: ReturnType<typeof createClient>,
  municipalityId: string
): Promise<string[]> {
  return getCachedSiteIds(municipalityId)
}

function getPriorPeriodStart(dateFrom: string, dateTo: string): string {
  const from = new Date(dateFrom)
  const to = new Date(dateTo)
  const durationMs = to.getTime() - from.getTime()
  const priorStart = new Date(from.getTime() - durationMs)
  return priorStart.toISOString().slice(0, 10)
}

function getPriorPeriodEnd(dateFrom: string): string {
  const from = new Date(dateFrom)
  const priorEnd = new Date(from.getTime() - 1)
  return priorEnd.toISOString().slice(0, 10)
}

function calculateAvgVisitDuration(
  scans: { scanned_at: string | null }[]
): number {
  const timestamps = scans
    .filter((s) => s.scanned_at)
    .map((s) => new Date(s.scanned_at!).getTime())
    .sort((a, b) => a - b)

  if (timestamps.length < 2) return 0

  const SESSION_GAP_MS = 2 * 60 * 60 * 1000
  const sessions: number[][] = [[]]

  for (const ts of timestamps) {
    const currentSession = sessions[sessions.length - 1]
    if (currentSession.length > 0) {
      const lastScan = currentSession[currentSession.length - 1]
      if (ts - lastScan > SESSION_GAP_MS) {
        sessions.push([])
      }
    }
    sessions[sessions.length - 1].push(ts)
  }

  const durations = sessions
    .filter((s) => s.length >= 2)
    .map((s) => (s[s.length - 1] - s[0]) / 60000)

  if (durations.length === 0) return 0

  const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length
  return Math.round(avg)
}

/**
 * KPI row: Total Visitors, Heritage Sites Visited, Recommendations Generated,
 * Route Plans Created, Avg. Visit Duration — all scoped to municipality.
 * Comparison: current period vs same-length prior period.
 */
export async function getSummaryMetrics(
  municipalityId: string,
  filters: MTOAnalyticsFilters
): Promise<MTOMetric[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIds(supabase, municipalityId)
  if (siteIds.length === 0) {
    return [
      { label: "Total Visitors", value: 0, changePercent: 0, changeDirection: "stable", icon: "Users", description: "this period" },
      { label: "Heritage Sites Visited", value: 0, changePercent: 0, changeDirection: "stable", icon: "Landmark", description: "unique sites" },
      { label: "Recommendations Generated", value: 0, changePercent: 0, changeDirection: "stable", icon: "Sparkles", description: "this period" },
      { label: "Avg. Visit Duration", value: 0, changePercent: 0, changeDirection: "stable", icon: "Clock", description: "minutes per visit", unit: "min" },
      { label: "Route Plans Created", value: 0, changePercent: 0, changeDirection: "stable", icon: "Route", description: "this period" },
    ]
  }

  const dateFrom = filters.dateFrom
  const dateTo = filters.dateTo

  const priorDateFrom = getPriorPeriodStart(dateFrom, dateTo)
  const priorDateTo = getPriorPeriodEnd(dateFrom)

  // Route plans scoped to municipality: routes that include a stop at a site in this municipality
  const [routesNowRes, routesPriorRes, visitsNow, visitsPrior, sitesNow, sitesPrior, recsNow, recsPrior, scansNow, scansPrior] = await Promise.all([
    supabase
      .from("route_stops")
      .select("route_id, routes!inner(id, created_at, is_curated)")
      .in("site_id", siteIds)
      .eq("routes.is_curated", false)
      .gte("routes.created_at", dateFrom)
      .lte("routes.created_at", dateTo + "T23:59:59"),
    supabase
      .from("route_stops")
      .select("route_id, routes!inner(id, created_at, is_curated)")
      .in("site_id", siteIds)
      .eq("routes.is_curated", false)
      .gte("routes.created_at", priorDateFrom)
      .lte("routes.created_at", priorDateTo + "T23:59:59"),
    supabase.from("tourist_visits").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("visit_date", dateFrom).lte("visit_date", dateTo),
    supabase.from("tourist_visits").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("visit_date", priorDateFrom).lte("visit_date", priorDateTo),
    supabase.from("tourist_visits").select("site_id").in("site_id", siteIds).gte("visit_date", dateFrom).lte("visit_date", dateTo),
    supabase.from("tourist_visits").select("site_id").in("site_id", siteIds).gte("visit_date", priorDateFrom).lte("visit_date", priorDateTo),
    supabase.from("recommendations").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("generated_at", dateFrom).lte("generated_at", dateTo + "T23:59:59"),
    supabase.from("recommendations").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("generated_at", priorDateFrom).lte("generated_at", priorDateTo + "T23:59:59"),
    supabase.from("qr_scan_logs").select("scanned_at").in("qr_code_id",
      (await supabase.from("qr_codes").select("id").in("site_id", siteIds)).data?.map((r) => r.id as string) ?? []
    ).gte("scanned_at", dateFrom + "T00:00:00").lte("scanned_at", dateTo + "T23:59:59"),
    supabase.from("qr_scan_logs").select("scanned_at").in("qr_code_id",
      (await supabase.from("qr_codes").select("id").in("site_id", siteIds)).data?.map((r) => r.id as string) ?? []
    ).gte("scanned_at", priorDateFrom + "T00:00:00").lte("scanned_at", priorDateTo + "T23:59:59"),
  ])

  const uniqueRouteIdsNow = new Set(routesNowRes.data?.map((r) => r.route_id as string) ?? [])
  const uniqueRouteIdsPrior = new Set(routesPriorRes.data?.map((r) => r.route_id as string) ?? [])

  const uniqueSitesNow = new Set(sitesNow.data?.map((r) => r.site_id)).size
  const uniqueSitesPrior = new Set(sitesPrior.data?.map((r) => r.site_id)).size

  const avgDurationNow = calculateAvgVisitDuration(scansNow.data ?? [])
  const avgDurationPrior = calculateAvgVisitDuration(scansPrior.data ?? [])

  const routesNow = uniqueRouteIdsNow.size
  const routesPrior = uniqueRouteIdsPrior.size

  const visitorsChange = computeChange(visitsNow.count ?? 0, visitsPrior.count ?? 0)
  const sitesChange = computeChange(uniqueSitesNow, uniqueSitesPrior)
  const recsChange = computeChange(recsNow.count ?? 0, recsPrior.count ?? 0)
  const durationChange = computeChange(avgDurationNow, avgDurationPrior)
  const routesChange = computeChange(routesNow, routesPrior)

  return [
    { label: "Total Visitors", value: visitsNow.count ?? 0, ...visitorsChange, icon: "Users", description: "this period" },
    { label: "Heritage Sites Visited", value: uniqueSitesNow, ...sitesChange, icon: "Landmark", description: "unique sites" },
    { label: "Recommendations Generated", value: recsNow.count ?? 0, ...recsChange, icon: "Sparkles", description: "this period" },
    { label: "Avg. Visit Duration", value: avgDurationNow, ...durationChange, icon: "Clock", description: "minutes per visit", unit: "min" },
    { label: "Route Plans Created", value: routesNow, ...routesChange, icon: "Route", description: "this period" },
  ]
}

function bucketByGranularity(
  rows: { visit_date: string | null }[],
  granularity: TrendGranularity
): Map<string, number> {
  const buckets = new Map<string, number>()
  for (const row of rows) {
    const d = new Date(row.visit_date as string)
    let key: string
    if (granularity === "monthly") {
      key = d.toLocaleString("en", { month: "short", year: "numeric" })
    } else if (granularity === "weekly") {
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      key = weekStart.toLocaleString("en", { month: "short", day: "numeric" })
    } else {
      key = d.toLocaleString("en", { month: "short", day: "numeric" })
    }
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  return buckets
}

function sortBucketKeys(buckets: Map<string, number>): string[] {
  return Array.from(buckets.keys()).sort((a, b) => {
    const da = new Date(a)
    const db = new Date(b)
    return da.getTime() - db.getTime()
  })
}

async function fetchVisitRows(
  supabase: ReturnType<typeof createClient>,
  siteIds: string[],
  filters: MTOAnalyticsFilters,
  dateFrom: string,
  dateTo: string
): Promise<{ visit_date: string | null }[]> {
  let query = supabase
    .from("tourist_visits")
    .select("visit_date")
    .in("site_id", siteIds)
    .gte("visit_date", dateFrom)
    .lte("visit_date", dateTo)

  if (filters.categoryId) {
    const { data: catSites } = await supabase
      .from("heritage_sites")
      .select("id")
      .eq("category_id", filters.categoryId)
    const catSiteIds = catSites?.map((s) => s.id as string) ?? []
    if (catSiteIds.length === 0) return []
    query = query.in("site_id", catSiteIds)
  }

  const { data } = await query
  return (data ?? []) as { visit_date: string | null }[]
}

/**
 * Visitor Trend (line chart) — daily/weekly/monthly granularity.
 * Scoped to municipality via site_ids.
 */
export async function getVisitorTrend(
  municipalityId: string,
  filters: MTOAnalyticsFilters,
  granularity: TrendGranularity
): Promise<VisitorTrendPoint[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIds(supabase, municipalityId)
  if (siteIds.length === 0) return []

  const visitRows = await fetchVisitRows(supabase, siteIds, filters, filters.dateFrom, filters.dateTo)
  if (visitRows.length === 0) return []

  const buckets = bucketByGranularity(visitRows, granularity)

  return sortBucketKeys(buckets).map((period) => ({
    period,
    visitors: buckets.get(period) ?? 0,
  }))
}

/**
 * Visits by Attraction (donut chart) — groups tourist_visits by
 * heritage category name. Replaces the PTCAO per-municipality breakdown.
 */
export async function getVisitsByAttraction(
  municipalityId: string,
  filters: MTOAnalyticsFilters
): Promise<AttractionVisit[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: sites } = await supabase
    .from("heritage_sites")
    .select("id, category_id, category:heritage_categories(name)")
    .eq("municipality_id", municipalityId)

  if (!sites || sites.length === 0) return []

  const siteCategoryMap = new Map<string, string>()
  for (const site of sites) {
    const cat = unwrapOne(site.category as unknown as { name: string } | { name: string }[] | null)
    siteCategoryMap.set(site.id as string, cat?.name ?? "Uncategorized")
  }

  const siteIds = sites.map((s) => s.id as string)

  let query = supabase
    .from("tourist_visits")
    .select("site_id")
    .in("site_id", siteIds)
    .gte("visit_date", filters.dateFrom)
    .lte("visit_date", filters.dateTo)

  if (filters.categoryId) {
    const allowedSiteIds = sites
      .filter((s) => {
        const cat = unwrapOne(s.category as unknown as { id: string } | { id: string }[] | null)
        return cat?.id === filters.categoryId || s.category_id === filters.categoryId
      })
      .map((s) => s.id as string)
    if (allowedSiteIds.length === 0) return []
    query = query.in("site_id", allowedSiteIds)
  }

  const { data: visits } = await query
  if (!visits || visits.length === 0) return []

  const categoryCounts = new Map<string, number>()
  for (const visit of visits) {
    const catName = siteCategoryMap.get(visit.site_id as string) ?? "Uncategorized"
    categoryCounts.set(catName, (categoryCounts.get(catName) ?? 0) + 1)
  }

  const totalVisits = visits.length
  const sorted = Array.from(categoryCounts.entries())
    .map(([name, count], i) => ({
      categoryName: name,
      visits: count,
      percentage: Math.round((count / totalVisits) * 100),
      color: ATTRACTION_COLORS[i % ATTRACTION_COLORS.length],
    }))
    .sort((a, b) => b.visits - a.visits)

  return sorted
}

/**
 * Demographics: Visitors by Age Group + Visitors by Type (Local/Domestic/International).
 * Both returned from a single query for efficiency.
 */
export async function getDemographics(
  municipalityId: string,
  filters: MTOAnalyticsFilters
): Promise<{ ageGroups: AgeGroupBreakdown[]; visitorTypes: VisitorTypeBreakdown[] }> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIds(supabase, municipalityId)
  if (siteIds.length === 0) {
    return { ageGroups: [], visitorTypes: [] }
  }

  let query = supabase
    .from("tourist_visits")
    .select("age_group, visitor_origin")
    .in("site_id", siteIds)
    .gte("visit_date", filters.dateFrom)
    .lte("visit_date", filters.dateTo)

  if (filters.categoryId) {
    const { data: catSites } = await supabase
      .from("heritage_sites")
      .select("id")
      .eq("category_id", filters.categoryId)
    const catSiteIds = catSites?.map((s) => s.id as string) ?? []
    if (catSiteIds.length === 0) return { ageGroups: [], visitorTypes: [] }
    query = query.in("site_id", catSiteIds)
  }

  const { data } = await query
  if (!data || data.length === 0) return { ageGroups: [], visitorTypes: [] }

  const ageCounts = new Map<string, number>()
  const typeCounts = new Map<string, number>()

  for (const row of data) {
    const age = (row.age_group as string) ?? "Unknown"
    const type = ((row as unknown as { visitor_origin: string }).visitor_origin) ?? "Unknown"
    ageCounts.set(age, (ageCounts.get(age) ?? 0) + 1)
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1)
  }

  const total = data.length

  const TYPE_COLORS: Record<string, string> = {
    local: "#3B82F6",
    domestic: "#8B5CF6",
    international: "#10B981",
    Unknown: "#9CA3AF",
  }

  const ageGroups: AgeGroupBreakdown[] = Array.from(ageCounts.entries())
    .map(([ageGroup, count]) => ({
      ageGroup,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)

  const visitorTypes: VisitorTypeBreakdown[] = Array.from(typeCounts.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100),
      color: TYPE_COLORS[type] ?? "#9CA3AF",
    }))
    .sort((a, b) => b.count - a.count)

  return { ageGroups, visitorTypes }
}

/**
 * Top Visited Heritage Sites (ranked table).
 */
export async function getTopSites(
  municipalityId: string,
  filters: MTOAnalyticsFilters,
  limit = 10
): Promise<TopVisitedSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIds(supabase, municipalityId)
  if (siteIds.length === 0) return []

  let query = supabase
    .from("tourist_visits")
    .select("site_id")
    .in("site_id", siteIds)
    .gte("visit_date", filters.dateFrom)
    .lte("visit_date", filters.dateTo)

  if (filters.categoryId) {
    const { data: catSites } = await supabase
      .from("heritage_sites")
      .select("id")
      .eq("category_id", filters.categoryId)
    const catSiteIds = catSites?.map((s) => s.id as string) ?? []
    if (catSiteIds.length === 0) return []
    query = query.in("site_id", catSiteIds)
  }

  const { data: visits } = await query
  if (!visits || visits.length === 0) return []

  const siteCounts = new Map<string, number>()
  for (const visit of visits) {
    const sid = visit.site_id as string
    siteCounts.set(sid, (siteCounts.get(sid) ?? 0) + 1)
  }

  const topSiteIds = Array.from(siteCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  if (topSiteIds.length === 0) return []

  const { data: siteData } = await supabase
    .from("heritage_sites")
    .select("id, site_name, category:heritage_categories(name)")
    .in("id", topSiteIds)

  const siteInfoMap = new Map<string, { name: string; category: string }>()
  for (const site of siteData ?? []) {
    siteInfoMap.set(site.id as string, {
      name: site.site_name as string,
      category: unwrapOne(site.category as unknown as { name: string } | { name: string }[] | null)?.name ?? "Uncategorized",
    })
  }

  const totalVisits = visits.length

  return topSiteIds.map((id) => {
    const info = siteInfoMap.get(id)
    const count = siteCounts.get(id) ?? 0
    return {
      siteId: id,
      siteName: info?.name ?? "Unknown",
      categoryName: info?.category ?? "Uncategorized",
      visits: count,
      percentage: Math.round((count / totalVisits) * 100),
    }
  })
}

/**
 * Recommendation Performance (funnel: Generated → Clicked → Route Plans → Conversions).
 */
export async function getRecommendationPerformance(
  municipalityId: string,
  filters: MTOAnalyticsFilters
): Promise<RecommendationFunnel> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIds(supabase, municipalityId)
  if (siteIds.length === 0) {
    return { generated: 0, clicked: 0, routePlans: 0, conversions: 0 }
  }

  const dateFrom = filters.dateFrom
  const dateTo = filters.dateTo

  const [generated, clicked, routePlans] = await Promise.all([
    supabase
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .in("site_id", siteIds)
      .gte("generated_at", dateFrom)
      .lte("generated_at", dateTo + "T23:59:59"),
    supabase
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .in("site_id", siteIds)
      .eq("was_clicked", true)
      .gte("generated_at", dateFrom)
      .lte("generated_at", dateTo + "T23:59:59"),
    supabase
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .in("site_id", siteIds)
      .eq("led_to_route", true)
      .gte("generated_at", dateFrom)
      .lte("generated_at", dateTo + "T23:59:59"),
  ])

  return {
    generated: generated.count ?? 0,
    clicked: clicked.count ?? 0,
    routePlans: routePlans.count ?? 0,
    conversions: routePlans.count ?? 0,
  }
}

const WEEKDAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/**
 * Visits by Day of Week (bar chart) — aggregates the weekday pattern.
 */
export async function getVisitsByWeekday(
  municipalityId: string,
  filters: MTOAnalyticsFilters
): Promise<WeekdayVisits[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIds(supabase, municipalityId)
  if (siteIds.length === 0) return []

  const rows = await fetchVisitRows(supabase, siteIds, filters, filters.dateFrom, filters.dateTo)
  if (rows.length === 0) return WEEKDAY_KEYS.map((day) => ({ day, visits: 0 }))

  const counts = new Map<string, number>(WEEKDAY_KEYS.map((day) => [day, 0]))
  for (const row of rows) {
    const d = new Date(row.visit_date as string)
    const dow = d.getDay()
    const key = WEEKDAY_KEYS[(dow + 6) % 7]
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return WEEKDAY_KEYS.map((day) => ({ day, visits: counts.get(day) ?? 0 }))
}

/**
 * Current vs Prior Period (comparison chart) — overlays the selected window
 * against the same-length preceding window.
 */
export async function getVisitorTrendComparison(
  municipalityId: string,
  filters: MTOAnalyticsFilters,
  granularity: TrendGranularity
): Promise<ComparisonPoint[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIds(supabase, municipalityId)
  if (siteIds.length === 0) return []

  const priorStart = getPriorPeriodStart(filters.dateFrom, filters.dateTo)
  const priorEnd = getPriorPeriodEnd(filters.dateFrom)

  const [currentRows, priorRows] = await Promise.all([
    fetchVisitRows(supabase, siteIds, filters, filters.dateFrom, filters.dateTo),
    fetchVisitRows(supabase, siteIds, filters, priorStart, priorEnd),
  ])

  const currentBuckets = bucketByGranularity(currentRows, granularity)
  const priorBuckets = bucketByGranularity(priorRows, granularity)

  const allKeys = new Set([...currentBuckets.keys(), ...priorBuckets.keys()])
  const sortedKeys = Array.from(allKeys).sort((a, b) => {
    const da = new Date(a)
    const db = new Date(b)
    return da.getTime() - db.getTime()
  })

  return sortedKeys.map((period) => ({
    period,
    current: currentBuckets.get(period) ?? 0,
    prior: priorBuckets.get(period) ?? 0,
  }))
}

/**
 * Scans by Device Type (donut chart) — scoped to the filtered date range.
 */
export async function getScanDeviceBreakdown(
  municipalityId: string,
  filters: MTOAnalyticsFilters
): Promise<ScanDevicePoint[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getCachedSiteIds(municipalityId)
  if (siteIds.length === 0) return []

  const qrCodeIds = (
    await supabase
      .from("qr_codes")
      .select("id")
      .in("site_id", siteIds)
  ).data?.map((q) => q.id as string) ?? []

  if (qrCodeIds.length === 0) return []

  const { data: scans } = await supabase
    .from("qr_scan_logs")
    .select("device_type")
    .in("qr_code_id", qrCodeIds)
    .gte("scanned_at", filters.dateFrom + "T00:00:00")
    .lte("scanned_at", filters.dateTo + "T23:59:59")

  if (!scans || scans.length === 0) return []

  const deviceCounts = new Map<string, number>()
  for (const scan of scans) {
    const device = normalizeDeviceType(scan.device_type as string | null)
    deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1)
  }

  return Array.from(deviceCounts.entries())
    .map(([device, count], i) => ({
      device,
      count,
      color: CHART_PALETTE[i % CHART_PALETTE.length],
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Batched aggregator for all MTO analytics data.
 * Executes all component queries in parallel on the server with memoized site IDs.
 */
export async function getAllMTOAnalyticsData(
  municipalityId: string,
  filters: MTOAnalyticsFilters,
  granularity: TrendGranularity = "monthly"
): Promise<MTOAnalyticsBundle> {
  const [
    summaryMetrics,
    visitorTrend,
    visitorTrendComparison,
    weekdayVisits,
    visitsByAttraction,
    recommendationFunnel,
    scanDeviceBreakdown,
    demographics,
    topSites,
  ] = await Promise.all([
    getSummaryMetrics(municipalityId, filters),
    getVisitorTrend(municipalityId, filters, granularity),
    getVisitorTrendComparison(municipalityId, filters, granularity),
    getVisitsByWeekday(municipalityId, filters),
    getVisitsByAttraction(municipalityId, filters),
    getRecommendationPerformance(municipalityId, filters),
    getScanDeviceBreakdown(municipalityId, filters),
    getDemographics(municipalityId, filters),
    getTopSites(municipalityId, filters),
  ])

  return {
    summaryMetrics,
    visitorTrend,
    visitorTrendComparison,
    weekdayVisits,
    visitsByAttraction,
    recommendationFunnel,
    scanDeviceBreakdown,
    demographics,
    topSites,
  }
}
