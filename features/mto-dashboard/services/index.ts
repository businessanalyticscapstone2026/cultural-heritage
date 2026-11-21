import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { unwrapOne } from "@/lib/unwrap-one"
import { CHART_PALETTE } from "@/lib/chart-colors"
import { normalizeDeviceType } from "@/lib/device-type"
import { formatCategoryName } from "@/lib/format-category"
import type {
  DashboardStat,
  MonthlyVisitsPoint,
  CategoryBreakdownPoint,
  RecentSite,
  TouristActivity,
  VisitorStats,
  RecentScan,
  TopAttraction,
  ScanDeviceBreakdownPoint,
  CategoryDistributionPoint,
  DashboardInsight,
} from "@/types/mto-dashboard"

const CATEGORY_COLORS = [
  "#2E5BFF",
  "#0F2747",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
]

import { computeChange, deriveMTODashboardInsights } from "./insights"
export { computeChange, deriveMTODashboardInsights }

function getMonthBounds(monthsAgo: number) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59)
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

async function resolveSiteIds(
  supabase: ReturnType<typeof createClient>,
  municipalityId: string,
): Promise<string[]> {
  const { data } = await supabase.from("heritage_sites").select("id").eq("municipality_id", municipalityId)
  return data?.map((s) => s.id as string) ?? []
}

type SiteWithCategory = { id: string; category_id: string | null; category: unknown }

export async function getMTOSitesForMunicipality(
  municipalityId: string,
): Promise<{ siteIds: string[]; sites: SiteWithCategory[] }> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from("heritage_sites")
    .select("id, category_id, category:heritage_categories(name)")
    .eq("municipality_id", municipalityId)

  const sites = data ?? []
  return { siteIds: sites.map((s) => s.id as string), sites }
}

