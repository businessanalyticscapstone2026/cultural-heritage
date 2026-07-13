import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type {
  ReportFilters,
  UnderPromotedSite,
  MunicipalityPerformance,
  CategoryDemand,
  ResourceAllocation,
  ReportData,
  FilterOption,
} from "../types"

function extractName(val: { name: string }[] | { name: string } | null): string {
  if (!val) return "—"
  if (Array.isArray(val)) return val[0]?.name ?? "—"
  return val.name ?? "—"
}

// ── Utility: filter options for dropdowns ──────────────────────────────

export async function getMunicipalityOptions(): Promise<FilterOption[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("municipalities")
    .select("id, name")
    .order("name")

  if (error) throw new Error(`Failed to fetch municipalities: ${error.message}`)
  return (data ?? []).map((m) => ({ id: m.id, name: m.name }))
}

export async function getCategoryOptions(): Promise<FilterOption[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_categories")
    .select("id, name")
    .order("name")

  if (error) throw new Error(`Failed to fetch heritage categories: ${error.message}`)
  return (data ?? []).map((c) => ({ id: c.id, name: c.name }))
}

// ── Report 1: Under-promoted Heritage Sites ────────────────────────────
// Query A: heritage_sites LEFT JOIN recommendations (COUNT per site_id).
// Query B: heritage_sites LEFT JOIN tourist_visits (COUNT per site_id).
// Combined: sites below configurable threshold for both signals.
// Date range filters recommendations.generated_at and tourist_visits.visit_date.

export async function getUnderPromotedSites(
  filters: ReportFilters,
  threshold: number,
): Promise<UnderPromotedSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1a: Fetch all published sites
  let sitesQuery = supabase
    .from("heritage_sites")
    .select(`
      id,
      site_name,
      municipality:municipality_id (name),
      category:category_id (name)
    `)
    .eq("publication_status", "published")

  if (filters.municipalityId) {
    sitesQuery = sitesQuery.eq("municipality_id", filters.municipalityId)
  }
  if (filters.categoryId) {
    sitesQuery = sitesQuery.eq("category_id", filters.categoryId)
  }

  const { data: sites, error: sitesErr } = await sitesQuery
  if (sitesErr) throw new Error(`Failed to fetch heritage sites: ${sitesErr.message}`)

  const siteIds = (sites ?? []).map((s) => s.id)
  if (siteIds.length === 0) return []

  // 1b: Count recommendations per site within date range
  const { data: recs, error: recsErr } = await supabase
    .from("recommendations")
    .select("site_id")
    .in("site_id", siteIds)
    .gte("generated_at", filters.startDate)
    .lte("generated_at", filters.endDate)

  if (recsErr) throw new Error(`Failed to fetch recommendations: ${recsErr.message}`)

  // 1c: Count tourist visits per site within date range
  const { data: visits, error: visitsErr } = await supabase
    .from("tourist_visits")
    .select("site_id")
    .in("site_id", siteIds)
    .gte("visit_date", filters.startDate)
    .lte("visit_date", filters.endDate)

  if (visitsErr) throw new Error(`Failed to fetch tourist visits: ${visitsErr.message}`)

  const recCounts: Record<string, number> = {}
  for (const r of recs ?? []) recCounts[r.site_id] = (recCounts[r.site_id] ?? 0) + 1

  const visitCounts: Record<string, number> = {}
  for (const v of visits ?? []) visitCounts[v.site_id] = (visitCounts[v.site_id] ?? 0) + 1

  return (sites ?? [])
    .map((site) => {
      const siteRecord = site as Record<string, unknown>
      return {
        siteId: site.id,
        siteName: site.site_name,
        municipalityName: extractName(siteRecord.municipality as { name: string }[] | { name: string } | null),
        categoryName: extractName(siteRecord.category as { name: string }[] | { name: string } | null),
        recommendationCount: recCounts[site.id] ?? 0,
        visitCount: visitCounts[site.id] ?? 0,
      }
    })
    .filter((s) => s.recommendationCount < threshold || s.visitCount < threshold)
    .sort((a, b) => a.recommendationCount - b.recommendationCount || a.visitCount - b.visitCount)
}

