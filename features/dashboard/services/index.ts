import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type {
  KpiData,
  CategoryBreakdown,
  RecentHeritageSite,
  VisitOverview,
  HeritageSiteMapMarker,
  RecommendationPerformance,
  SystemHealth,
  DashboardData,
} from "../types"

async function getKpiData(): Promise<KpiData> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { count: totalHeritageSites, error: errSites } = await supabase
    .from("heritage_sites")
    .select("*", { count: "exact", head: true })

  if (errSites) throw new Error(`Failed to count heritage_sites: ${errSites.message}`)

  const { count: totalMunicipalities, error: errMuns } = await supabase
    .from("municipalities")
    .select("*", { count: "exact", head: true })

  if (errMuns) throw new Error(`Failed to count municipalities: ${errMuns.message}`)

  // "Registered Users" means both staff and tourist profile counts combined
  // since the schema has no unified users table. Two separate COUNT queries
  // are used and summed in code — no JOIN/UNION across tables without shared key.
  const { count: staffCount, error: errStaff } = await supabase
    .from("staff_profiles")
    .select("*", { count: "exact", head: true })

  if (errStaff) throw new Error(`Failed to count staff_profiles: ${errStaff.message}`)

  const { count: touristCount, error: errTourist } = await supabase
    .from("tourist_profiles")
    .select("*", { count: "exact", head: true })

  if (errTourist) throw new Error(`Failed to count tourist_profiles: ${errTourist.message}`)

  const totalRegisteredUsers = (staffCount ?? 0) + (touristCount ?? 0)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]

  const { count: totalVisitsThisMonth, error: errVisits } = await supabase
    .from("tourist_visits")
    .select("*", { count: "exact", head: true })
    .gte("visit_date", monthStart)

  if (errVisits) throw new Error(`Failed to count tourist_visits: ${errVisits.message}`)

  return {
    totalHeritageSites: totalHeritageSites ?? 0,
    totalMunicipalities: totalMunicipalities ?? 0,
    totalRegisteredUsers,
    totalVisitsThisMonth: totalVisitsThisMonth ?? 0,
  }
}

async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_categories")
    .select("id, name, color")

  if (error) throw new Error(`Failed to fetch heritage_categories: ${error.message}`)

  const breakdown: CategoryBreakdown[] = []

  for (const cat of data ?? []) {
    const { count, error: countErr } = await supabase
      .from("heritage_sites")
      .select("*", { count: "exact", head: true })
      .eq("category_id", cat.id)

    if (countErr) throw new Error(`Failed to count sites for category ${cat.id}: ${countErr.message}`)

    breakdown.push({
      id: cat.id,
      name: cat.name,
      color: cat.color ?? "#6366f1",
      count: count ?? 0,
    })
  }

  return breakdown
}

async function getRecentSites(): Promise<RecentHeritageSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      id,
      site_name,
      created_at,
      municipality:municipality_id (name),
      category:category_id (name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) throw new Error(`Failed to fetch recent heritage_sites: ${error.message}`)

  function extractName(
    val: { name: string }[] | { name: string } | null,
  ): string {
    if (!val) return "—"
    if (Array.isArray(val)) return val[0]?.name ?? "—"
    return val.name ?? "—"
  }

  return (data ?? []).map((site) => {
    const siteRecord = site as Record<string, unknown>
    return {
      id: site.id,
      siteName: site.site_name,
      municipalityName: extractName(siteRecord.municipality as { name: string }[] | { name: string } | null),
      categoryName: extractName(siteRecord.category as { name: string }[] | { name: string } | null),
      createdAt: site.created_at,
    }
  })
}