export async function getMTODashboardStats(
  municipalityId: string,
  preloadedSiteIds?: string[],
): Promise<DashboardStat[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const thisMonth = getMonthBounds(0)
  const lastMonth = getMonthBounds(1)

  const siteIds = preloadedSiteIds ?? (await resolveSiteIds(supabase, municipalityId))

  const [sitesCount, sitesCountPrev] = await Promise.all([
    supabase
      .from("heritage_sites")
      .select("id", { count: "exact", head: true })
      .eq("municipality_id", municipalityId)
      .eq("publication_status", "published"),
    supabase
      .from("heritage_sites")
      .select("id", { count: "exact", head: true })
      .eq("municipality_id", municipalityId)
      .eq("publication_status", "published")
      .lte("created_at", lastMonth.end),
  ])

  const qrCodeIds =
    siteIds.length === 0
      ? []
      : (await supabase.from("qr_codes").select("id").in("site_id", siteIds)).data?.map((q) => q.id) ?? []

  const countScans = (start: string, end: string) =>
    qrCodeIds.length === 0
      ? Promise.resolve({ count: 0, error: null })
      : supabase
          .from("qr_scan_logs")
          .select("id", { count: "exact", head: true })
          .in("qr_code_id", qrCodeIds)
          .gte("scanned_at", start)
          .lte("scanned_at", end)

  const countBookmarks = (end?: string) => {
    if (siteIds.length === 0) return Promise.resolve({ count: 0, error: null })
    const query = supabase
      .from("bookmarks")
      .select("id", { count: "exact", head: true })
      .in("site_id", siteIds)
    return end ? query.lte("created_at", end) : query
  }

  const countActiveQr = (end?: string) => {
    if (siteIds.length === 0) return Promise.resolve({ count: 0, error: null })
    const query = supabase
      .from("qr_codes")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .in("site_id", siteIds)
    return end ? query.lte("created_at", end) : query
  }

  const countRecommendationClicks = async (start: string, end: string) => {
    const { count, error } = await supabase
      .from("recommendations")
      .select("id", { count: "exact", head: true })
      .eq("municipality_id", municipalityId)
      .eq("was_clicked", true)
      .gte("clicked_at", start)
      .lte("clicked_at", end)
    if (error) return 0
    return count ?? 0
  }

  const [visitsCount, visitsCountPrev, bookmarksCount, bookmarksCountPrev, recsCount, recsCountPrev, qrCount, qrCountPrev] =
    await Promise.all([
      countScans(thisMonth.start, thisMonth.end),
      countScans(lastMonth.start, lastMonth.end),
      countBookmarks(),
      countBookmarks(lastMonth.end),
      countRecommendationClicks(thisMonth.start, thisMonth.end),
      countRecommendationClicks(lastMonth.start, lastMonth.end),
      countActiveQr(),
      countActiveQr(lastMonth.end),
    ])

  const sitesChange = computeChange(sitesCount.count ?? 0, sitesCountPrev.count ?? 0)
  const visitsChange = computeChange(visitsCount.count ?? 0, visitsCountPrev.count ?? 0)
  const bookmarksChange = computeChange(bookmarksCount.count ?? 0, bookmarksCountPrev.count ?? 0)
  const recsChange = computeChange(recsCount, recsCountPrev)
  const qrChange = computeChange(qrCount.count ?? 0, qrCountPrev.count ?? 0)

  return [
    {
      label: "Heritage Sites",
      value: sitesCount.count ?? 0,
      changePercent: sitesChange.changePercent,
      changeDirection: sitesChange.changeDirection,
      icon: "Landmark",
      description: "vs last month",
    },
    {
      label: "QR Scans",
      value: visitsCount.count ?? 0,
      changePercent: visitsChange.changePercent,
      changeDirection: visitsChange.changeDirection,
      icon: "ScanLine",
      description: "this month",
    },
    {
      label: "Saved Attractions",
      value: bookmarksCount.count ?? 0,
      changePercent: bookmarksChange.changePercent,
      changeDirection: bookmarksChange.changeDirection,
      icon: "Bookmark",
      description: "total saves",
    },
    {
      label: "Recommendation Clicks",
      value: recsCount,
      changePercent: recsChange.changePercent,
      changeDirection: recsChange.changeDirection,
      icon: "Sparkles",
      description: "this month",
    },
    {
      label: "Active QR Codes",
      value: qrCount.count ?? 0,
      changePercent: qrChange.changePercent,
      changeDirection: qrChange.changeDirection,
      icon: "QrCode",
      description: "currently active",
    },
  ]
}

export async function getMTOVisitsOverview(
  municipalityId: string,
  preloadedSiteIds?: string[],
): Promise<MonthlyVisitsPoint[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = preloadedSiteIds ?? (await resolveSiteIds(supabase, municipalityId))
  if (siteIds.length === 0) {
    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("en", { month: "short" }),
      currentYear: 0,
      priorYear: 0,
    }))
  }

  const currentYear = new Date().getFullYear()
  const priorYear = currentYear - 1

  const [currentData, priorData] = await Promise.all([
    supabase
      .from("tourist_visits")
      .select("visit_date")
      .in("site_id", siteIds)
      .gte("visit_date", `${currentYear}-01-01`)
      .lte("visit_date", `${currentYear}-12-31`),
    supabase
      .from("tourist_visits")
      .select("visit_date")
      .in("site_id", siteIds)
      .gte("visit_date", `${priorYear}-01-01`)
      .lte("visit_date", `${priorYear}-12-31`),
  ])

  const countVisitsByMonth = (rows: { visit_date: string | null }[]) => {
    const counts = new Array(12).fill(0)
    for (const row of rows) {
      if (!row.visit_date) continue
      const d = new Date(row.visit_date)
      if (!isNaN(d.getTime())) {
        counts[d.getMonth()]++
      }
    }
    return counts
  }

  const currentCounts = countVisitsByMonth(currentData.data ?? [])
  const priorCounts = countVisitsByMonth(priorData.data ?? [])

  return Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString("en", { month: "short" }),
    currentYear: currentCounts[i],
    priorYear: priorCounts[i],
  }))
}

