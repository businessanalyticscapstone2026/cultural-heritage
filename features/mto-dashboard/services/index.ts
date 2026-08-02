import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type {
  DashboardStat,
  MonthlyVisitsPoint,
  CategoryBreakdownPoint,
  RecentSite,
  TouristActivity,
  VisitorStats,
  RecentScan,
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

function computeChange(current: number, prior: number): { changePercent: number; changeDirection: "up" | "down" | "stable" } {
  if (prior === 0 && current === 0) return { changePercent: 0, changeDirection: "stable" }
  if (prior === 0) return { changePercent: 100, changeDirection: "up" }
  const pct = Math.round(((current - prior) / prior) * 100)
  return {
    changePercent: Math.abs(pct),
    changeDirection: pct > 0 ? "up" : pct < 0 ? "down" : "stable",
  }
}

function getMonthBounds(monthsAgo: number) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59)
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

export async function getMTODashboardStats(municipalityId: string): Promise<DashboardStat[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const thisMonth = getMonthBounds(0)
  const lastMonth = getMonthBounds(1)

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

  const qrCodeIds = (
    await supabase
      .from("qr_codes")
      .select("id")
      .in(
        "site_id",
        (
          await supabase.from("heritage_sites").select("id").eq("municipality_id", municipalityId)
        ).data?.map((s) => s.id) ?? [],
      )
  ).data?.map((q) => q.id) ?? []

  const countScans = (start: string, end: string) =>
    qrCodeIds.length === 0
      ? Promise.resolve({ count: 0, error: null })
      : supabase
          .from("qr_scan_logs")
          .select("id", { count: "exact", head: true })
          .in("qr_code_id", qrCodeIds)
          .gte("scanned_at", start)
          .lte("scanned_at", end)

  const [visitsCount, visitsCountPrev] = await Promise.all([
    countScans(thisMonth.start, thisMonth.end),
    countScans(lastMonth.start, lastMonth.end),
  ])

  const [bookmarksCount, bookmarksCountPrev] = await Promise.all([
    supabase
      .from("bookmarks")
      .select("id", { count: "exact", head: true })
      .in("site_id", (
        await supabase.from("heritage_sites").select("id").eq("municipality_id", municipalityId)
      ).data?.map((s) => s.id) ?? []),
    supabase
      .from("bookmarks")
      .select("id", { count: "exact", head: true })
      .in("site_id", (
        await supabase.from("heritage_sites").select("id").eq("municipality_id", municipalityId)
      ).data?.map((s) => s.id) ?? [])
      .lte("created_at", lastMonth.end),
  ])

  const siteIds = (
    await supabase.from("heritage_sites").select("id").eq("municipality_id", municipalityId)
  ).data?.map((s) => s.id) ?? []

  const countDistinctClickedSites = async (start: string, end: string) => {
    const { data } = await supabase
      .from("recommendations")
      .select("site_id")
      .eq("was_clicked", true)
      .in("site_id", siteIds)
      .gte("clicked_at", start)
      .lte("clicked_at", end)
    return new Set((data ?? []).map((r) => r.site_id as string)).size
  }

  const [recsCount, recsCountPrev] = await Promise.all([
    countDistinctClickedSites(thisMonth.start, thisMonth.end),
    countDistinctClickedSites(lastMonth.start, lastMonth.end),
  ])

  const [qrCount, qrCountPrev] = await Promise.all([
    supabase
      .from("qr_codes")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .in("site_id", (
        await supabase.from("heritage_sites").select("id").eq("municipality_id", municipalityId)
      ).data?.map((s) => s.id) ?? []),
    supabase
      .from("qr_codes")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .in("site_id", (
        await supabase.from("heritage_sites").select("id").eq("municipality_id", municipalityId)
      ).data?.map((s) => s.id) ?? [])
      .lte("created_at", lastMonth.end),
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
      label: "Popular Attractions",
      value: bookmarksCount.count ?? 0,
      changePercent: bookmarksChange.changePercent,
      changeDirection: bookmarksChange.changeDirection,
      icon: "Bookmark",
      description: "total saves",
    },
    {
      label: "Sites Clicked",
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

export async function getMTOVisitsOverview(municipalityId: string): Promise<MonthlyVisitsPoint[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const currentYear = new Date().getFullYear()
  const priorYear = currentYear - 1

  const siteIds = (
    await supabase.from("heritage_sites").select("id").eq("municipality_id", municipalityId)
  ).data?.map((s) => s.id) ?? []

  if (siteIds.length === 0) {
    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("en", { month: "short" }),
      currentYear: 0,
      priorYear: 0,
    }))
  }

  const yearBounds = (year: number) => ({
    start: `${year}-01-01T00:00:00.000Z`,
    end: `${year}-12-31T23:59:59.999Z`,
  })

  const [currentData, priorData] = await Promise.all([
    supabase
      .from("recommendations")
      .select("site_id, clicked_at")
      .eq("was_clicked", true)
      .in("site_id", siteIds)
      .gte("clicked_at", yearBounds(currentYear).start)
      .lte("clicked_at", yearBounds(currentYear).end),
    supabase
      .from("recommendations")
      .select("site_id, clicked_at")
      .eq("was_clicked", true)
      .in("site_id", siteIds)
      .gte("clicked_at", yearBounds(priorYear).start)
      .lte("clicked_at", yearBounds(priorYear).end),
  ])

  const distinctSitesByMonth = (rows: { site_id: string; clicked_at: string }[], year: number) => {
    const monthSets = Array.from({ length: 12 }, () => new Set<string>())
    for (const row of rows) {
      const d = new Date(row.clicked_at)
      if (d.getFullYear() === year) monthSets[d.getMonth()].add(row.site_id)
    }
    return monthSets.map((set) => set.size)
  }

  const currentCounts = distinctSitesByMonth(currentData.data ?? [], currentYear)
  const priorCounts = distinctSitesByMonth(priorData.data ?? [], priorYear)

  return Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString("en", { month: "short" }),
    currentYear: currentCounts[i],
    priorYear: priorCounts[i],
  }))
}

