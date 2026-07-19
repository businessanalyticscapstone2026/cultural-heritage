import { unstable_cache } from "next/cache"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createTokenClient, resolveAccessToken } from "@/utils/supabase/cached"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags"
import { FIRST_DISTRICT_MUNICIPALITIES } from "@/lib/constants"
import { MUNICIPALITY_COLORS, computeChange } from "../utils"
import type {
  ProvinceMetric,
  VisitorTrendPoint,
  TrendGranularity,
  MunicipalityVisit,
  AgeGroupBreakdown,
  VisitorTypeBreakdown,
  CategoryVisit,
  TopVisitedSite,
  RecommendationFunnel,
  AnalyticsFilters,
} from "../types"

type AnalyticsClient = SupabaseClient

async function getSiteIdsForFilters(
  supabase: AnalyticsClient,
  filters: AnalyticsFilters
): Promise<string[]> {
  let query = supabase.from("heritage_sites").select("id")

  if (filters.municipalityId) {
    query = query.eq("municipality_id", filters.municipalityId)
  } else {
    const { data: municipalities } = await supabase
      .from("municipalities")
      .select("id")
      .in("name", [...FIRST_DISTRICT_MUNICIPALITIES])
    const muniIds = municipalities?.map((m) => m.id as string) ?? []
    if (muniIds.length === 0) return []
    query = query.in("municipality_id", muniIds)
  }

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId)
  }

  const { data } = await query
  return data?.map((r) => r.id as string) ?? []
}

async function fetchProvinceSummary(
  supabase: AnalyticsClient,
  filters: AnalyticsFilters
): Promise<ProvinceMetric[]> {
  const siteIds = await getSiteIdsForFilters(supabase, filters)
  if (siteIds.length === 0) {
    return [
      { label: "Total Visitors", value: 0, changePercent: 0, changeDirection: "stable", icon: "Users", description: "this period" },
      { label: "Sites Visited", value: 0, changePercent: 0, changeDirection: "stable", icon: "Landmark", description: "unique sites" },
      { label: "Recommendations Generated", value: 0, changePercent: 0, changeDirection: "stable", icon: "Sparkles", description: "this period" },
      { label: "Avg. Visit Duration", value: 0, changePercent: 0, changeDirection: "stable", icon: "Clock", description: "minutes per visit", unit: "min" },
      { label: "Route Plans Created", value: 0, changePercent: 0, changeDirection: "stable", icon: "Route", description: "this period" },
    ]
  }

  const dateFrom = filters.dateFrom
  const dateTo = filters.dateTo

  const priorDateFrom = getPriorPeriodStart(dateFrom, dateTo)
  const priorDateTo = getPriorPeriodEnd(dateFrom)

  const [visitsNow, visitsPrior, sitesNow, sitesPrior, recsNow, recsPrior, scansNow, scansPrior, routesNow, routesPrior] = await Promise.all([
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
    supabase.from("routes").select("id", { count: "exact", head: true }).gte("created_at", dateFrom).lte("created_at", dateTo + "T23:59:59"),
    supabase.from("routes").select("id", { count: "exact", head: true }).gte("created_at", priorDateFrom).lte("created_at", priorDateTo + "T23:59:59"),
  ])

  const uniqueSitesNow = new Set(sitesNow.data?.map((r) => r.site_id)).size
  const uniqueSitesPrior = new Set(sitesPrior.data?.map((r) => r.site_id)).size

  const avgDurationNow = calculateAvgVisitDuration(scansNow.data ?? [])
  const avgDurationPrior = calculateAvgVisitDuration(scansPrior.data ?? [])

  const visitorsChange = computeChange(visitsNow.count ?? 0, visitsPrior.count ?? 0)
  const sitesChange = computeChange(uniqueSitesNow, uniqueSitesPrior)
  const recsChange = computeChange(recsNow.count ?? 0, recsPrior.count ?? 0)
  const durationChange = computeChange(avgDurationNow, avgDurationPrior)
  const routesChange = computeChange(routesNow.count ?? 0, routesPrior.count ?? 0)

  return [
    { label: "Total Visitors", value: visitsNow.count ?? 0, ...visitorsChange, icon: "Users", description: "this period" },
    { label: "Sites Visited", value: uniqueSitesNow, ...sitesChange, icon: "Landmark", description: "unique sites" },
    { label: "Recommendations Generated", value: recsNow.count ?? 0, ...recsChange, icon: "Sparkles", description: "this period" },
    { label: "Avg. Visit Duration", value: avgDurationNow, ...durationChange, icon: "Clock", description: "minutes per visit", unit: "min" },
    { label: "Route Plans Created", value: routesNow.count ?? 0, ...routesChange, icon: "Route", description: "this period" },
  ]
}