export async function getMTOVisitsByCategory(
  municipalityId: string,
  preloadedSites?: SiteWithCategory[],
): Promise<CategoryBreakdownPoint[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const sites =
    preloadedSites ??
    (
      await supabase
        .from("heritage_sites")
        .select("id, category_id, category:heritage_categories(name)")
        .eq("municipality_id", municipalityId)
    ).data

  if (!sites || sites.length === 0) return []

  const siteCategoryMap = new Map<string, string>()
  for (const site of sites) {
    const cat = unwrapOne(site.category as unknown as { name: string } | { name: string }[] | null)
    siteCategoryMap.set(site.id as string, formatCategoryName(cat?.name ?? "Uncategorized"))
  }

  const siteIds = sites.map((s) => s.id)
  if (siteIds.length === 0) return []

  const { data: visits } = await supabase
    .from("tourist_visits")
    .select("site_id")
    .in("site_id", siteIds)

  const categoryCounts = new Map<string, number>()
  for (const visit of visits ?? []) {
    const catName = siteCategoryMap.get(visit.site_id) ?? "Uncategorized"
    categoryCounts.set(catName, (categoryCounts.get(catName) ?? 0) + 1)
  }

  return Array.from(categoryCounts.entries())
    .map(([name, value], i) => ({
      name,
      value,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
}

export async function getMTORecentSites(municipalityId: string): Promise<RecentSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select("id, site_name, barangay, category:heritage_categories(name), publication_status, created_at")
    .eq("municipality_id", municipalityId)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) throw error

  const siteIds = (data ?? []).map((r) => r.id as string)
  const { data: mediaRows } = await supabase
    .from("heritage_site_media")
    .select("site_id, file_url, is_primary, media_type")
    .in("site_id", siteIds)
    .eq("media_type", "image")

  const thumbnailMap = new Map<string, string>()
  for (const m of mediaRows ?? []) {
    const rec = m as Record<string, unknown>
    const siteId = rec.site_id as string
    if (!thumbnailMap.has(siteId)) {
      thumbnailMap.set(siteId, rec.file_url as string)
    }
    if (rec.is_primary === true) {
      thumbnailMap.set(siteId, rec.file_url as string)
    }
  }

  return (data ?? []).map((row) => {
    const cat = unwrapOne(row.category as unknown as { name: string } | { name: string }[] | null)
    return {
      id: row.id as string,
      siteName: row.site_name as string,
      categoryName: formatCategoryName(cat?.name) || null,
      barangay: (row.barangay as string) ?? null,
      thumbnailUrl: thumbnailMap.get(row.id as string) ?? null,
      status: (row.publication_status as RecentSite["status"]) ?? "draft",
      createdAt: row.created_at as string,
    }
  })
}

export async function getMTORecentActivity(municipalityId: string): Promise<TouristActivity[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = (
    await supabase.from("heritage_sites").select("id").eq("municipality_id", municipalityId)
  ).data?.map((s) => s.id) ?? []

  if (siteIds.length === 0) return []

  const siteNameMap = new Map<string, string>()
  const { data: siteRows } = await supabase
    .from("heritage_sites")
    .select("id, site_name")
    .in("id", siteIds)
  for (const s of siteRows ?? []) {
    siteNameMap.set(s.id, s.site_name as string)
  }

  const [visits, scans, bookmarks, reviews] = await Promise.all([
    supabase
      .from("tourist_visits")
      .select("id, site_id, visit_date")
      .in("site_id", siteIds)
      .order("visit_date", { ascending: false })
      .limit(5),
    supabase
      .from("qr_scan_logs")
      .select("id, scanned_at, device_type, qr_code:qr_codes!inner(site_id)")
      .in("qr_codes.site_id", siteIds)
      .order("scanned_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookmarks")
      .select("id, site_id, created_at")
      .in("site_id", siteIds)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("reviews")
      .select("id, site_id, created_at, rating")
      .in("site_id", siteIds)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const activities: TouristActivity[] = []

  for (const v of visits.data ?? []) {
    activities.push({
      id: v.id as string,
      type: "visit",
      description: `Tourist visited ${siteNameMap.get(v.site_id as string) ?? "a site"}`,
      timestamp: v.visit_date as string,
      siteName: siteNameMap.get(v.site_id as string) ?? "Unknown",
    })
  }

  for (const s of scans.data ?? []) {
    const qrCode = unwrapOne(s.qr_code as unknown as { site_id: string } | { site_id: string }[] | null)
    activities.push({
      id: s.id as string,
      type: "qr_scan",
      description: `QR code scanned on ${s.device_type ?? "device"}`,
      timestamp: s.scanned_at as string,
      siteName: siteNameMap.get(qrCode?.site_id ?? "") ?? "Unknown",
    })
  }

  for (const b of bookmarks.data ?? []) {
    activities.push({
      id: b.id as string,
      type: "bookmark",
      description: `Site saved to bookmarks`,
      timestamp: b.created_at as string,
      siteName: siteNameMap.get(b.site_id as string) ?? "Unknown",
    })
  }

  for (const r of reviews.data ?? []) {
    activities.push({
      id: r.id as string,
      type: "review",
      description: `New ${r.rating as number}-star review submitted`,
      timestamp: r.created_at as string,
      siteName: siteNameMap.get(r.site_id as string) ?? "Unknown",
    })
  }

  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)
}

export async function getMTOVisitorStats(
  municipalityId: string,
  preloadedSiteIds?: string[],
): Promise<VisitorStats> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = preloadedSiteIds ?? (await resolveSiteIds(supabase, municipalityId))

  if (siteIds.length === 0) return { local: 0, domestic: 0, international: 0, priorYearTotal: 0 }

  const currentYear = new Date().getFullYear()
  const priorYear = currentYear - 1

  const [currentResult, priorResult] = await Promise.all([
    supabase
      .from("tourist_visits")
      .select("visitor_origin")
      .in("site_id", siteIds)
      .gte("visit_date", `${currentYear}-01-01`)
      .lte("visit_date", `${currentYear}-12-31`),
    supabase
      .from("tourist_visits")
      .select("id", { count: "exact", head: true })
      .in("site_id", siteIds)
      .gte("visit_date", `${priorYear}-01-01`)
      .lte("visit_date", `${priorYear}-12-31`),
  ])

  const stats: VisitorStats = { local: 0, domestic: 0, international: 0, priorYearTotal: priorResult.count ?? 0 }
  for (const row of currentResult.data ?? []) {
    const type = (row as unknown as { visitor_origin: string }).visitor_origin as "local" | "domestic" | "international"
    if (type in stats) stats[type]++
  }
  return stats
}

export async function getMTORecentScans(
  municipalityId: string,
  preloadedSiteIds?: string[],
): Promise<RecentScan[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = preloadedSiteIds ?? (await resolveSiteIds(supabase, municipalityId))
  if (siteIds.length === 0) return []

  const { data: qrRows } = await supabase
    .from("qr_codes")
    .select("id, site_id, site:heritage_sites(site_name)")
    .in("site_id", siteIds)

  if (!qrRows || qrRows.length === 0) return []

  const qrIdToSiteName = new Map<string, string>()
  const qrCodeIds: string[] = []
  for (const q of qrRows) {
    const siteObj = unwrapOne(q.site as unknown as { site_name: string } | { site_name: string }[] | null)
    qrIdToSiteName.set(q.id as string, siteObj?.site_name ?? "Unknown")
    qrCodeIds.push(q.id as string)
  }

  const { data: scanLogs, error } = await supabase
    .from("qr_scan_logs")
    .select("id, scanned_at, device_type, qr_code_id")
    .in("qr_code_id", qrCodeIds)
    .order("scanned_at", { ascending: false })
    .limit(5)

  if (error) throw error

  return (scanLogs ?? []).map((row) => ({
    id: row.id as string,
    siteName: qrIdToSiteName.get(row.qr_code_id as string) ?? "Unknown",
    scannedAt: row.scanned_at as string,
    deviceType: (row.device_type as string) ?? null,
  }))
}

export async function getMTOTodayScanCount(municipalityId: string): Promise<number> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from("qr_scan_logs")
    .select("id", { count: "exact", head: true })
    .gte("scanned_at", today.toISOString())
    .in(
      "qr_code_id",
      (
        await supabase
          .from("qr_codes")
          .select("id")
          .in(
            "site_id",
            (
              await supabase
                .from("heritage_sites")
                .select("id")
                .eq("municipality_id", municipalityId)
            ).data?.map((s) => s.id as string) ?? []
          )
      ).data?.map((q) => q.id as string) ?? []
    )

  if (error) throw error
  return count ?? 0
}

