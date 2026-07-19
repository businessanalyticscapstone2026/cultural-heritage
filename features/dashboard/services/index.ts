import { unstable_cache } from "next/cache"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createTokenClient, resolveAccessToken } from "@/utils/supabase/cached"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags"
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
  const { count: totalHeritageSites, error: errSites } = await supabase
    .from("heritage_sites")
    .select("*", { count: "exact", head: true })

  if (errSites) throw new Error(`Failed to count heritage_sites: ${errSites.message}`)

  const { count: totalMunicipalities, error: errMuns } = await supabase
    .from("municipalities")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  if (errMuns) throw new Error(`Failed to count municipalities: ${JSON.stringify(errMuns)}`)

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
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("tourist_visits")
    .select("visit_date")
    .gte("visit_date", monthStart)
    .lte("visit_date", monthEnd)

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

async function fetchSystemHealth(supabase: SupabaseServer): Promise<SystemHealth> {
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
