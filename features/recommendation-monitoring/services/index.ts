import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { UNDER_PROMOTION_PERCENTILE_THRESHOLD } from "../utils"
import { unwrapOne } from "@/lib/unwrap-one"
import type {
  RecommendationMonitoringFilters,
  RecommendationFunnelMetrics,
  RecommendationSiteSummary,
  UnderPromotedSite,
  SiteRecommendationDetail,
  LogRecommendationEventPayload,
} from "../types"

export async function resolveMunicipalityId(): Promise<string> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("municipality_id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.municipality_id) throw new Error("No municipality assigned")
  return profile.municipality_id as string
}

async function getSiteIdsForMunicipality(
  supabase: ReturnType<typeof createClient>,
  municipalityId: string,
  categoryId?: string | null,
  siteId?: string | null
): Promise<string[]> {
  let query = supabase
    .from("heritage_sites")
    .select("id")
    .eq("municipality_id", municipalityId)
    .eq("publication_status", "published")

  if (categoryId) query = query.eq("category_id", categoryId)
  if (siteId) query = query.eq("id", siteId)

  const { data } = await query
  return data?.map((r) => r.id as string) ?? []
}

function dateRange(dateFrom: string, dateTo: string) {
  return { from: dateFrom, to: dateTo + "T23:59:59" }
}

export async function logRecommendationEvent(
  municipalityId: string,
  payload: LogRecommendationEventPayload
): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  await supabase.from("recommendations").insert({
    site_id: payload.siteId,
    municipality_id: municipalityId,
    tourist_id: payload.touristId ?? null,
    session_id: payload.sessionId ?? null,
    score: payload.score ?? null,
    method: payload.source ?? "weighted_hybrid",
  })
}

export async function markRecommendationClicked(
  recommendationId: string
): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  await supabase
    .from("recommendations")
    .update({ was_clicked: true, clicked_at: new Date().toISOString() })
    .eq("id", recommendationId)
}

export async function markRecommendationConverted(
  recommendationId: string,
  type: "route" | "bookmark"
): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  if (type === "route") {
    await supabase
      .from("recommendations")
      .update({ led_to_route: true })
      .eq("id", recommendationId)
  } else if (type === "bookmark") {
    await supabase
      .from("recommendations")
      .update({ bookmarked: true, bookmarked_at: new Date().toISOString() })
      .eq("id", recommendationId)
  }
}

export async function getRecommendationFunnel(
  municipalityId: string,
  filters: RecommendationMonitoringFilters
): Promise<RecommendationFunnelMetrics> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIdsForMunicipality(supabase, municipalityId, filters.categoryId)
  if (siteIds.length === 0) {
    return { generated: 0, clicked: 0, bookmarked: 0, routePlans: 0, clickThroughRate: 0, conversionRate: 0 }
  }

  const range = dateRange(filters.dateFrom, filters.dateTo)

  const [generated, clicked, bookmarked, routePlans] = await Promise.all([
    supabase
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .in("site_id", siteIds)
      .gte("generated_at", range.from)
      .lte("generated_at", range.to),
    supabase
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .in("site_id", siteIds)
      .eq("was_clicked", true)
      .gte("generated_at", range.from)
      .lte("generated_at", range.to),
    supabase
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .in("site_id", siteIds)
      .eq("bookmarked", true)
      .gte("generated_at", range.from)
      .lte("generated_at", range.to),
    supabase
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .in("site_id", siteIds)
      .eq("led_to_route", true)
      .gte("generated_at", range.from)
      .lte("generated_at", range.to),
  ])

  const g = generated.count ?? 0
  const c = clicked.count ?? 0
  const b = bookmarked.count ?? 0
  const r = routePlans.count ?? 0

  return {
    generated: g,
    clicked: c,
    bookmarked: b,
    routePlans: r,
    clickThroughRate: g > 0 ? Math.round((c / g) * 10000) / 100 : 0,
    conversionRate: c > 0 ? Math.round(((r + b) / c) * 10000) / 100 : 0,
  }
}

