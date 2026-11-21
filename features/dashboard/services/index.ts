import { unstable_cache } from "next/cache"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createTokenClient, resolveAccessToken } from "@/utils/supabase/cached"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags"
import { FIRST_DISTRICT_MUNICIPALITIES } from "@/lib/constants"
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

type SupabaseServer = SupabaseClient

// ---------------------------------------------------------------------------
// Uncached fetchers — accept a shared client (no createClient inside)
// ---------------------------------------------------------------------------

async function fetchKpiData(supabase: SupabaseServer): Promise<KpiData> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0]

  // Bug 3 fix: run all 10 independent count queries in parallel instead of sequentially.
  // Bug 1 fix: count tourist_visits (not qr_scan_logs) for "Visitors This Month" —
  //   tourist_visits includes page-load visits, QR-originated visits, and rec-click visits.
  const [
    { count: totalHeritageSites, error: errSites },
    { count: prevHeritageSites, error: errSitesPrev },
    { count: totalMunicipalities, error: errMuns },
    { count: prevMunicipalities, error: errMunsPrev },
    { count: staffCount, error: errStaff },
    { count: touristCount, error: errTourist },
    { count: prevStaffCount, error: errStaffPrev },
    { count: prevTouristCount, error: errTouristPrev },
    { count: totalVisitsThisMonth, error: errVisits },
    { count: prevVisits, error: errVisitsPrev },
  ] = await Promise.all([
    supabase.from("heritage_sites").select("*", { count: "exact", head: true }),
    supabase.from("heritage_sites").select("*", { count: "exact", head: true }).lt("created_at", monthStart),
    supabase.from("municipalities").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("municipalities").select("*", { count: "exact", head: true }).eq("status", "active").lt("created_at", monthStart),
    supabase.from("staff_profiles").select("*", { count: "exact", head: true }),
    supabase.from("tourist_profiles").select("*", { count: "exact", head: true }),
    supabase.from("staff_profiles").select("*", { count: "exact", head: true }).lt("created_at", monthStart),
    supabase.from("tourist_profiles").select("*", { count: "exact", head: true }).lt("created_at", monthStart),
    // Bug 1 fix: tourist_visits instead of qr_scan_logs
    supabase.from("tourist_visits").select("*", { count: "exact", head: true }).gte("visit_date", monthStart),
    supabase.from("tourist_visits").select("*", { count: "exact", head: true }).gte("visit_date", prevMonthStart).lt("visit_date", monthStart),
  ])

  if (errSites) throw new Error(`Failed to count heritage_sites: ${errSites.message}`)
  if (errSitesPrev) throw new Error(`Failed to count prior heritage_sites: ${errSitesPrev.message}`)
  if (errMuns) throw new Error(`Failed to count municipalities: ${JSON.stringify(errMuns)}`)
  if (errMunsPrev) throw new Error(`Failed to count prior municipalities: ${JSON.stringify(errMunsPrev)}`)
  if (errStaff) throw new Error(`Failed to count staff_profiles: ${errStaff.message}`)
  if (errTourist) throw new Error(`Failed to count tourist_profiles: ${errTourist.message}`)
  if (errStaffPrev) throw new Error(`Failed to count prior staff_profiles: ${errStaffPrev.message}`)
  if (errTouristPrev) throw new Error(`Failed to count prior tourist_profiles: ${errTouristPrev.message}`)
  if (errVisits) throw new Error(`Failed to count tourist_visits: ${errVisits.message}`)
  if (errVisitsPrev) throw new Error(`Failed to count prior tourist_visits: ${errVisitsPrev.message}`)

  return {
    heritageSites: { value: totalHeritageSites ?? 0, previous: prevHeritageSites ?? 0 },
    activeMunicipalities: { value: totalMunicipalities ?? 0, previous: prevMunicipalities ?? 0 },
    registeredUsers: {
      value: (staffCount ?? 0) + (touristCount ?? 0),
      previous: (prevStaffCount ?? 0) + (prevTouristCount ?? 0),
    },
    visitsThisMonth: { value: totalVisitsThisMonth ?? 0, previous: prevVisits ?? 0 },
  }
}

/**
 * Single grouped query via PostgREST embedded count
 * (heritage_categories → heritage_sites(count)) instead of N+1 per-category COUNTs.
 */
async function fetchCategoryBreakdown(supabase: SupabaseServer): Promise<CategoryBreakdown[]> {
  const { data, error } = await supabase
    .from("heritage_categories")
    .select("id, name, color, heritage_sites(count)")

  if (error) throw new Error(`Failed to fetch heritage_categories: ${error.message}`)

  return (data ?? []).map((cat) => {
    const sitesCount = cat.heritage_sites as { count: number }[] | null
    const count = Array.isArray(sitesCount) ? (sitesCount[0]?.count ?? 0) : 0
    return {
      id: cat.id as string,
      name: cat.name as string,
      color: (cat.color as string | null) ?? "#6366f1",
      count,
    }
  })
}

