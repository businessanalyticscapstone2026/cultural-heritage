import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { unwrapOne } from "@/lib/unwrap-one"
import type {
  MonitoringFilters,
  MonitoringMetric,
  MonitoringSummary,
  ActivityLogEntry,
  ActivityLogResult,
  SitePopularity,
  RecommendationPerf,
  UnderPromotedSite,
  MonitoringSiteOption,
} from "../types"

export async function resolveMTOUserId(): Promise<{ userId: string; municipalityId: string }> {
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

  if (!profile?.municipality_id) throw new Error("Unauthorized - no municipality assigned")

  return { userId: user.id, municipalityId: profile.municipality_id as string }
}

async function getSiteIdsForMunicipality(
  supabase: ReturnType<typeof createClient>,
  municipalityId: string,
  categoryId?: string | null
): Promise<string[]> {
  let query = supabase
    .from("heritage_sites")
    .select("id")
    .eq("municipality_id", municipalityId)
    .eq("publication_status", "published")

  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }

  const { data } = await query
  return data?.map((r) => r.id as string) ?? []
}

function getPriorPeriod(dateFrom: string, dateTo: string): { priorDateFrom: string; priorDateTo: string } {
  const from = new Date(dateFrom)
  const to = new Date(dateTo)
  const durationMs = to.getTime() - from.getTime()
  const priorStart = new Date(from.getTime() - durationMs)
  const priorEnd = new Date(from.getTime() - 1)
  return {
    priorDateFrom: priorStart.toISOString().slice(0, 10),
    priorDateTo: priorEnd.toISOString().slice(0, 10),
  }
}