const getCachedProvinceSummary = unstable_cache(
  async (accessToken: string, filtersJson: string) => {
    const supabase = createTokenClient(accessToken)
    return fetchProvinceSummary(supabase, JSON.parse(filtersJson))
  },
  ["analytics-province-summary"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.analytics] },
)

async function fetchVisitorTrend(
  supabase: AnalyticsClient,
  filters: AnalyticsFilters,
  granularity: TrendGranularity
): Promise<VisitorTrendPoint[]> {
  const siteIds = await getSiteIdsForFilters(supabase, filters)
  if (siteIds.length === 0) return []

  const { data } = await supabase
    .from("tourist_visits")
    .select("visit_date")
    .in("site_id", siteIds)
    .gte("visit_date", filters.dateFrom)
    .lte("visit_date", filters.dateTo)

  if (!data || data.length === 0) return []

  const buckets = new Map<string, number>()

  for (const row of data) {
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

  const sortedKeys = Array.from(buckets.keys()).sort((a, b) => {
    const da = new Date(a)
    const db = new Date(b)
    return da.getTime() - db.getTime()
  })

  return sortedKeys.map((period) => ({
    period,
    visitors: buckets.get(period) ?? 0,
  }))
}

const getCachedVisitorTrend = unstable_cache(
  async (accessToken: string, filtersJson: string, granularity: string) => {
    const supabase = createTokenClient(accessToken)
    return fetchVisitorTrend(supabase, JSON.parse(filtersJson), granularity as TrendGranularity)
  },
  ["analytics-visitor-trend"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.analytics] },
)

async function fetchVisitsByMunicipality(
  supabase: AnalyticsClient,
  filters: AnalyticsFilters
): Promise<MunicipalityVisit[]> {
  const { data: municipalities } = await supabase
    .from("municipalities")
    .select("id, name")
    .in("name", [...FIRST_DISTRICT_MUNICIPALITIES])

  if (!municipalities || municipalities.length === 0) return []

  const muniIds = municipalities.map((m) => m.id as string)

  const { data: sites } = await supabase
    .from("heritage_sites")
    .select("id, municipality_id")
    .in("municipality_id", muniIds)

  if (!sites || sites.length === 0) {
    return municipalities.map((m, i) => ({
      municipalityId: m.id as string,
      municipalityName: m.name as string,
      visits: 0,
      percentage: 0,
      color: MUNICIPALITY_COLORS[i % MUNICIPALITY_COLORS.length],
    }))
  }

  const siteIdToMuni = new Map<string, string>()
  for (const site of sites) {
    siteIdToMuni.set(site.id as string, site.municipality_id as string)
  }

  const allSiteIds = sites.map((s) => s.id as string)

  let visitQuery = supabase
    .from("tourist_visits")
    .select("site_id")
    .in("site_id", allSiteIds)
    .gte("visit_date", filters.dateFrom)
    .lte("visit_date", filters.dateTo)

  if (filters.categoryId) {
    const { data: catSites } = await supabase
      .from("heritage_sites")
      .select("id")
      .in("municipality_id", muniIds)
      .eq("category_id", filters.categoryId)
    const catSiteIds = catSites?.map((s) => s.id as string) ?? []
    if (catSiteIds.length === 0) {
      return municipalities.map((m, i) => ({
        municipalityId: m.id as string,
        municipalityName: m.name as string,
        visits: 0,
        percentage: 0,
        color: MUNICIPALITY_COLORS[i % MUNICIPALITY_COLORS.length],
      }))
    }
    visitQuery = visitQuery.in("site_id", catSiteIds)
  }

  const { data: visits } = await visitQuery

  const muniVisitCount = new Map<string, number>()
  for (const m of municipalities) {
    muniVisitCount.set(m.id as string, 0)
  }

  for (const v of visits ?? []) {
    const muniId = siteIdToMuni.get(v.site_id as string)
    if (muniId) {
      muniVisitCount.set(muniId, (muniVisitCount.get(muniId) ?? 0) + 1)
    }
  }

  const totalVisits = Array.from(muniVisitCount.values()).reduce((sum, c) => sum + c, 0)

  const results: MunicipalityVisit[] = municipalities.map((m, i) => ({
    municipalityId: m.id as string,
    municipalityName: m.name as string,
    visits: muniVisitCount.get(m.id as string) ?? 0,
    percentage: 0,
    color: MUNICIPALITY_COLORS[i % MUNICIPALITY_COLORS.length],
  }))

  for (const r of results) {
    r.percentage = totalVisits > 0 ? Math.round((r.visits / totalVisits) * 100) : 0
  }

  return results.sort((a, b) => b.visits - a.visits)
}