function extractName(
  val: { name: string }[] | { name: string } | null,
): string {
  if (!val) return "—"
  if (Array.isArray(val)) return val[0]?.name ?? "—"
  return val.name ?? "—"
}

async function fetchRecentSites(supabase: SupabaseServer): Promise<RecentHeritageSite[]> {
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

  return (data ?? []).map((site) => {
    const siteRecord = site as Record<string, unknown>
    return {
      id: site.id as string,
      siteName: site.site_name as string,
      municipalityName: extractName(siteRecord.municipality as { name: string }[] | { name: string } | null),
      categoryName: extractName(siteRecord.category as { name: string }[] | { name: string } | null),
      createdAt: site.created_at as string,
    }
  })
}

async function fetchVisitOverview(supabase: SupabaseServer): Promise<VisitOverview[]> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0]

  // Bug 2 fix: group tourist_visits by visit_date instead of qr_scan_logs by scanned_at.
  // tourist_visits includes all visit sources (page loads, QR scans, rec clicks).
  const { data, error } = await supabase
    .from("tourist_visits")
    .select("visit_date")
    .gte("visit_date", monthStart)
    .lt("visit_date", nextMonthStart)

  if (error) throw new Error(`Failed to fetch tourist_visits: ${error.message}`)

  const grouped = new Map<string, number>()
  for (const row of data ?? []) {
    const key = row.visit_date as string
    grouped.set(key, (grouped.get(key) ?? 0) + 1)
  }

  return Array.from(grouped.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function extractCategory(
  val: { name: string; color: string }[] | { name: string; color: string } | null,
): { name: string; color: string } {
  if (!val) return { name: "—", color: "#6366f1" }
  if (Array.isArray(val)) return val[0] ?? { name: "—", color: "#6366f1" }
  return val
}

async function fetchMapMarkers(supabase: SupabaseServer): Promise<HeritageSiteMapMarker[]> {
  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      id,
      site_name,
      latitude,
      longitude,
      category:category_id (name, color)
    `)
    .eq("publication_status", "published")

  if (error) throw new Error(`Failed to fetch heritage_sites for map: ${error.message}`)

  return (data ?? [])
    .filter((site) => site.latitude != null && site.longitude != null)
    .map((site) => {
      const siteRecord = site as Record<string, unknown>
      const cat = extractCategory(
        siteRecord.category as { name: string; color: string }[] | { name: string; color: string } | null,
      )
      return {
        id: site.id as string,
        siteName: site.site_name as string,
        latitude: Number(site.latitude),
        longitude: Number(site.longitude),
        categoryName: cat.name,
        categoryColor: cat.color,
      }
    })
}

async function fetchRecommendationPerformance(
  supabase: SupabaseServer,
): Promise<RecommendationPerformance> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Bug 4 fix: scope recommendations to First District sites only.
  const { data: firstDistrictMunis } = await supabase
    .from("municipalities")
    .select("id")
    .in("name", [...FIRST_DISTRICT_MUNICIPALITIES])

  const muniIds = (firstDistrictMunis ?? []).map((m) => m.id as string)
  const { data: siteRows } = muniIds.length > 0
    ? await supabase.from("heritage_sites").select("id").in("municipality_id", muniIds)
    : { data: [] }
  const siteIds = (siteRows ?? []).map((s) => s.id as string)

  const [
    { count: totalRecommendations, error: errTotal },
    { count: clickedCount, error: errClicked },
    { count: routePlansCreated, error: errRoute },
    { data: monthlyReviews, error: errReviews },
  ] = await Promise.all([
    siteIds.length > 0
      ? supabase.from("recommendations").select("*", { count: "exact", head: true }).in("site_id", siteIds).gte("generated_at", monthStart)
      : Promise.resolve({ count: 0, error: null }),
    siteIds.length > 0
      ? supabase.from("recommendations").select("*", { count: "exact", head: true }).in("site_id", siteIds).gte("generated_at", monthStart).eq("was_clicked", true)
      : Promise.resolve({ count: 0, error: null }),
    siteIds.length > 0
      ? supabase.from("recommendations").select("*", { count: "exact", head: true }).in("site_id", siteIds).gte("generated_at", monthStart).eq("led_to_route", true)
      : Promise.resolve({ count: 0, error: null }),
    // User Satisfaction is AVG(reviews.rating) for the current month. The
    // reviews table has no foreign key to recommendations (only site_id /
    // tourist_id), so this is reported as an independent site-satisfaction
    // metric rather than a per-recommendation rate.
    siteIds.length > 0
      ? supabase.from("reviews").select("rating").in("site_id", siteIds).eq("status", "published").gte("created_at", monthStart)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (errTotal) throw new Error(`Failed to count recommendations: ${errTotal.message}`)
  if (errClicked) throw new Error(`Failed to count clicked recommendations: ${errClicked.message}`)
  if (errRoute) throw new Error(`Failed to count recommendation routes: ${errRoute.message}`)
  if (errReviews) throw new Error(`Failed to fetch reviews: ${errReviews.message}`)

  const ratings = (monthlyReviews ?? []).map((r) => r.rating as number)
  const reviewCount = ratings.length
  const average = reviewCount > 0 ? ratings.reduce((sum, r) => sum + r, 0) / reviewCount : 0
  const percent = reviewCount > 0 ? Math.round((average / 5) * 100) : 0

  const total = totalRecommendations ?? 0
  const clicked = clickedCount ?? 0
  const clickThroughRate = total > 0 ? Math.round((clicked / total) * 100) : 0

  return {
    totalRecommendations: total,
    clickThroughRate,
    routePlansCreated: routePlansCreated ?? 0,
    userSatisfaction: {
      average: Math.round(average * 10) / 10,
      percent,
      reviewCount,
    },
  }
}

async function fetchSystemHealth(supabase: SupabaseServer): Promise<SystemHealth> {
  const [backupResult, siteInfoResult] = await Promise.all([
    supabase
      .from("backups")
      .select("created_at, status, type")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("site_information")
      .select("system_version")
      .limit(1)
      .maybeSingle(),
  ])

  // Bug 5 fix: treat missing tables (42P01 = undefined_table) as graceful nulls
  // so the dashboard doesn't crash if backups or site_information don't exist.
  const { data: latestBackup, error: errBackup } = backupResult
  const { data: siteInfo, error: errSite } = siteInfoResult

  if (errBackup && (errBackup as { code?: string }).code !== "42P01") {
    throw new Error(`Failed to fetch latest backup: ${errBackup.message}`)
  }
  if (errSite && (errSite as { code?: string }).code !== "42P01") {
    throw new Error(`Failed to fetch site_information: ${errSite.message}`)
  }

  return {
    lastBackupAt: latestBackup?.created_at ?? null,
    lastBackupStatus: latestBackup?.status ?? null,
    lastBackupType: latestBackup?.type ?? null,
    systemVersion: siteInfo?.system_version ?? null,
  }
}

// ---------------------------------------------------------------------------
// Cached getX wrappers (~60s, tagged for on-demand revalidation)
// Access token is a serializable cache key; client is created inside the scope.
// ---------------------------------------------------------------------------

export const getKpiData = unstable_cache(
  async (accessToken: string) => fetchKpiData(createTokenClient(accessToken)),
  ["dashboard-kpis"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.dashboardKpis] },
)

export const getCategoryBreakdown = unstable_cache(
  async (accessToken: string) => fetchCategoryBreakdown(createTokenClient(accessToken)),
  ["dashboard-categories"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.dashboardCategories, CACHE_TAGS.dashboardSites],
  },
)

export const getRecentSites = unstable_cache(
  async (accessToken: string) => fetchRecentSites(createTokenClient(accessToken)),
  ["dashboard-recent-sites"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.dashboardSites] },
)

export const getVisitOverview = unstable_cache(
  async (accessToken: string) => fetchVisitOverview(createTokenClient(accessToken)),
  ["dashboard-visits"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.dashboardVisits] },
)

export const getMapMarkers = unstable_cache(
  async (accessToken: string) => fetchMapMarkers(createTokenClient(accessToken)),
  ["dashboard-map-markers"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.dashboardSites] },
)

export const getRecommendationPerformance = unstable_cache(
  async (accessToken: string) => fetchRecommendationPerformance(createTokenClient(accessToken)),
  ["dashboard-recommendations"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.dashboardRecommendations],
  },
)

export const getSystemHealth = unstable_cache(
  async (accessToken: string) => fetchSystemHealth(createTokenClient(accessToken)),
  ["dashboard-health"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.dashboardHealth] },
)

/**
 * Full dashboard payload. Creates the cookie-bound client once to resolve the
 * session token, then runs all section fetchers through a single shared
 * token-client on cache miss (via the bundle cache below).
 */
const getCachedDashboardBundle = unstable_cache(
  async (accessToken: string): Promise<DashboardData> => {
    // One client for the whole bundle on cache miss
    const supabase = createTokenClient(accessToken)

    const [
      kpis,
      categoryBreakdown,
      recentSites,
      visitOverview,
      mapMarkers,
      recommendationPerformance,
      systemHealth,
    ] = await Promise.all([
      fetchKpiData(supabase),
      fetchCategoryBreakdown(supabase),
      fetchRecentSites(supabase),
      fetchVisitOverview(supabase),
      fetchMapMarkers(supabase),
      fetchRecommendationPerformance(supabase),
      fetchSystemHealth(supabase),
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
  },
  ["dashboard-data"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [
      CACHE_TAGS.dashboardKpis,
      CACHE_TAGS.dashboardSites,
      CACHE_TAGS.dashboardCategories,
      CACHE_TAGS.dashboardVisits,
      CACHE_TAGS.dashboardRecommendations,
      CACHE_TAGS.dashboardHealth,
    ],
  },
)

export async function getDashboardData(): Promise<DashboardData> {
  // Cookie client created once here for session resolution only
  // (cookies() cannot run inside unstable_cache).
  const accessToken = await resolveAccessToken()
  return getCachedDashboardBundle(accessToken)
}