function computeChange(current: number, prior: number): {
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

export async function getMonitoringSummary(
  municipalityId: string,
  filters: MonitoringFilters
): Promise<MonitoringSummary> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIdsForMunicipality(supabase, municipalityId, filters.categoryId)
  if (siteIds.length === 0) {
    return {
      totalActivities: 0,
      metrics: [
        { label: "Total Activities", value: 0, changePercent: 0, changeDirection: "stable", icon: "Activity", description: "all activities this period", drillDownType: "all" },
        { label: "Site Visits", value: 0, changePercent: 0, changeDirection: "stable", icon: "Users", description: "site visits this period", drillDownType: "visit" },
        { label: "Recommendations Clicked", value: 0, changePercent: 0, changeDirection: "stable", icon: "MousePointerClick", description: "click-throughs this period", drillDownType: "recommendation_click" },
        { label: "Route Plans Created", value: 0, changePercent: 0, changeDirection: "stable", icon: "Route", description: "route plans this period", drillDownType: "all" },
      ],
    }
  }

  const { priorDateFrom, priorDateTo } = getPriorPeriod(filters.dateFrom, filters.dateTo)

  const [
    visitsNow, visitsPrior,
    scansNow, scansPrior,
    bookmarksNow, bookmarksPrior,
    reviewsNow, reviewsPrior,
    recsClickedNow, recsClickedPrior,
    routesNow, routesPrior,
  ] = await Promise.all([
    supabase.from("tourist_visits").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("visit_date", filters.dateFrom).lte("visit_date", filters.dateTo),
    supabase.from("tourist_visits").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("visit_date", priorDateFrom).lte("visit_date", priorDateTo),
    supabase.from("qr_scan_logs").select("id", { count: "exact", head: true }).in("qr_code_id", (await supabase.from("qr_codes").select("id").in("site_id", siteIds)).data?.map((q) => q.id as string) ?? []).gte("scanned_at", filters.dateFrom + "T00:00:00").lte("scanned_at", filters.dateTo + "T23:59:59"),
    supabase.from("qr_scan_logs").select("id", { count: "exact", head: true }).in("qr_code_id", (await supabase.from("qr_codes").select("id").in("site_id", siteIds)).data?.map((q) => q.id as string) ?? []).gte("scanned_at", priorDateFrom + "T00:00:00").lte("scanned_at", priorDateTo + "T23:59:59"),
    supabase.from("bookmarks").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("created_at", filters.dateFrom).lte("created_at", filters.dateTo + "T23:59:59"),
    supabase.from("bookmarks").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("created_at", priorDateFrom).lte("created_at", priorDateTo + "T23:59:59"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("created_at", filters.dateFrom).lte("created_at", filters.dateTo + "T23:59:59"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).in("site_id", siteIds).gte("created_at", priorDateFrom).lte("created_at", priorDateTo + "T23:59:59"),
    supabase.from("recommendations").select("id", { count: "exact", head: true }).in("site_id", siteIds).eq("was_clicked", true).gte("generated_at", filters.dateFrom).lte("generated_at", filters.dateTo + "T23:59:59"),
    supabase.from("recommendations").select("id", { count: "exact", head: true }).in("site_id", siteIds).eq("was_clicked", true).gte("generated_at", priorDateFrom).lte("generated_at", priorDateTo + "T23:59:59"),
    supabase.from("routes").select("id", { count: "exact", head: true }).gte("created_at", filters.dateFrom).lte("created_at", filters.dateTo + "T23:59:59"),
    supabase.from("routes").select("id", { count: "exact", head: true }).gte("created_at", priorDateFrom).lte("created_at", priorDateTo + "T23:59:59"),
  ])

  const totalNow = (visitsNow.count ?? 0) + (scansNow.count ?? 0) + (bookmarksNow.count ?? 0) + (reviewsNow.count ?? 0)
  const totalPrior = (visitsPrior.count ?? 0) + (scansPrior.count ?? 0) + (bookmarksPrior.count ?? 0) + (reviewsPrior.count ?? 0) + (recsClickedPrior.count ?? 0)
  const visitsNowCount = visitsNow.count ?? 0
  const visitsPriorCount = visitsPrior.count ?? 0
  const recsClickedNowCount = recsClickedNow.count ?? 0
  const recsClickedPriorCount = recsClickedPrior.count ?? 0
  const routesNowCount = routesNow.count ?? 0
  const routesPriorCount = routesPrior.count ?? 0

  const totalChange = computeChange(totalNow, totalPrior)
  const visitsChange = computeChange(visitsNowCount, visitsPriorCount)
  const recsClickedChange = computeChange(recsClickedNowCount, recsClickedPriorCount)
  const routesChange = computeChange(routesNowCount, routesPriorCount)

  const metrics: MonitoringMetric[] = [
    { label: "Total Activities", value: totalNow, ...totalChange, icon: "Activity", description: "all activities this period", drillDownType: "all" },
    { label: "Site Visits", value: visitsNowCount, ...visitsChange, icon: "Users", description: "site visits this period", drillDownType: "visit" },
    { label: "Recommendations Clicked", value: recsClickedNowCount, ...recsClickedChange, icon: "MousePointerClick", description: "click-throughs this period", drillDownType: "recommendation_click" },
    { label: "Route Plans Created", value: routesNowCount, ...routesChange, icon: "Route", description: "route plans this period", drillDownType: "all" },
  ]

  return { metrics, totalActivities: totalNow }
}

export async function getActivityLog(
  municipalityId: string,
  filters: MonitoringFilters,
  page: number,
  pageSize: number
): Promise<ActivityLogResult> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIdsForMunicipality(supabase, municipalityId, filters.categoryId)
  if (siteIds.length === 0) {
    return { items: [], total: 0, page, pageSize }
  }

  const queries: { type: string; query: Promise<{ data: unknown[] | null }> }[] = []

  if (!filters.activityType || filters.activityType === "visit") {
    let q = supabase
      .from("tourist_visits")
      .select("id, site_id, visitor_type, visit_date")
      .in("site_id", siteIds)
      .gte("visit_date", filters.dateFrom)
      .lte("visit_date", filters.dateTo)
    if (filters.siteId) q = q.eq("site_id", filters.siteId)
    queries.push({ type: "visit", query: q as unknown as Promise<{ data: unknown[] | null }> })
  }

  if (!filters.activityType || filters.activityType === "qr_scan") {
    const qrCodeIds = (
      await supabase.from("qr_codes").select("id").in("site_id", siteIds)
    ).data?.map((q) => q.id as string) ?? []

    if (qrCodeIds.length > 0) {
      const q = supabase
        .from("qr_scan_logs")
        .select("id, qr_code_id, scanned_at")
        .in("qr_code_id", qrCodeIds)
        .gte("scanned_at", filters.dateFrom + "T00:00:00")
        .lte("scanned_at", filters.dateTo + "T23:59:59")
      queries.push({ type: "qr_scan", query: q as unknown as Promise<{ data: unknown[] | null }> })
    }
  }

  if (!filters.activityType || filters.activityType === "recommendation_click") {
    let q = supabase
      .from("recommendations")
      .select("id, site_id, generated_at")
      .in("site_id", siteIds)
      .eq("was_clicked", true)
      .gte("generated_at", filters.dateFrom)
      .lte("generated_at", filters.dateTo + "T23:59:59")
    if (filters.siteId) q = q.eq("site_id", filters.siteId)
    queries.push({ type: "recommendation_click", query: q as unknown as Promise<{ data: unknown[] | null }> })
  }

  if (!filters.activityType || filters.activityType === "bookmark") {
    let q = supabase
      .from("bookmarks")
      .select("id, site_id, created_at")
      .in("site_id", siteIds)
      .gte("created_at", filters.dateFrom)
      .lte("created_at", filters.dateTo + "T23:59:59")
    if (filters.siteId) q = q.eq("site_id", filters.siteId)
    queries.push({ type: "bookmark", query: q as unknown as Promise<{ data: unknown[] | null }> })
  }

  if (!filters.activityType || filters.activityType === "review") {
    let q = supabase
      .from("reviews")
      .select("id, site_id, created_at")
      .in("site_id", siteIds)
      .gte("created_at", filters.dateFrom)
      .lte("created_at", filters.dateTo + "T23:59:59")
    if (filters.siteId) q = q.eq("site_id", filters.siteId)
    queries.push({ type: "review", query: q as unknown as Promise<{ data: unknown[] | null }> })
  }

  const results = await Promise.all(queries.map((q) => q.query))

  const allEntries: { id: string; type: string; siteId: string; timestamp: string }[] = []

  for (let i = 0; i < results.length; i++) {
    const type = queries[i].type
    const data = results[i].data ?? []
    for (const row of data) {
      const r = row as Record<string, unknown>
      allEntries.push({
        id: r.id as string,
        type,
        siteId: type === "qr_scan" ? "" : (r.site_id as string),
        timestamp: (r.visit_date ?? r.created_at ?? r.generated_at ?? r.scanned_at ?? "") as string,
      })
    }
  }

  allEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const allSiteIds = [...new Set(allEntries.filter((e) => e.siteId).map((e) => e.siteId))]

  const qrSiteMap = new Map<string, string>()
  const qrEntries = allEntries.filter((e) => e.type === "qr_scan")
  if (qrEntries.length > 0) {
    const { data: qrCodes } = await supabase
      .from("qr_codes")
      .select("id, site_id")
      .in("id", qrEntries.map((e) => e.id))
    for (const qc of qrCodes ?? []) {
      qrSiteMap.set(qc.id as string, qc.site_id as string)
    }
    for (const entry of qrEntries) {
      entry.siteId = qrSiteMap.get(entry.id) ?? ""
      if (entry.siteId && !allSiteIds.includes(entry.siteId)) {
        allSiteIds.push(entry.siteId)
      }
    }
  }

  const { data: siteData } = await supabase
    .from("heritage_sites")
    .select("id, site_name")
    .in("id", allSiteIds.length > 0 ? allSiteIds : ["00000000-0000-0000-0000-000000000000"])

  const siteNameMap = new Map<string, string>()
  for (const s of siteData ?? []) {
    siteNameMap.set(s.id as string, s.site_name as string)
  }

  const total = allEntries.length
  const start = (page - 1) * pageSize
  const paged = allEntries.slice(start, start + pageSize)

  const activityEntries: ActivityLogEntry[] = paged.map((entry) => ({
    id: entry.id,
    type: entry.type as ActivityLogEntry["type"],
    siteId: entry.siteId,
    siteName: siteNameMap.get(entry.siteId) ?? "Unknown",
    visitorType: null,
    description: getDescription(entry.type),
    timestamp: entry.timestamp,
  }))

  return { items: activityEntries, total, page, pageSize }
}

