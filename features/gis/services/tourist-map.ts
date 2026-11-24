import { unstable_cache } from "next/cache"
import { createTokenClient } from "@/utils/supabase/cached"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags"
import type { SupabaseClient } from "@supabase/supabase-js"
import { placeStackedSitesAtBarangay } from "./coordinate-groups"
import { BARANGAY_CENTRES } from "../data/barangay-centres"

export interface TouristMapSite {
  id: string
  siteName: string
  /** Null when the site has no pin yet; such sites are listed but not drawn on the map. */
  latitude: number | null
  longitude: number | null
  geoAccuracy: string | null
  /**
   * "barangay" when the recorded coordinate was a shared placeholder and the map
   * shows the site at its barangay centre instead (display only, DB unchanged).
   */
  approximateLocation: "barangay" | null
  shortDescription: string | null
  barangay: string | null
  municipalityId: string | null
  municipalityName: string | null
  categoryId: string | null
  categoryName: string | null
  categoryColor: string | null
  categoryIcon: string | null
  primaryImage: string | null
  averageRating: number
  reviewCount: number
}

export interface TouristMapCategory {
  id: string
  name: string
  color: string | null
  icon: string | null
  siteCount: number
}

export interface CuratedTrail {
  id: string
  name: string
  totalDistanceKm: number | null
  totalDurationMinutes: number | null
  stops: {
    siteId: string
    siteName: string
    stopOrder: number
    latitude: number
    longitude: number
  }[]
}

/**
 * Query 1: Fetch all published + public heritage sites (with or without
 *          coordinates) and category / municipality / primary-image joins.
 * Feeds: map markers, sidebar site list, detail panel.
 */
async function fetchTouristMapSites(client?: SupabaseClient): Promise<TouristMapSite[]> {
  const supabase = client ?? createTokenClient("")

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(
      `
      id, site_name, latitude, longitude, geo_accuracy, short_description,
      barangay, municipality_id, category_id,
      average_rating, review_count,
      category:heritage_categories(name, color, icon),
      municipality:municipalities(name),
      media:heritage_site_media(id, media_type, file_url, is_primary)
    `,
    )
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .order("site_name", { ascending: true })
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })

  if (error) throw new Error(`Failed to fetch map sites: ${error.message}`)

  const sites = (data ?? []).map((row) => {
    // Supabase returns a to-one embed (belongs-to a single category/municipality)
    // as a plain object, not an array — despite the array-shaped cast some
    // callers use elsewhere. Handle both shapes defensively.
    const catRaw = row.category as { name: string; color: string; icon: string }[] | { name: string; color: string; icon: string } | null
    const cat = Array.isArray(catRaw) ? (catRaw[0] ?? null) : catRaw
    const munRaw = row.municipality as { name: string }[] | { name: string } | null
    const mun = Array.isArray(munRaw) ? (munRaw[0] ?? null) : munRaw
    const mediaArr = (row.media ?? []) as Record<string, unknown>[]
    const primaryImg = mediaArr.find(
      (m) => m.media_type === "image" && m.is_primary === true,
    ) ?? mediaArr.find((m) => m.media_type === "image")

    return {
      id: row.id as string,
      siteName: row.site_name as string,
      latitude: row.latitude == null ? null : Number(row.latitude),
      longitude: row.longitude == null ? null : Number(row.longitude),
      geoAccuracy: (row.geo_accuracy ?? null) as string | null,
      shortDescription: (row.short_description ?? null) as string | null,
      barangay: (row.barangay ?? null) as string | null,
      municipalityId: (row.municipality_id ?? null) as string | null,
      municipalityName: mun?.name ?? null,
      categoryId: (row.category_id ?? null) as string | null,
      categoryName: cat?.name ?? null,
      categoryColor: cat?.color ?? null,
      categoryIcon: cat?.icon ?? null,
      primaryImage: (primaryImg?.file_url as string | null) ?? null,
      averageRating: (row.average_rating ?? 0) as number,
      reviewCount: (row.review_count ?? 0) as number,
    }
  })

  return placeStackedSitesAtBarangay(sites, BARANGAY_CENTRES)
}

const getCachedTouristMapSites = unstable_cache(
  async (): Promise<TouristMapSite[]> => {
    return fetchTouristMapSites()
  },
  ["tourist-map-sites"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.heritageSites] },
)