const getCachedVisitsByMunicipality = unstable_cache(
  async (accessToken: string, filtersJson: string) => {
    const supabase = createTokenClient(accessToken)
    return fetchVisitsByMunicipality(supabase, JSON.parse(filtersJson))
  },
  ["analytics-visits-by-municipality"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.analytics] },
)

async function fetchDemographics(
  supabase: AnalyticsClient,
  filters: AnalyticsFilters
): Promise<{ ageGroups: AgeGroupBreakdown[]; visitorTypes: VisitorTypeBreakdown[] }> {
  const siteIds = await getSiteIdsForFilters(supabase, filters)
  if (siteIds.length === 0) {
    return { ageGroups: [], visitorTypes: [] }
  }

  const { data } = await supabase
    .from("tourist_visits")
    .select("age_group, visitor_type")
    .in("site_id", siteIds)
    .gte("visit_date", filters.dateFrom)
    .lte("visit_date", filters.dateTo)

  if (!data || data.length === 0) return { ageGroups: [], visitorTypes: [] }

  const ageCounts = new Map<string, number>()
  const typeCounts = new Map<string, number>()

  for (const row of data) {
    const age = (row.age_group as string) ?? "Unknown"
    const type = (row.visitor_type as string) ?? "Unknown"
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

const getCachedDemographics = unstable_cache(
  async (accessToken: string, filtersJson: string) => {
    const supabase = createTokenClient(accessToken)
    return fetchDemographics(supabase, JSON.parse(filtersJson))
  },
  ["analytics-demographics"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.analytics] },
)

async function fetchTopCategories(
  supabase: AnalyticsClient,
  filters: AnalyticsFilters
): Promise<CategoryVisit[]> {
  const siteIds = await getSiteIdsForFilters(supabase, filters)
  if (siteIds.length === 0) return []

  const { data: sites } = await supabase
    .from("heritage_sites")
    .select("id, category_id, category:heritage_categories(name, color)")
    .in("id", siteIds)

  if (!sites || sites.length === 0) return []

  const siteCategoryMap = new Map<string, { name: string; color: string }>()
  for (const site of sites) {
    const catArr = site.category as unknown as { name: string; color: string }[] | null
    const cat = Array.isArray(catArr) ? catArr[0] : null
    siteCategoryMap.set(site.id as string, {
      name: cat?.name ?? "Uncategorized",
      color: cat?.color ?? "#9CA3AF",
    })
  }

  const { data: visits } = await supabase
    .from("tourist_visits")
    .select("site_id")
    .in("site_id", siteIds)
    .gte("visit_date", filters.dateFrom)
    .lte("visit_date", filters.dateTo)

  if (!visits || visits.length === 0) return []

  const categoryCounts = new Map<string, { count: number; color: string }>()
  for (const visit of visits) {
    const cat = siteCategoryMap.get(visit.site_id as string)
    const key = cat?.name ?? "Uncategorized"
    const existing = categoryCounts.get(key)
    categoryCounts.set(key, {
      count: (existing?.count ?? 0) + 1,
      color: existing?.color ?? cat?.color ?? "#9CA3AF",
    })
  }

  const totalVisits = visits.length

  return Array.from(categoryCounts.entries())
    .map(([name, { count, color }]) => ({
      categoryId: name,
      categoryName: name,
      visits: count,
      percentage: Math.round((count / totalVisits) * 100),
      color,
    }))
    .sort((a, b) => b.visits - a.visits)
}

const getCachedTopCategories = unstable_cache(
  async (accessToken: string, filtersJson: string) => {
    const supabase = createTokenClient(accessToken)
    return fetchTopCategories(supabase, JSON.parse(filtersJson))
  },
  ["analytics-top-categories"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.analytics] },
)