export async function getRecommendationSiteSummaries(
  municipalityId: string,
  filters: RecommendationMonitoringFilters
): Promise<RecommendationSiteSummary[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = await getSiteIdsForMunicipality(supabase, municipalityId, filters.categoryId)
  if (siteIds.length === 0) return []

  const range = dateRange(filters.dateFrom, filters.dateTo)

  const { data: siteData } = await supabase
    .from("heritage_sites")
    .select("id, site_name, category:heritage_categories(name)")
    .in("id", siteIds)

  const siteInfoMap = new Map<string, { name: string; category: string }>()
  for (const s of siteData ?? []) {
    siteInfoMap.set(s.id as string, {
      name: s.site_name as string,
      category: unwrapOne(s.category as unknown as { name: string } | { name: string }[] | null)?.name ?? "Uncategorized",
    })
  }

  const results: RecommendationSiteSummary[] = []

  for (const siteId of siteIds) {
    const [recs, clicks, bookmarks, convs, scoreAvg] = await Promise.all([
      supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("site_id", siteId).gte("generated_at", range.from).lte("generated_at", range.to),
      supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("site_id", siteId).eq("was_clicked", true).gte("generated_at", range.from).lte("generated_at", range.to),
      supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("site_id", siteId).eq("bookmarked", true).gte("generated_at", range.from).lte("generated_at", range.to),
      supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("site_id", siteId).eq("led_to_route", true).gte("generated_at", range.from).lte("generated_at", range.to),
      supabase.from("recommendations").select("score").eq("site_id", siteId).gte("generated_at", range.from).lte("generated_at", range.to),
    ])

    const timesRecommended = recs.count ?? 0
    const timesClicked = clicks.count ?? 0
    const timesBookmarked = bookmarks.count ?? 0
    const timesConverted = (convs.count ?? 0) + timesBookmarked
    const scores = (scoreAvg.data ?? []).map((r) => Number(r.score) || 0)
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    const info = siteInfoMap.get(siteId)
    results.push({
      siteId,
      siteName: info?.name ?? "Unknown",
      categoryName: info?.category ?? "Uncategorized",
      timesRecommended,
      timesClicked,
      timesBookmarked,
      timesConverted,
      clickThroughRate: timesRecommended > 0 ? Math.round((timesClicked / timesRecommended) * 10000) / 100 : 0,
      conversionRate: timesClicked > 0 ? Math.round((timesConverted / timesClicked) * 10000) / 100 : 0,
      averageScore: Math.round(avgScore * 100) / 100,
    })
  }

  return results.sort((a, b) => b.clickThroughRate - a.clickThroughRate)
}

export async function getUnderPromotedRecommendations(
  municipalityId: string,
  filters: RecommendationMonitoringFilters
): Promise<UnderPromotedSite[]> {
  const summaries = await getRecommendationSiteSummaries(municipalityId, {
    ...filters,
    siteId: null,
  })

  if (summaries.length === 0) return []

  const sorted = [...summaries].sort((a, b) => a.timesRecommended - b.timesRecommended)
  const threshold = Math.max(1, Math.ceil(sorted.length * UNDER_PROMOTION_PERCENTILE_THRESHOLD))
  const bottomSites = sorted.slice(0, threshold)

  const averageCtr = summaries.reduce((sum, s) => sum + s.clickThroughRate, 0) / summaries.length

  return bottomSites.map((site) => {
    const reasons: string[] = []
    if (site.timesRecommended <= Math.floor(sorted.length * 0.1)) {
      reasons.push("very low recommendation volume")
    } else {
      reasons.push("low recommendation volume")
    }
    if (site.clickThroughRate < averageCtr) {
      reasons.push("below-average click-through rate")
    }
    if (site.timesClicked === 0) {
      reasons.push("no tourist engagement")
    }

    return {
      siteId: site.siteId,
      siteName: site.siteName,
      categoryName: site.categoryName,
      timesRecommended: site.timesRecommended,
      timesClicked: site.timesClicked,
      clickThroughRate: site.clickThroughRate,
      percentileRank: Math.round((sorted.indexOf(site) / sorted.length) * 100),
      flagReason: reasons.join("; "),
    }
  })
}

