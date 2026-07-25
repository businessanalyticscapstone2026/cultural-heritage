import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { FIRST_DISTRICT_MUNICIPALITIES, WALKING_SPEED_KMH, DRIVING_SPEED_KMH } from "@/lib/constants"
import type { NearbySite, TravelMode } from "../types"

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function computeTravelTime(distanceKm: number, mode: TravelMode): number {
  const speed = mode === "driving" ? DRIVING_SPEED_KMH : WALKING_SPEED_KMH
  return Math.round((distanceKm / speed) * 60)
}

export async function getNearbySites(siteId: string, limit = 5): Promise<NearbySite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("site_distances")
    .select(`
      site_a_id,
      site_b_id,
      distance_km,
      travel_time_minutes,
      site_a:heritage_sites!site_a_id(site_name, category_id, latitude, longitude, category:heritage_categories(name), municipality:municipalities(name), media:heritage_site_media!inner(file_url, media_type)),
      site_b:heritage_sites!site_b_id(site_name, category_id, latitude, longitude, category:heritage_categories(name), municipality:municipalities(name), media:heritage_site_media!inner(file_url, media_type))
    `)
    .or(`site_a_id.eq.${siteId},site_b_id.eq.${siteId}`)
    .order("distance_km", { ascending: true })
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row) => {
    const isA = row.site_a_id === siteId
    const site = (isA ? row.site_b : row.site_a) as unknown
    const siteData = Array.isArray(site) ? (site[0] as Record<string, unknown> | undefined) : (site as Record<string, unknown> | null)
    const cat = siteData?.category as Record<string, unknown> | null
    const mun = siteData?.municipality as Record<string, unknown> | null
    const media = (siteData?.media ?? []) as { file_url: string; media_type: string }[]
    const image = media.find((m) => m.media_type === "image")

    return {
      siteId: isA ? row.site_b_id : row.site_a_id,
      siteName: (siteData?.site_name as string) ?? "Unknown",
      category: (cat?.name as string) ?? null,
      distanceKm: row.distance_km as number,
      travelTimeMinutes: (row.travel_time_minutes as number) ?? null,
      thumbnail: image?.file_url ?? null,
      latitude: (siteData?.latitude as number) ?? 0,
      longitude: (siteData?.longitude as number) ?? 0,
      municipalityName: (mun?.name as string) ?? null,
    }
  })
}

export async function getNearbySitesFromLocation(
  lat: number,
  long: number,
  radiusKm: number,
  options?: { category?: string; mode?: TravelMode; limit?: number }
): Promise<NearbySite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const mode = options?.mode ?? "walking"
  const limit = options?.limit ?? 20

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      id,
      site_name,
      latitude,
      longitude,
      category:heritage_categories(name),
      municipality:municipalities(name),
      media:heritage_site_media!inner(file_url, media_type)
    `)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .not("latitude", "is", null)
    .not("longitude", "is", null)

  if (error) throw error

  const firstDistrictSet = new Set([...FIRST_DISTRICT_MUNICIPALITIES])

  const results = (data ?? [])
    .map((site) => {
      const siteLat = site.latitude as number
      const siteLong = site.longitude as number
      const distance = haversineDistance(lat, long, siteLat, siteLong)
      const imageArr = (site.media ?? []) as { file_url: string; media_type: string }[]
      const image = imageArr.find((m) => m.media_type === "image")
      const munArr = site.municipality as { name: string }[] | null
      const mun = Array.isArray(munArr) ? munArr[0] : munArr
      const catArr = site.category as { name: string }[] | null
      const cat = Array.isArray(catArr) ? catArr[0] : catArr

      return {
        siteId: site.id as string,
        siteName: site.site_name as string,
        category: cat?.name ?? null,
        distanceKm: Math.round(distance * 100) / 100,
        travelTimeMinutes: computeTravelTime(distance, mode),
        thumbnail: image?.file_url ?? null,
        latitude: siteLat,
        longitude: siteLong,
        municipalityName: mun?.name ?? null,
      }
    })
    .filter((site) => {
      if (site.distanceKm > radiusKm) return false
      if (!firstDistrictSet.has(site.municipalityName as typeof FIRST_DISTRICT_MUNICIPALITIES[number])) return false
      if (options?.category && site.category !== options.category) return false
      return true
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)

  return results
}