function getDescription(type: string): string {
  switch (type) {
    case "visit": return "Visited the heritage site"
    case "qr_scan": return "Scanned a QR code"
    case "recommendation_click": return "Clicked on a recommendation"
    case "bookmark": return "Bookmarked the site"
    case "review": return "Submitted a review"
    default: return ""
  }
}

export async function getSitePopularity(
  municipalityId: string,
  filters: MonitoringFilters
): Promise<SitePopularity[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIdsForMunicipality(supabase, municipalityId, filters.categoryId)
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

  const { data: siteData } = await supabase
    .from("heritage_sites")
    .select("id, site_name, category:heritage_categories(name)")
    .in("id", siteIds)

  const siteInfoMap = new Map<string, { name: string; category: string }>()
  for (const site of siteData ?? []) {
    siteInfoMap.set(site.id as string, {
      name: site.site_name as string,
      category: unwrapOne(site.category as unknown as { name: string } | { name: string }[] | null)?.name ?? "Uncategorized",
    })
  }

  const totalVisits = visits.length

  return Array.from(siteCounts.entries())
    .map(([siteId, count]) => {
      const info = siteInfoMap.get(siteId)
      return {
        siteId,
        siteName: info?.name ?? "Unknown",
        categoryName: info?.category ?? "Uncategorized",
        visits: count,
        percentage: Math.round((count / totalVisits) * 100),
      }
    })
    .sort((a, b) => b.visits - a.visits)
}

