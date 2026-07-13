import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { FIRST_DISTRICT_MUNICIPALITIES, WALKING_SPEED_KMH, DRIVING_SPEED_KMH } from "@/lib/constants"
import type {
  HeritageSite,
  HeritageSiteTag,
  HeritageSiteMedia,
  HeritageCategory,
  NearbySite,
  SavedSite,
  TravelMode,
} from "../types"

function mapDbRowToSite(row: Record<string, unknown>, joined: Record<string, unknown>): HeritageSite {
  const category = joined.category as Record<string, unknown> | null
  const municipality = joined.municipality as Record<string, unknown> | null
  const tags = (joined.tags ?? []) as HeritageSiteTag[]
  const rawMedia = (joined.media ?? []) as Record<string, unknown>[]
  const media: HeritageSiteMedia[] = rawMedia.map((m) => ({
    id: m.id as string,
    siteId: m.site_id as string,
    mediaType: (m.media_type as HeritageSiteMedia["mediaType"]) ?? "image",
    fileUrl: m.file_url as string,
    fileName: (m.file_name as string) ?? null,
    fileSizeBytes: (m.file_size_bytes as number) ?? null,
    mimeType: (m.mime_type as string) ?? null,
    isPrimary: (m.is_primary as boolean) ?? false,
    caption: (m.caption as string) ?? null,
    uploadedBy: (m.uploaded_by as string) ?? null,
    createdAt: m.created_at as string,
  }))

  return {
    id: row.id as string,
    siteName: row.site_name as string,
    alternativeName: row.alternative_name as string | null,
    categoryId: row.category_id as string | null,
    municipalityId: row.municipality_id as string | null,
    barangay: row.barangay as string | null,
    exactAddress: row.exact_address as string | null,
    shortDescription: row.short_description as string | null,
    detailedDescription: row.detailed_description as string | null,
    historicalPeriod: row.historical_period as string | null,
    yearEstablished: row.year_established as string | null,
    architectBuilder: row.architect_builder as string | null,
    architecturalStyle: row.architectural_style as string | null,
    historicalSignificance: row.historical_significance as string | null,
    culturalSignificance: row.cultural_significance as string | null,
    latitude: row.latitude as number | null,
    longitude: row.longitude as number | null,
    elevation: row.elevation as number | null,
    geoAccuracy: row.geo_accuracy as string | null,
    accessibilityInfo: row.accessibility_info as string | null,
    operatingHours: row.operating_hours as string | null,
    entranceFee: (row.entrance_fee ?? null) as string | null,
    designation: (row.designation ?? null) as string | null,
    publicationStatus: (row.publication_status ?? "draft") as HeritageSite["publicationStatus"],
    isFeatured: (row.is_featured ?? false) as boolean,
    visibility: (row.visibility ?? "public") as HeritageSite["visibility"],
    createdBy: row.created_by as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    averageRating: (row.average_rating ?? 0) as number,
    reviewCount: (row.review_count ?? 0) as number,
    category: category
      ? {
          id: category.id as string,
          name: category.name as string,
          description: (category.description ?? null) as string | null,
          icon: (category.icon ?? null) as string | null,
          color: (category.color ?? null) as string | null,
          displayOrder: (category.display_order ?? null) as number | null,
          status: (category.status ?? "active") as HeritageCategory["status"],
        }
      : null,
    municipalityName: (municipality?.name as string) ?? null,
    tags,
    media,
  }
}

export async function getHeritageSites(): Promise<HeritageSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      *,
      category:heritage_categories(*),
      municipality:municipalities(name),
      tags:heritage_site_tags(*),
      media:heritage_site_media(*)
    `)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapDbRowToSite(row, row))
}

export async function getHeritageSiteById(id: string): Promise<HeritageSite | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      *,
      category:heritage_categories(*),
      municipality:municipalities(name),
      tags:heritage_site_tags(*),
      media:heritage_site_media(*)
    `)
    .eq("id", id)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return mapDbRowToSite(data, data)
}

export async function getCategories(): Promise<HeritageCategory[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_categories")
    .select("*")
    .eq("status", "active")
    .order("display_order", { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description ?? null) as string | null,
    icon: (row.icon ?? null) as string | null,
    color: (row.color ?? null) as string | null,
    displayOrder: (row.display_order ?? null) as number | null,
    status: (row.status ?? "active") as HeritageCategory["status"],
  }))
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

export async function isBookmarked(touristId: string, siteId: string): Promise<boolean> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { count, error } = await supabase
    .from("bookmarks")
    .select("id", { count: "exact", head: true })
    .eq("tourist_id", touristId)
    .eq("site_id", siteId)

  if (error) throw error
  return (count ?? 0) > 0
}

export async function toggleBookmark(touristId: string, siteId: string): Promise<{ isBookmarked: boolean }> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("tourist_id", touristId)
    .eq("site_id", siteId)
    .maybeSingle()

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id)
    return { isBookmarked: false }
  }

  await supabase.from("bookmarks").insert({ tourist_id: touristId, site_id: siteId })
  return { isBookmarked: true }
}

export async function getBookmarkedSites(touristId: string): Promise<SavedSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("bookmarks")
    .select(`
      site_id,
      created_at,
      site:heritage_sites(
        id,
        site_name,
        municipality:municipalities(name),
        category:heritage_categories(name),
        media:heritage_site_media!inner(file_url, media_type)
      )
    `)
    .eq("tourist_id", touristId)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const site = row.site as unknown as Record<string, unknown> | null
    if (!site) {
      return {
        siteId: row.site_id as string,
        siteName: "Deleted site",
        municipalityName: null,
        categoryName: null,
        thumbnail: null,
        savedAt: row.created_at as string,
      }
    }

    const munArr = site.municipality as { name: string }[] | null
    const mun = Array.isArray(munArr) ? munArr[0] : munArr
    const catArr = site.category as { name: string }[] | null
    const cat = Array.isArray(catArr) ? catArr[0] : catArr
    const mediaArr = (site.media ?? []) as { file_url: string; media_type: string }[]
    const image = mediaArr.find((m) => m.media_type === "image")

    return {
      siteId: site.id as string,
      siteName: site.site_name as string,
      municipalityName: mun?.name ?? null,
      categoryName: cat?.name ?? null,
      thumbnail: image?.file_url ?? null,
      savedAt: row.created_at as string,
    }
  })
}

export async function createHeritageSite(_data: Partial<HeritageSite>): Promise<HeritageSite> {
  // TODO: implement
  throw new Error("Not implemented")
}

export async function updateHeritageSite(_id: string, _updates: Partial<HeritageSite>): Promise<HeritageSite> {
  // TODO: implement
  throw new Error("Not implemented")
}

export async function deleteHeritageSite(_id: string): Promise<void> {
  // TODO: implement
}

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
