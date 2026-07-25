import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export interface TouristMapSite {
  id: string
  siteName: string
  latitude: number
  longitude: number
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

/**
 * Query 1: Fetch all published + public heritage sites with coordinates and
 *          category / municipality / primary-image joins.
 * Feeds: map markers, sidebar site list, detail panel.
 */
export async function getTouristMapSites(): Promise<TouristMapSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(
      `
      id, site_name, latitude, longitude, short_description,
      barangay, municipality_id, category_id,
      average_rating, review_count,
      category:heritage_categories(name, color, icon),
      municipality:municipalities(name),
      media:heritage_site_media(id, media_type, file_url, is_primary)
    `,
    )
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("site_name", { ascending: true })
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })

  if (error) throw new Error(`Failed to fetch map sites: ${error.message}`)

  return (data ?? []).map((row) => {
    const catArr = row.category as { name: string; color: string; icon: string }[] | null
    const cat = catArr?.[0] ?? null
    const munArr = row.municipality as { name: string }[] | null
    const mun = munArr?.[0] ?? null
    const mediaArr = (row.media ?? []) as Record<string, unknown>[]
    const primaryImg = mediaArr.find(
      (m) => m.media_type === "image" && m.is_primary === true,
    ) ?? mediaArr.find((m) => m.media_type === "image")

    return {
      id: row.id as string,
      siteName: row.site_name as string,
      latitude: row.latitude as number,
      longitude: row.longitude as number,
      shortDescription: (row.short_description ?? null) as string | null,
      barangay: (row.barangay ?? null) as string | null,
      municipalityId: (row.municipality_id ?? null) as string | null,
      municipalityName: mun?.name ?? null,
      categoryId: (row.category_id ?? null) as string | null,
      categoryName: cat?.name ?? null,
      categoryColor: cat?.color ?? null,
      categoryIcon: cat?.icon ?? null,
      primaryImage: primaryImg?.file_url as string | null ?? null,
      averageRating: (row.average_rating ?? 0) as number,
      reviewCount: (row.review_count ?? 0) as number,
    }
  })
}

/**
 * Query 2: Fetch active heritage categories with site counts.
 * Feeds: category filter dropdown, legend, layer toggles.
 */
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
 * Query 3: Fetch curated trails (routes with is_curated = true),
 *          including their stops with site details.
 * Feeds: CuratedTrailsPanel.
 */
export async function getCuratedTrails(): Promise<CuratedTrail[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

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
    const stops = ((route.stops ?? []) as Record<string, unknown>[]).map((s) => {
      const siteArr = s.site as { id: string; site_name: string; latitude: number; longitude: number }[] | null
      const site = siteArr?.[0] ?? null
      return {
        siteId: site?.id ?? "",
        siteName: site?.site_name ?? "",
        stopOrder: s.stop_order as number,
        latitude: site?.latitude ?? 0,
        longitude: site?.longitude ?? 0,
      }
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

export async function getTouristMapCategories(): Promise<TouristMapCategory[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: categories, error: catError } = await supabase
    .from("heritage_categories")
    .select("id, name, color, icon")
    .eq("status", "active")
    .order("display_order", { ascending: true, nullsFirst: false })

  if (catError) throw new Error(`Failed to fetch categories: ${catError.message}`)

  const results: TouristMapCategory[] = []

  for (const cat of categories ?? []) {
    const { count, error: countError } = await supabase
      .from("heritage_sites")
      .select("id", { count: "exact", head: true })
      .eq("category_id", cat.id)
      .eq("publication_status", "published")
      .eq("visibility", "public")

    if (countError) throw new Error(`Failed to count sites: ${countError.message}`)

    results.push({
      id: cat.id as string,
      name: cat.name as string,
      color: (cat.color ?? null) as string | null,
      icon: (cat.icon ?? null) as string | null,
      siteCount: count ?? 0,
    })
  }

  return results
}