export async function getMTOTopAttractions(
  municipalityId: string,
  limit = 5,
  preloadedSiteIds?: string[],
): Promise<TopAttraction[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = preloadedSiteIds ?? (await resolveSiteIds(supabase, municipalityId))

  if (siteIds.length === 0) return []

  const thisMonth = getMonthBounds(0)
  const startDate = thisMonth.start.slice(0, 10)
  const endDate = thisMonth.end.slice(0, 10)

  const { data: visits } = await supabase
    .from("tourist_visits")
    .select("site_id")
    .in("site_id", siteIds)
    .gte("visit_date", startDate)
    .lte("visit_date", endDate)

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

  const { data: siteData } = await supabase
    .from("heritage_sites")
    .select("id, site_name")
    .in("id", topSiteIds)

  const siteNameMap = new Map<string, string>()
  for (const site of siteData ?? []) {
    siteNameMap.set(site.id as string, site.site_name as string)
  }

  const totalVisits = visits.length

  return topSiteIds.map((id) => ({
    siteId: id,
    siteName: siteNameMap.get(id) ?? "Unknown",
    visits: siteCounts.get(id) ?? 0,
    percentage: Math.round(((siteCounts.get(id) ?? 0) / totalVisits) * 100),
  }))
}

export async function getMTOScanDeviceBreakdown(
  municipalityId: string,
  preloadedSiteIds?: string[],
): Promise<ScanDeviceBreakdownPoint[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = preloadedSiteIds ?? (await resolveSiteIds(supabase, municipalityId))

  const qrCodeIds =
    siteIds.length === 0
      ? []
      : (await supabase.from("qr_codes").select("id").in("site_id", siteIds)).data?.map((q) => q.id as string) ?? []

  if (qrCodeIds.length === 0) return []

  const thisMonth = getMonthBounds(0)

  const { data: scans } = await supabase
    .from("qr_scan_logs")
    .select("device_type")
    .in("qr_code_id", qrCodeIds)
    .gte("scanned_at", thisMonth.start)
    .lte("scanned_at", thisMonth.end)

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

export async function getMTOCategoryDistribution(
  municipalityId: string,
  preloadedSites?: SiteWithCategory[],
): Promise<CategoryDistributionPoint[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const sites =
    preloadedSites ??
    (
      await supabase
        .from("heritage_sites")
        .select("id, category_id, category:heritage_categories(name)")
        .eq("municipality_id", municipalityId)
    ).data

  if (!sites || sites.length === 0) return []

  const categoryCounts = new Map<string, number>()
  for (const site of sites) {
    const cat = unwrapOne(site.category as unknown as { name: string } | { name: string }[] | null)
    const name = formatCategoryName(cat?.name ?? "Uncategorized")
    categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1)
  }

  const total = sites.length

  return Array.from(categoryCounts.entries())
    .map(([name, count], i) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
      color: CHART_PALETTE[i % CHART_PALETTE.length],
    }))
    .sort((a, b) => b.count - a.count)
}