export async function getMTORecommendationPerformance(
  municipalityId: string,
  filters: MonitoringFilters
): Promise<RecommendationPerf[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIdsForMunicipality(supabase, municipalityId, filters.categoryId)
  if (siteIds.length === 0) return []

  const { data: siteData } = await supabase
    .from("heritage_sites")
    .select("id, site_name")
    .in("id", siteIds)

  if (!siteData || siteData.length === 0) return []

  const siteNameMap = new Map<string, string>()
  for (const s of siteData) {
    siteNameMap.set(s.id as string, s.site_name as string)
  }

  const results: RecommendationPerf[] = []

  for (const site of siteData) {
    const siteId = site.id as string

    const [recs, clicks, convs] = await Promise.all([
      supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("site_id", siteId).gte("generated_at", filters.dateFrom).lte("generated_at", filters.dateTo + "T23:59:59"),
      supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("site_id", siteId).eq("was_clicked", true).gte("generated_at", filters.dateFrom).lte("generated_at", filters.dateTo + "T23:59:59"),
      supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("site_id", siteId).eq("led_to_route", true).gte("generated_at", filters.dateFrom).lte("generated_at", filters.dateTo + "T23:59:59"),
    ])

    const timesRecommended = recs.count ?? 0
    const timesClicked = clicks.count ?? 0
    const timesConverted = convs.count ?? 0

    results.push({
      siteId,
      siteName: siteNameMap.get(siteId) ?? "Unknown",
      timesRecommended,
      timesClicked,
      timesConverted,
      clickRate: timesRecommended > 0 ? Math.round((timesClicked / timesRecommended) * 100) : 0,
      convRate: timesRecommended > 0 ? Math.round((timesConverted / timesRecommended) * 100) : 0,
    })
  }

  return results.sort((a, b) => b.convRate - a.convRate)
}

export async function getUnderPromotedSites(
  municipalityId: string,
  filters: MonitoringFilters
): Promise<UnderPromotedSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIdsForMunicipality(supabase, municipalityId, filters.categoryId)
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

  const sorted = Array.from(siteCounts.entries()).sort((a, b) => a[1] - b[1])
  const bottom3 = sorted.slice(0, 3)

  const bottomSiteIds = bottom3.map(([id]) => id)

  const { data: siteData } = await supabase
    .from("heritage_sites")
    .select("id, site_name, category:heritage_categories(name)")
    .in("id", bottomSiteIds)

  const siteInfoMap = new Map<string, { name: string; category: string }>()
  for (const site of siteData ?? []) {
    siteInfoMap.set(site.id as string, {
      name: site.site_name as string,
      category: unwrapOne(site.category as unknown as { name: string } | { name: string }[] | null)?.name ?? "Uncategorized",
    })
  }

  const recPerf = await getMTORecommendationPerformance(municipalityId, filters)
  const recMap = new Map<string, number>()
  for (const r of recPerf) {
    recMap.set(r.siteId, r.timesRecommended)
  }

  return bottom3.map(([siteId, count]) => {
    const info = siteInfoMap.get(siteId)
    return {
      siteId,
      siteName: info?.name ?? "Unknown",
      categoryName: info?.category ?? "Uncategorized",
      visits: count,
      recommendationCount: recMap.get(siteId) ?? 0,
    }
  })
}

export async function getMonitoringSites(municipalityId: string): Promise<MonitoringSiteOption[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from("heritage_sites")
    .select("id, site_name")
    .eq("municipality_id", municipalityId)
    .eq("publication_status", "published")
    .order("site_name", { ascending: true })

  return data?.map((s) => ({ id: s.id as string, name: s.site_name as string })) ?? []
}

export async function getMonitoringCategories(): Promise<{ id: string; name: string }[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from("heritage_categories")
    .select("id, name")
    .order("name", { ascending: true })

  return data?.map((c) => ({ id: c.id as string, name: c.name as string })) ?? []
}
