import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
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

export async function resolvePtcaoAdmin(): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("role_id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.role_id) throw new Error("Unauthorized")

  const { data: role } = await supabase
    .from("roles")
    .select("name")
    .eq("id", profile.role_id)
    .maybeSingle()

  if (role?.name !== "ptcao_admin") throw new Error("Unauthorized")
}

async function getSiteIdsForFilters(
  supabase: ReturnType<typeof createClient>,
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

export async function getProvinceSummary(
  filters: AnalyticsFilters
): Promise<ProvinceMetric[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIdsForFilters(supabase, filters)
  if (siteIds.length === 0) {
    return [
      { label: "Total Visitors", value: 0, changePercent: 0, changeDirection: "stable", icon: "Users", description: "this period" },
      { label: "Sites Visited", value: 0, changePercent: 0, changeDirection: "stable", icon: "Landmark", description: "unique sites" },
      { label: "Recommendations Generated", value: 0, changePercent: 0, changeDirection: "stable", icon: "Sparkles", description: "this period" },
      { label: "Recommendations Clicked", value: 0, changePercent: 0, changeDirection: "stable", icon: "MousePointerClick", description: "click-throughs" },
      { label: "Route Plans Created", value: 0, changePercent: 0, changeDirection: "stable", icon: "Route", description: "this period" },
    ]
  }

  const dateFrom = filters.dateFrom
  const dateTo = filters.dateTo

  const priorDateFrom = getPriorPeriodStart(dateFrom, dateTo)
  const priorDateTo = getPriorPeriodEnd(dateFrom)

  const [visitsNow, visitsPrior, sitesNow, sitesPrior, recsNow, recsPrior, clickedNow, clickedPrior, routesNow, routesPrior] = await Promise.all([
    supabase.from("tourist_visits").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("visit_date", dateFrom).lte("visit_date", dateTo),
    supabase.from("tourist_visits").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("visit_date", priorDateFrom).lte("visit_date", priorDateTo),
    supabase.from("tourist_visits").select("site_id").in("site_id", siteIds).gte("visit_date", dateFrom).lte("visit_date", dateTo),
    supabase.from("tourist_visits").select("site_id").in("site_id", siteIds).gte("visit_date", priorDateFrom).lte("visit_date", priorDateTo),
    supabase.from("recommendations").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("generated_at", dateFrom).lte("generated_at", dateTo + "T23:59:59"),
    supabase.from("recommendations").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("generated_at", priorDateFrom).lte("generated_at", priorDateTo + "T23:59:59"),
    supabase.from("recommendations").select("id", { count: "exact", head: true }).in("site_id", siteIds).eq("was_clicked", true).gte("generated_at", dateFrom).lte("generated_at", dateTo + "T23:59:59"),
    supabase.from("recommendations").select("id", { count: "exact", head: true }).in("site_id", siteIds).eq("was_clicked", true).gte("generated_at", priorDateFrom).lte("generated_at", priorDateTo + "T23:59:59"),
    supabase.from("routes").select("id", { count: "exact", head: true }).gte("created_at", dateFrom).lte("created_at", dateTo + "T23:59:59"),
    supabase.from("routes").select("id", { count: "exact", head: true }).gte("created_at", priorDateFrom).lte("created_at", priorDateTo + "T23:59:59"),
  ])

  const uniqueSitesNow = new Set(sitesNow.data?.map((r) => r.site_id)).size
  const uniqueSitesPrior = new Set(sitesPrior.data?.map((r) => r.site_id)).size

  const visitorsChange = computeChange(visitsNow.count ?? 0, visitsPrior.count ?? 0)
  const sitesChange = computeChange(uniqueSitesNow, uniqueSitesPrior)
  const recsChange = computeChange(recsNow.count ?? 0, recsPrior.count ?? 0)
  const clickedChange = computeChange(clickedNow.count ?? 0, clickedPrior.count ?? 0)
  const routesChange = computeChange(routesNow.count ?? 0, routesPrior.count ?? 0)

  return [
    { label: "Total Visitors", value: visitsNow.count ?? 0, ...visitorsChange, icon: "Users", description: "this period" },
    { label: "Sites Visited", value: uniqueSitesNow, ...sitesChange, icon: "Landmark", description: "unique sites" },
    { label: "Recommendations Generated", value: recsNow.count ?? 0, ...recsChange, icon: "Sparkles", description: "this period" },
    { label: "Recommendations Clicked", value: clickedNow.count ?? 0, ...clickedChange, icon: "MousePointerClick", description: "click-throughs" },
    { label: "Route Plans Created", value: routesNow.count ?? 0, ...routesChange, icon: "Route", description: "this period" },
  ]
}

export async function getVisitorTrend(
  filters: AnalyticsFilters,
  granularity: TrendGranularity
): Promise<VisitorTrendPoint[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

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

export async function getVisitsByMunicipality(
  filters: AnalyticsFilters
): Promise<MunicipalityVisit[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: municipalities } = await supabase
    .from("municipalities")
    .select("id, name")
    .in("name", [...FIRST_DISTRICT_MUNICIPALITIES])

  if (!municipalities || municipalities.length === 0) return []

  const results: MunicipalityVisit[] = []

  for (let i = 0; i < municipalities.length; i++) {
    const muni = municipalities[i]
    const { data: sites } = await supabase
      .from("heritage_sites")
      .select("id")
      .eq("municipality_id", muni.id)

    const siteIds = sites?.map((s) => s.id as string) ?? []
    if (siteIds.length === 0) {
      results.push({
        municipalityId: muni.id as string,
        municipalityName: muni.name as string,
        visits: 0,
        percentage: 0,
        color: MUNICIPALITY_COLORS[i % MUNICIPALITY_COLORS.length],
      })
      continue
    }

    let query = supabase
      .from("tourist_visits")
      .select("id", { count: "exact", head: true })
      .in("site_id", siteIds)
      .gte("visit_date", filters.dateFrom)
      .lte("visit_date", filters.dateTo)

    if (filters.categoryId) {
      const { data: catSites } = await supabase
        .from("heritage_sites")
        .select("id")
        .eq("municipality_id", muni.id)
        .eq("category_id", filters.categoryId)
      const catSiteIds = catSites?.map((s) => s.id as string) ?? []
      query = query.in("site_id", catSiteIds.length > 0 ? catSiteIds : ["00000000-0000-0000-0000-000000000000"])
    }

    const { count } = await query

    results.push({
      municipalityId: muni.id as string,
      municipalityName: muni.name as string,
      visits: count ?? 0,
      percentage: 0,
      color: MUNICIPALITY_COLORS[i % MUNICIPALITY_COLORS.length],
    })
  }

  const totalVisits = results.reduce((sum, r) => sum + r.visits, 0)
  for (const r of results) {
    r.percentage = totalVisits > 0 ? Math.round((r.visits / totalVisits) * 100) : 0
  }

  return results.sort((a, b) => b.visits - a.visits)
}

export async function getDemographics(
  filters: AnalyticsFilters
): Promise<{ ageGroups: AgeGroupBreakdown[]; visitorTypes: VisitorTypeBreakdown[] }> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

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

export async function getTopCategories(
  filters: AnalyticsFilters
): Promise<CategoryVisit[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

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

export async function getTopSites(
  filters: AnalyticsFilters,
  limit = 10
): Promise<TopVisitedSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

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

export async function getRecommendationPerformance(
  filters: AnalyticsFilters
): Promise<RecommendationFunnel> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

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