async function fetchTopSites(
  supabase: AnalyticsClient,
  filters: AnalyticsFilters,
  limit: number
): Promise<TopVisitedSite[]> {
  const siteIds = await getSiteIdsForFilters(supabase, filters)
  if (siteIds.length === 0) return []

  const { data: visits } = await supabase
    .from("tourist_visits")
    .select("site_id")
    .in("site_id", siteIds)
    .gte("visit_date", filters.dateFrom)
    .lte("visit_date", filters.dateTo)

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
    .select("id, site_name, municipality:municipalities(name), category:heritage_categories(name)")
    .in("id", topSiteIds)

  const siteInfoMap = new Map<string, { name: string; municipality: string; category: string }>()
  for (const site of siteData ?? []) {
    const muniArr = site.municipality as unknown as { name: string }[] | null
    const catArr = site.category as unknown as { name: string }[] | null
    siteInfoMap.set(site.id as string, {
      name: site.site_name as string,
      municipality: (Array.isArray(muniArr) ? muniArr[0]?.name : null) ?? "Unknown",
      category: (Array.isArray(catArr) ? catArr[0]?.name : null) ?? "Uncategorized",
    })
  }

  const totalVisits = visits.length

  return topSiteIds.map((id) => {
    const info = siteInfoMap.get(id)
    const count = siteCounts.get(id) ?? 0
    return {
      siteId: id,
      siteName: info?.name ?? "Unknown",
      municipalityName: info?.municipality ?? "Unknown",
      categoryName: info?.category ?? "Uncategorized",
      visits: count,
      percentage: Math.round((count / totalVisits) * 100),
    }
  })
}

const getCachedTopSites = unstable_cache(
  async (accessToken: string, filtersJson: string, limit: number) => {
    const supabase = createTokenClient(accessToken)
    return fetchTopSites(supabase, JSON.parse(filtersJson), limit)
  },
  ["analytics-top-sites"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.analytics] },
)

async function fetchRecommendationPerformance(
  supabase: AnalyticsClient,
  filters: AnalyticsFilters
): Promise<RecommendationFunnel> {
  const siteIds = await getSiteIdsForFilters(supabase, filters)
  if (siteIds.length === 0) {
    return { generated: 0, clicked: 0, routePlans: 0, conversions: 0 }
  }

  const [generated, clicked, routePlans] = await Promise.all([
    supabase
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .in("site_id", siteIds)
      .gte("generated_at", filters.dateFrom)
      .lte("generated_at", filters.dateTo + "T23:59:59"),
    supabase
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .in("site_id", siteIds)
      .eq("was_clicked", true)
      .gte("generated_at", filters.dateFrom)
      .lte("generated_at", filters.dateTo + "T23:59:59"),
    supabase
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .in("site_id", siteIds)
      .eq("led_to_route", true)
      .gte("generated_at", filters.dateFrom)
      .lte("generated_at", filters.dateTo + "T23:59:59"),
  ])

  return {
    generated: generated.count ?? 0,
    clicked: clicked.count ?? 0,
    routePlans: routePlans.count ?? 0,
    conversions: routePlans.count ?? 0,
  }
}

const getCachedRecommendationPerformance = unstable_cache(
  async (accessToken: string, filtersJson: string) => {
    const supabase = createTokenClient(accessToken)
    return fetchRecommendationPerformance(supabase, JSON.parse(filtersJson))
  },
  ["analytics-recommendation-performance"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.analytics] },
)

export async function getProvinceSummary(filters: AnalyticsFilters): Promise<ProvinceMetric[]> {
  const accessToken = await resolveAccessToken()
  return getCachedProvinceSummary(accessToken, JSON.stringify(filters))
}

export async function getVisitorTrend(filters: AnalyticsFilters, granularity: TrendGranularity): Promise<VisitorTrendPoint[]> {
  const accessToken = await resolveAccessToken()
  return getCachedVisitorTrend(accessToken, JSON.stringify(filters), granularity)
}

export async function getVisitsByMunicipality(filters: AnalyticsFilters): Promise<MunicipalityVisit[]> {
  const accessToken = await resolveAccessToken()
  return getCachedVisitsByMunicipality(accessToken, JSON.stringify(filters))
}

export async function getDemographics(filters: AnalyticsFilters): Promise<{ ageGroups: AgeGroupBreakdown[]; visitorTypes: VisitorTypeBreakdown[] }> {
  const accessToken = await resolveAccessToken()
  return getCachedDemographics(accessToken, JSON.stringify(filters))
}

export async function getTopCategories(filters: AnalyticsFilters): Promise<CategoryVisit[]> {
  const accessToken = await resolveAccessToken()
  return getCachedTopCategories(accessToken, JSON.stringify(filters))
}

export async function getTopSites(filters: AnalyticsFilters, limit = 10): Promise<TopVisitedSite[]> {
  const accessToken = await resolveAccessToken()
  return getCachedTopSites(accessToken, JSON.stringify(filters), limit)
}

export async function getRecommendationPerformance(filters: AnalyticsFilters): Promise<RecommendationFunnel> {
  const accessToken = await resolveAccessToken()
  return getCachedRecommendationPerformance(accessToken, JSON.stringify(filters))
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