export async function getTouristMapSites(client?: SupabaseClient): Promise<TouristMapSite[]> {
  if (client || process.env.NODE_ENV === "test") {
    return fetchTouristMapSites(client)
  }
  return getCachedTouristMapSites()
}

/**
 * Query 2: Fetch curated trails (routes with is_curated = true),
 *          including their stops with site details.
 * Feeds: CuratedTrailsPanel.
 */
async function fetchCuratedTrails(client?: SupabaseClient): Promise<CuratedTrail[]> {
  const supabase = client ?? createTokenClient("")

  const { data: routes, error } = await supabase
    .from("routes")
    .select(
      `
      id, name, total_distance_km, total_duration_minutes,
      stops:route_stops(
        stop_order,
        site:heritage_sites(id, site_name, latitude, longitude)
      )
    `,
    )
    .eq("is_curated", true)
    .order("name", { ascending: true })

  if (error) throw new Error(`Failed to fetch curated trails: ${error.message}`)

  return (routes ?? []).map((route) => {
    type StopSite = { id: string; site_name: string; latitude: number | null; longitude: number | null }
    // Stops whose site has no pin yet are dropped instead of being drawn at 0,0.
    const stops = ((route.stops ?? []) as Record<string, unknown>[]).flatMap((s) => {
      const siteRaw = s.site as StopSite[] | StopSite | null
      const site = Array.isArray(siteRaw) ? (siteRaw[0] ?? null) : siteRaw
      if (!site || site.latitude == null || site.longitude == null) return []
      return [{
        siteId: site.id,
        siteName: site.site_name,
        stopOrder: s.stop_order as number,
        latitude: Number(site.latitude),
        longitude: Number(site.longitude),
      }]
    }).sort((a, b) => a.stopOrder - b.stopOrder)

    return {
      id: route.id as string,
      name: route.name as string,
      totalDistanceKm: (route.total_distance_km ?? null) as number | null,
      totalDurationMinutes: (route.total_duration_minutes ?? null) as number | null,
      stops,
    }
  })
}

const getCachedCuratedTrails = unstable_cache(
  async (): Promise<CuratedTrail[]> => {
    return fetchCuratedTrails()
  },
  ["tourist-curated-trails"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.routes, CACHE_TAGS.heritageSites] },
)

export async function getCuratedTrails(client?: SupabaseClient): Promise<CuratedTrail[]> {
  if (client || process.env.NODE_ENV === "test") {
    return fetchCuratedTrails(client)
  }
  return getCachedCuratedTrails()
}

/**
 * Query 3: Fetch active heritage categories with site counts.
 * Feeds: category filter dropdown, legend, layer toggles.
 * Aggregates site counts in a single batch query (no N+1 loop).
 */
async function fetchTouristMapCategories(client?: SupabaseClient): Promise<TouristMapCategory[]> {
  const supabase = client ?? createTokenClient("")

  const [categoriesRes, sitesRes] = await Promise.all([
    supabase
      .from("heritage_categories")
      .select("id, name, color, icon")
      .eq("status", "active")
      .order("display_order", { ascending: true, nullsFirst: false }),
    supabase
      .from("heritage_sites")
      .select("category_id")
      .eq("publication_status", "published")
      .eq("visibility", "public")
      .not("category_id", "is", null),
  ])

  if (categoriesRes.error) throw new Error(`Failed to fetch categories: ${categoriesRes.error.message}`)

  const counts = new Map<string, number>()
  for (const row of sitesRes.data ?? []) {
    if (row.category_id) {
      counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1)
    }
  }

  return (categoriesRes.data ?? []).map((cat) => ({
    id: cat.id as string,
    name: cat.name as string,
    color: (cat.color ?? null) as string | null,
    icon: (cat.icon ?? null) as string | null,
    siteCount: counts.get(cat.id) ?? 0,
  }))
}

const getCachedTouristMapCategories = unstable_cache(
  async (): Promise<TouristMapCategory[]> => {
    return fetchTouristMapCategories()
  },
  ["tourist-map-categories"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.heritageCategories, CACHE_TAGS.heritageSites] },
)

export async function getTouristMapCategories(client?: SupabaseClient): Promise<TouristMapCategory[]> {
  if (client || process.env.NODE_ENV === "test") {
    return fetchTouristMapCategories(client)
  }
  return getCachedTouristMapCategories()
}