export async function getSiteRecommendationDetail(
  municipalityId: string,
  siteId: string,
  filters: RecommendationMonitoringFilters
): Promise<SiteRecommendationDetail | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: site } = await supabase
    .from("heritage_sites")
    .select("id, site_name, category:heritage_categories(name)")
    .eq("id", siteId)
    .eq("municipality_id", municipalityId)
    .maybeSingle()

  if (!site) return null

  const categoryName = unwrapOne(site.category as unknown as { name: string } | { name: string }[] | null)?.name ?? "Uncategorized"
  const range = dateRange(filters.dateFrom, filters.dateTo)

  const [recs, clicks, bookmarks, convs, allRecs] = await Promise.all([
    supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("site_id", siteId).gte("generated_at", range.from).lte("generated_at", range.to),
    supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("site_id", siteId).eq("was_clicked", true).gte("generated_at", range.from).lte("generated_at", range.to),
    supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("site_id", siteId).eq("bookmarked", true).gte("generated_at", range.from).lte("generated_at", range.to),
    supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("site_id", siteId).eq("led_to_route", true).gte("generated_at", range.from).lte("generated_at", range.to),
    supabase.from("recommendations").select("method, score").eq("site_id", siteId).gte("generated_at", range.from).lte("generated_at", range.to),
  ])

  const totalGenerated = recs.count ?? 0
  const totalClicked = clicks.count ?? 0
  const totalBookmarked = bookmarks.count ?? 0
  const totalConverted = (convs.count ?? 0) + totalBookmarked
  const allRows = allRecs.data ?? []
  const scores = allRows.map((r) => Number(r.score) || 0)
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  const sourceCounts = new Map<string, number>()
  for (const row of allRows) {
    const method = (row.method as string) ?? "weighted_hybrid"
    sourceCounts.set(method, (sourceCounts.get(method) ?? 0) + 1)
  }

  const sourceBreakdown = Array.from(sourceCounts.entries()).map(([source, count]) => ({
    source: source as SiteRecommendationDetail["sourceBreakdown"][number]["source"],
    count,
    percentage: totalGenerated > 0 ? Math.round((count / totalGenerated) * 10000) / 100 : 0,
  }))

  const { data: dailyData } = await supabase
    .from("recommendations")
    .select("generated_at, was_clicked, led_to_route")
    .eq("site_id", siteId)
    .gte("generated_at", range.from)
    .lte("generated_at", range.to)
    .order("generated_at", { ascending: true })

  const dailyMap = new Map<string, { generated: number; clicked: number; converted: number }>()
  for (const row of dailyData ?? []) {
    const date = (row.generated_at as string).slice(0, 10)
    if (!dailyMap.has(date)) dailyMap.set(date, { generated: 0, clicked: 0, converted: 0 })
    const bucket = dailyMap.get(date)!
    bucket.generated++
    if (row.was_clicked) bucket.clicked++
    if (row.led_to_route) bucket.converted++
  }

  const dailyTrend = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    siteId,
    siteName: site.site_name as string,
    categoryName,
    totalGenerated,
    totalClicked,
    totalBookmarked,
    totalConverted,
    clickThroughRate: totalGenerated > 0 ? Math.round((totalClicked / totalGenerated) * 10000) / 100 : 0,
    conversionRate: totalClicked > 0 ? Math.round((totalConverted / totalClicked) * 10000) / 100 : 0,
    averageScore: Math.round(avgScore * 100) / 100,
    sourceBreakdown,
    dailyTrend,
  }
}