export async function getMTOVisitsByCategory(municipalityId: string): Promise<CategoryBreakdownPoint[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: sites } = await supabase
    .from("heritage_sites")
    .select("id, category_id, category:heritage_categories(name)")
    .eq("municipality_id", municipalityId)

  if (!sites || sites.length === 0) return []

  const siteCategoryMap = new Map<string, string>()
  for (const site of sites) {
    const catArr = site.category as unknown as { name: string }[] | null
    const cat = Array.isArray(catArr) ? catArr[0] : null
    siteCategoryMap.set(site.id as string, cat?.name ?? "Uncategorized")
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
    const catArr = row.category as unknown as { name: string }[] | null
    const cat = Array.isArray(catArr) ? catArr[0] : null
    return {
      id: row.id as string,
      siteName: row.site_name as string,
      categoryName: cat?.name ?? null,
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
    const qrCodeArr = s.qr_code as unknown as { site_id: string }[] | null
    const qrCode = Array.isArray(qrCodeArr) ? qrCodeArr[0] : null
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

export async function getMTOVisitorStats(municipalityId: string): Promise<VisitorStats> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const siteIds = (
    await supabase.from("heritage_sites").select("id").eq("municipality_id", municipalityId)
  ).data?.map((s) => s.id) ?? []

  if (siteIds.length === 0) return { local: 0, domestic: 0, international: 0, priorYearTotal: 0 }

  const currentYear = new Date().getFullYear()
  const priorYear = currentYear - 1

  const [currentResult, priorResult] = await Promise.all([
    supabase
      .from("tourist_visits")
      .select("visitor_type")
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
    const type = row.visitor_type as "local" | "domestic" | "international"
    if (type in stats) stats[type]++
  }
  return stats
}

export async function getMTORecentScans(municipalityId: string): Promise<RecentScan[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("qr_scan_logs")
    .select("id, scanned_at, device_type, qr_code:qr_codes!inner(site_id, site:heritage_sites!inner(site_name, municipality_id))")
    .eq("qr_codes.site.municipality_id", municipalityId)
    .order("scanned_at", { ascending: false })
    .limit(5)

  if (error) throw error

  return (data ?? []).map((row) => {
    const qrCodeArr = row.qr_code as unknown as Record<string, unknown>[] | null
    const qrCode = Array.isArray(qrCodeArr) ? qrCodeArr[0] : null
    const siteArr = qrCode?.site as unknown as Record<string, unknown>[] | null
    const site = Array.isArray(siteArr) ? siteArr[0] : null
    return {
      id: row.id as string,
      siteName: (site?.site_name as string) ?? "Unknown",
      scannedAt: row.scanned_at as string,
      deviceType: (row.device_type as string) ?? null,
    }
  })
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