async function getVisitOverview(): Promise<VisitOverview[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("tourist_visits")
    .select("visit_date")
    .gte("visit_date", monthStart)
    .lte("visit_date", monthEnd)

  if (error) throw new Error(`Failed to fetch tourist_visits: ${error.message}`)

  const grouped = new Map<string, number>()
  for (const row of data ?? []) {
    const key = row.visit_date
    grouped.set(key, (grouped.get(key) ?? 0) + 1)
  }

  return Array.from(grouped.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

async function getMapMarkers(): Promise<HeritageSiteMapMarker[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      id,
      site_name,
      latitude,
      longitude,
      category:category_id (name, color)
    `)
    .eq("publication_status", "Published")

  if (error) throw new Error(`Failed to fetch heritage_sites for map: ${error.message}`)

  function extractCategory(
    val: { name: string; color: string }[] | { name: string; color: string } | null,
  ): { name: string; color: string } {
    if (!val) return { name: "—", color: "#6366f1" }
    if (Array.isArray(val)) return val[0] ?? { name: "—", color: "#6366f1" }
    return val
  }

  return (data ?? [])
    .filter((site) => site.latitude != null && site.longitude != null)
    .map((site) => {
      const siteRecord = site as Record<string, unknown>
      const cat = extractCategory(siteRecord.category as { name: string; color: string }[] | { name: string; color: string } | null)
      return {
        id: site.id,
        siteName: site.site_name,
        latitude: Number(site.latitude),
        longitude: Number(site.longitude),
        categoryName: cat.name,
        categoryColor: cat.color,
      }
    })
}

async function getRecommendationPerformance(): Promise<RecommendationPerformance> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { count: totalRecommendations, error: errTotal } = await supabase
    .from("recommendations")
    .select("*", { count: "exact", head: true })
    .gte("generated_at", monthStart)

  if (errTotal) throw new Error(`Failed to count recommendations: ${errTotal.message}`)

  const { count: clickedCount, error: errClicked } = await supabase
    .from("recommendations")
    .select("*", { count: "exact", head: true })
    .gte("generated_at", monthStart)
    .eq("was_clicked", true)

  if (errClicked) throw new Error(`Failed to count clicked recommendations: ${errClicked.message}`)

  const { count: routePlansCreated, error: errRoute } = await supabase
    .from("recommendations")
    .select("*", { count: "exact", head: true })
    .gte("generated_at", monthStart)
    .eq("led_to_route", true)

  if (errRoute) throw new Error(`Failed to count recommendation routes: ${errRoute.message}`)

  const total = totalRecommendations ?? 0
  const clicked = clickedCount ?? 0
  const clickThroughRate = total > 0 ? Math.round((clicked / total) * 100) : 0

  return {
    totalRecommendations: total,
    clickThroughRate,
    routePlansCreated: routePlansCreated ?? 0,
  }
}

async function getSystemHealth(): Promise<SystemHealth> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: latestBackup, error: errBackup } = await supabase
    .from("backups")
    .select("created_at, status, type")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (errBackup) throw new Error(`Failed to fetch latest backup: ${errBackup.message}`)

  const { data: siteInfo, error: errSite } = await supabase
    .from("site_information")
    .select("system_version")
    .limit(1)
    .maybeSingle()

  if (errSite) throw new Error(`Failed to fetch site_information: ${errSite.message}`)

  return {
    lastBackupAt: latestBackup?.created_at ?? null,
    lastBackupStatus: latestBackup?.status ?? null,
    lastBackupType: latestBackup?.type ?? null,
    systemVersion: siteInfo?.system_version ?? null,
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    kpis,
    categoryBreakdown,
    recentSites,
    visitOverview,
    mapMarkers,
    recommendationPerformance,
    systemHealth,
  ] = await Promise.all([
    getKpiData(),
    getCategoryBreakdown(),
    getRecentSites(),
    getVisitOverview(),
    getMapMarkers(),
    getRecommendationPerformance(),
    getSystemHealth(),
  ])

  return {
    kpis,
    categoryBreakdown,
    recentSites,
    visitOverview,
    mapMarkers,
    recommendationPerformance,
    systemHealth,
  }
}