// ── Report 2: Municipality Performance ─────────────────────────────────
// tourist_visits GROUP BY site's municipality_id (JOIN heritage_sites),
// with visitor counts and trend over date range.
// Also breaks down by visitor_type.

export async function getMunicipalityPerformance(
  filters: ReportFilters,
): Promise<MunicipalityPerformance[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 2a: Get all municipalities
  let munsQuery = supabase
    .from("municipalities")
    .select("id, name")
    .order("name")

  const { data: municipalities, error: munsErr } = await munsQuery
  if (munsErr) throw new Error(`Failed to fetch municipalities: ${munsErr.message}`)

  const muns = municipalities ?? []
  if (muns.length === 0) return []

  // 2b: Get site-to-municipality mapping
  let sitesQuery = supabase
    .from("heritage_sites")
    .select("id, municipality_id")

  if (filters.municipalityId) {
    sitesQuery = sitesQuery.eq("municipality_id", filters.municipalityId)
  }

  const { data: sites, error: sitesErr } = await sitesQuery
  if (sitesErr) throw new Error(`Failed to fetch heritage sites: ${sitesErr.message}`)

  const siteToMun: Record<string, string> = {}
  const munSiteIds: Record<string, string[]> = {}
  for (const site of sites ?? []) {
    siteToMun[site.id] = site.municipality_id
    if (!munSiteIds[site.municipality_id]) munSiteIds[site.municipality_id] = []
    munSiteIds[site.municipality_id].push(site.id)
  }

  const allSiteIds = Object.keys(siteToMun)
  if (allSiteIds.length === 0) return []

  // 2c: Fetch visits within date range
  const { data: visits, error: visitsErr } = await supabase
    .from("tourist_visits")
    .select("site_id, visitor_type, visit_date")
    .in("site_id", allSiteIds)
    .gte("visit_date", filters.startDate)
    .lte("visit_date", filters.endDate)

  if (visitsErr) throw new Error(`Failed to fetch tourist visits: ${visitsErr.message}`)

  // 2d: Aggregate by municipality
  const munTotals: Record<string, number> = {}
  const munTypes: Record<string, Record<string, number>> = {}
  const munDaily: Record<string, Record<string, number>> = {}

  for (const v of visits ?? []) {
    const munId = siteToMun[v.site_id]
    if (!munId) continue

    munTotals[munId] = (munTotals[munId] ?? 0) + 1

    if (!munTypes[munId]) munTypes[munId] = {}
    const vt = v.visitor_type ?? "unknown"
    munTypes[munId][vt] = (munTypes[munId][vt] ?? 0) + 1

    if (!munDaily[munId]) munDaily[munId] = {}
    munDaily[munId][v.visit_date] = (munDaily[munId][v.visit_date] ?? 0) + 1
  }

  return muns
    .filter((m) => filters.municipalityId ? m.id === filters.municipalityId : true)
    .map((m) => ({
      municipalityId: m.id,
      municipalityName: m.name,
      totalVisitors: munTotals[m.id] ?? 0,
      localCount: munTypes[m.id]?.local ?? munTypes[m.id]?.["local"] ?? 0,
      domesticCount: munTypes[m.id]?.domestic ?? 0,
      internationalCount: munTypes[m.id]?.international ?? 0,
      dailyVisits: Object.entries(munDaily[m.id] ?? {})
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort((a, b) => b.totalVisitors - a.totalVisitors)
}

// ── Report 3: Category Demand ──────────────────────────────────────────
// recommendations JOIN heritage_sites JOIN heritage_categories,
// GROUP BY category — shows which categories tourists are most/least
// interested in.

export async function getCategoryDemand(
  filters: ReportFilters,
): Promise<CategoryDemand[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 3a: Get all categories
  let catsQuery = supabase
    .from("heritage_categories")
    .select("id, name")
    .order("name")

  const { data: categories, error: catsErr } = await catsQuery
  if (catsErr) throw new Error(`Failed to fetch heritage categories: ${catsErr.message}`)

  const cats = categories ?? []
  if (cats.length === 0) return []

  // 3b: Get site-to-category mapping
  let sitesQuery = supabase
    .from("heritage_sites")
    .select("id, category_id")

  if (filters.categoryId) {
    sitesQuery = sitesQuery.eq("category_id", filters.categoryId)
  }
  if (filters.municipalityId) {
    sitesQuery = sitesQuery.eq("municipality_id", filters.municipalityId)
  }

  const { data: sites, error: sitesErr } = await sitesQuery
  if (sitesErr) throw new Error(`Failed to fetch heritage sites: ${sitesErr.message}`)

  const siteToCat: Record<string, string> = {}
  const catSiteIds: Record<string, string[]> = {}
  for (const site of sites ?? []) {
    if (!site.category_id) continue
    siteToCat[site.id] = site.category_id
    if (!catSiteIds[site.category_id]) catSiteIds[site.category_id] = []
    catSiteIds[site.category_id].push(site.id)
  }

  const allSiteIds = Object.keys(siteToCat)
  if (allSiteIds.length === 0) return []

  // 3c: Count recommendations per site within date range
  const { data: recs, error: recsErr } = await supabase
    .from("recommendations")
    .select("site_id")
    .in("site_id", allSiteIds)
    .gte("generated_at", filters.startDate)
    .lte("generated_at", filters.endDate)

  if (recsErr) throw new Error(`Failed to fetch recommendations: ${recsErr.message}`)

  // 3d: Count visits per site within date range
  const { data: visits, error: visitsErr } = await supabase
    .from("tourist_visits")
    .select("site_id")
    .in("site_id", allSiteIds)
    .gte("visit_date", filters.startDate)
    .lte("visit_date", filters.endDate)

  if (visitsErr) throw new Error(`Failed to fetch tourist visits: ${visitsErr.message}`)

  const recCounts: Record<string, number> = {}
  for (const r of recs ?? []) recCounts[r.site_id] = (recCounts[r.site_id] ?? 0) + 1

  const visitCounts: Record<string, number> = {}
  for (const v of visits ?? []) visitCounts[v.site_id] = (visitCounts[v.site_id] ?? 0) + 1

  // 3e: Aggregate by category
  const catRecs: Record<string, number> = {}
  const catVisits: Record<string, number> = {}

  for (const [siteId, catId] of Object.entries(siteToCat)) {
    catRecs[catId] = (catRecs[catId] ?? 0) + (recCounts[siteId] ?? 0)
    catVisits[catId] = (catVisits[catId] ?? 0) + (visitCounts[siteId] ?? 0)
  }

  return cats
    .filter((c) => filters.categoryId ? c.id === filters.categoryId : true)
    .map((c) => ({
      categoryId: c.id,
      categoryName: c.name,
      recommendationCount: catRecs[c.id] ?? 0,
      visitCount: catVisits[c.id] ?? 0,
    }))
    .sort((a, b) => b.recommendationCount - a.recommendationCount)
}

// ── Report 4: Resource Allocation Input ────────────────────────────────
// Combines visitor volume (tourist_visits) with route usage
// (routes, route_stops) per municipality.
// Composite score is a derived metric: (normalised visitor volume +
// normalised route activity) / 2.

export async function getResourceAllocation(
  filters: ReportFilters,
): Promise<ResourceAllocation[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 4a: Get all municipalities
  let munsQuery = supabase
    .from("municipalities")
    .select("id, name")
    .order("name")

  const { data: municipalities, error: munsErr } = await munsQuery
  if (munsErr) throw new Error(`Failed to fetch municipalities: ${munsErr.message}`)

  const muns = municipalities ?? []
  if (muns.length === 0) return []

  // 4b: Get site-to-municipality mapping
  let sitesQuery = supabase
    .from("heritage_sites")
    .select("id, municipality_id")

  if (filters.municipalityId) {
    sitesQuery = sitesQuery.eq("municipality_id", filters.municipalityId)
  }

  const { data: sites, error: sitesErr } = await sitesQuery
  if (sitesErr) throw new Error(`Failed to fetch heritage sites: ${sitesErr.message}`)

  const siteToMun: Record<string, string> = {}
  const munSiteIds: Record<string, string[]> = {}
  for (const site of sites ?? []) {
    siteToMun[site.id] = site.municipality_id
    if (!munSiteIds[site.municipality_id]) munSiteIds[site.municipality_id] = []
    munSiteIds[site.municipality_id].push(site.id)
  }

  const allSiteIds = Object.keys(siteToMun)
  if (allSiteIds.length === 0) return []

  // 4c: Visitor volume per municipality within date range
  const { data: visits, error: visitsErr } = await supabase
    .from("tourist_visits")
    .select("site_id")
    .in("site_id", allSiteIds)
    .gte("visit_date", filters.startDate)
    .lte("visit_date", filters.endDate)

  if (visitsErr) throw new Error(`Failed to fetch tourist visits: ${visitsErr.message}`)

  const munVisitorVolume: Record<string, number> = {}
  for (const v of visits ?? []) {
    const munId = siteToMun[v.site_id]
    if (munId) munVisitorVolume[munId] = (munVisitorVolume[munId] ?? 0) + 1
  }

  // 4d: Route usage — count routes that include stops at sites in each municipality
  const { data: routeStops, error: stopsErr } = await supabase
    .from("route_stops")
    .select("route_id, site_id")
    .in("site_id", allSiteIds)

  if (stopsErr) throw new Error(`Failed to fetch route stops: ${stopsErr.message}`)

  // Get unique routes per municipality
  const munRoutes: Record<string, Set<string>> = {}
  const munStopCounts: Record<string, number> = {}
  for (const rs of routeStops ?? []) {
    const munId = siteToMun[rs.site_id]
    if (!munId) continue
    if (!munRoutes[munId]) munRoutes[munId] = new Set()
    munRoutes[munId].add(rs.route_id)
    munStopCounts[munId] = (munStopCounts[munId] ?? 0) + 1
  }

  // 4e: Build composite score
  const volumes = Object.values(munVisitorVolume)
  const routeCounts = Object.values(munRoutes).map((s) => s.size)
  const maxVolume = volumes.length > 0 ? Math.max(...volumes) : 0
  const maxRoutes = routeCounts.length > 0 ? Math.max(...routeCounts) : 0

  return muns
    .filter((m) => filters.municipalityId ? m.id === filters.municipalityId : true)
    .map((m) => {
      const vol = munVisitorVolume[m.id] ?? 0
      const routeCnt = munRoutes[m.id]?.size ?? 0
      const stopCnt = munStopCounts[m.id] ?? 0

      const normVolume = maxVolume > 0 ? vol / maxVolume : 0
      const normRoutes = maxRoutes > 0 ? routeCnt / maxRoutes : 0

      return {
        municipalityId: m.id,
        municipalityName: m.name,
        visitorVolume: vol,
        routeCount: routeCnt,
        routeStopCount: stopCnt,
        compositeScore: Math.round(((normVolume + normRoutes) / 2) * 100),
      }
    })
    .sort((a, b) => b.compositeScore - a.compositeScore)
}

// ── Main aggregator (parallel fetch) ───────────────────────────────────

export async function getReportData(
  filters: ReportFilters,
  threshold: number = 10,
): Promise<ReportData> {
  const [underPromotedSites, municipalityPerformance, categoryDemand, resourceAllocation] =
    await Promise.all([
      getUnderPromotedSites(filters, threshold),
      getMunicipalityPerformance(filters),
      getCategoryDemand(filters),
      getResourceAllocation(filters),
    ])

  return {
    underPromotedSites,
    municipalityPerformance,
    categoryDemand,
    resourceAllocation,
  }
}

// ── Default date helpers ───────────────────────────────────────────────

export function getDefaultStartDate(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().split("T")[0]
}

export function getDefaultEndDate(): string {
  return new Date().toISOString().split("T")[0]
}
