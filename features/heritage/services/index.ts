import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { FIRST_DISTRICT_MUNICIPALITIES, WALKING_SPEED_KMH, DRIVING_SPEED_KMH } from "@/lib/constants"
import type {
  HeritageSite,
  HeritageSiteTag,
  HeritageSiteMedia,
  HeritageCategory,
  HeritageSiteVersion,
  HeritageBackup,
  NearbySite,
  SavedSite,
  TravelMode,
  ChangeType,
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

export async function createHeritageSite(data: Partial<HeritageSite>): Promise<HeritageSite> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const insertData: Record<string, unknown> = {
    site_name: data.siteName ?? "",
    category_id: data.categoryId ?? null,
    municipality_id: data.municipalityId ?? null,
    barangay: data.barangay ?? null,
    exact_address: data.exactAddress ?? null,
    short_description: data.shortDescription ?? null,
    detailed_description: data.detailedDescription ?? null,
    historical_period: data.historicalPeriod ?? null,
    year_established: data.yearEstablished ?? null,
    architect_builder: data.architectBuilder ?? null,
    architectural_style: data.architecturalStyle ?? null,
    historical_significance: data.historicalSignificance ?? null,
    cultural_significance: data.culturalSignificance ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    elevation: data.elevation ?? null,
    geo_accuracy: data.geoAccuracy ?? null,
    accessibility_info: data.accessibilityInfo ?? null,
    operating_hours: data.operatingHours ?? null,
    entrance_fee: data.entranceFee ?? null,
    designation: data.designation ?? null,
    publication_status: data.publicationStatus ?? "draft",
    is_featured: data.isFeatured ?? false,
    visibility: data.visibility ?? "public",
    created_by: user?.id ?? null,
  }

  const { data: site, error } = await supabase
    .from("heritage_sites")
    .insert(insertData)
    .select("*")
    .single()

  if (error) throw new Error(`Failed to create heritage site: ${error.message}`)

  // Create version snapshot
  await createHeritageSiteVersion(site.id, "created", user?.id ?? null, site)

  // Fetch the full site with joins
  const fullSite = await getHeritageSiteByIdAdmin(site.id)
  if (!fullSite) throw new Error("Failed to fetch created site")
  return fullSite
}

export async function updateHeritageSite(id: string, updates: Partial<HeritageSite>): Promise<HeritageSite> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const updateData: Record<string, unknown> = {}
  if (updates.siteName !== undefined) updateData.site_name = updates.siteName
  if (updates.alternativeName !== undefined) updateData.alternative_name = updates.alternativeName
  if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
  if (updates.municipalityId !== undefined) updateData.municipality_id = updates.municipalityId
  if (updates.barangay !== undefined) updateData.barangay = updates.barangay
  if (updates.exactAddress !== undefined) updateData.exact_address = updates.exactAddress
  if (updates.shortDescription !== undefined) updateData.short_description = updates.shortDescription
  if (updates.detailedDescription !== undefined) updateData.detailed_description = updates.detailedDescription
  if (updates.historicalPeriod !== undefined) updateData.historical_period = updates.historicalPeriod
  if (updates.yearEstablished !== undefined) updateData.year_established = updates.yearEstablished
  if (updates.architectBuilder !== undefined) updateData.architect_builder = updates.architectBuilder
  if (updates.architecturalStyle !== undefined) updateData.architectural_style = updates.architecturalStyle
  if (updates.historicalSignificance !== undefined) updateData.historical_significance = updates.historicalSignificance
  if (updates.culturalSignificance !== undefined) updateData.cultural_significance = updates.culturalSignificance
  if (updates.latitude !== undefined) updateData.latitude = updates.latitude
  if (updates.longitude !== undefined) updateData.longitude = updates.longitude
  if (updates.elevation !== undefined) updateData.elevation = updates.elevation
  if (updates.geoAccuracy !== undefined) updateData.geo_accuracy = updates.geoAccuracy
  if (updates.accessibilityInfo !== undefined) updateData.accessibility_info = updates.accessibilityInfo
  if (updates.operatingHours !== undefined) updateData.operating_hours = updates.operatingHours
  if (updates.entranceFee !== undefined) updateData.entrance_fee = updates.entranceFee
  if (updates.designation !== undefined) updateData.designation = updates.designation
  if (updates.publicationStatus !== undefined) updateData.publication_status = updates.publicationStatus
  if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured
  if (updates.visibility !== undefined) updateData.visibility = updates.visibility

  if (Object.keys(updateData).length === 0) {
    const site = await getHeritageSiteByIdAdmin(id)
    if (!site) throw new Error("Heritage site not found")
    return site
  }

  // Determine change type
  const changeType = updates.publicationStatus !== undefined ? "status_changed" : "updated"

  const { error } = await supabase
    .from("heritage_sites")
    .update(updateData)
    .eq("id", id)

  if (error) throw new Error(`Failed to update heritage site: ${error.message}`)

  // Fetch updated row for snapshot
  const { data: updatedRow } = await supabase
    .from("heritage_sites")
    .select("*")
    .eq("id", id)
    .single()

  if (updatedRow) {
    await createHeritageSiteVersion(id, changeType, user?.id ?? null, updatedRow)
  }

  const site = await getHeritageSiteByIdAdmin(id)
  if (!site) throw new Error("Heritage site not found after update")
  return site
}

export async function deleteHeritageSite(id: string): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Delete related records first
  await supabase.from("heritage_site_tags").delete().eq("site_id", id)
  await supabase.from("heritage_site_reference_links").delete().eq("site_id", id)

  const { error } = await supabase
    .from("heritage_sites")
    .delete()
    .eq("id", id)

  if (error) throw new Error(`Failed to delete heritage site: ${error.message}`)
}

export async function getHeritageSiteByIdAdmin(id: string): Promise<HeritageSite | null> {
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
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return mapDbRowToSite(data, data)
}

export async function getAllHeritageSites(): Promise<HeritageSite[]> {
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
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapDbRowToSite(row, row))
}

export async function getHeritageSitesByMunicipality(municipalityId: string): Promise<HeritageSite[]> {
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
    .eq("municipality_id", municipalityId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapDbRowToSite(row, row))
}

export async function getArchivedSites(): Promise<HeritageSite[]> {
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
    .eq("publication_status", "archived")
    .order("updated_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapDbRowToSite(row, row))
}

export async function getArchivedSitesByMunicipality(municipalityId: string): Promise<HeritageSite[]> {
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
    .eq("publication_status", "archived")
    .eq("municipality_id", municipalityId)
    .order("updated_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapDbRowToSite(row, row))
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

export async function createHeritageSiteVersion(
  siteId: string,
  changeType: ChangeType,
  changedBy: string | null,
  snapshot: Record<string, unknown>
): Promise<HeritageSiteVersion> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_site_versions")
    .insert({
      heritage_site_id: siteId,
      snapshot,
      changed_by: changedBy,
      change_type: changeType,
    })
    .select("*")
    .single()

  if (error) throw new Error(`Failed to create version: ${error.message}`)

  return {
    id: data.id as string,
    heritageSiteId: data.heritage_site_id as string,
    snapshot: (data.snapshot as Record<string, unknown>) ?? {},
    changedBy: (data.changed_by as string) ?? null,
    changeType: data.change_type as ChangeType,
    createdAt: data.created_at as string,
  }
}

export async function getHeritageSiteVersions(siteId: string): Promise<HeritageSiteVersion[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_site_versions")
    .select("*")
    .eq("heritage_site_id", siteId)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id as string,
    heritageSiteId: row.heritage_site_id as string,
    snapshot: (row.snapshot as Record<string, unknown>) ?? {},
    changedBy: (row.changed_by as string) ?? null,
    changeType: row.change_type as ChangeType,
    createdAt: row.created_at as string,
  }))
}

export async function restoreHeritageSiteVersion(versionId: string): Promise<HeritageSite> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: version, error: versionError } = await supabase
    .from("heritage_site_versions")
    .select("*")
    .eq("id", versionId)
    .single()

  if (versionError || !version) throw new Error("Version not found")

  const snapshot = version.snapshot as Record<string, unknown>
  const siteId = version.heritage_site_id as string

  const updateData: Record<string, unknown> = {}
  const updatableFields = [
    "site_name", "alternative_name", "category_id", "municipality_id",
    "barangay", "exact_address", "short_description", "detailed_description",
    "historical_period", "year_established", "architect_builder", "architectural_style",
    "historical_significance", "cultural_significance", "latitude", "longitude",
    "elevation", "geo_accuracy", "accessibility_info", "operating_hours",
    "entrance_fee", "designation", "publication_status", "is_featured", "visibility",
  ]

  for (const field of updatableFields) {
    if (field in snapshot) {
      updateData[field] = snapshot[field]
    }
  }

  const { error: updateError } = await supabase
    .from("heritage_sites")
    .update(updateData)
    .eq("id", siteId)

  if (updateError) throw new Error(`Failed to restore version: ${updateError.message}`)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Create a version entry for the restore
  const { data: restoredRow } = await supabase
    .from("heritage_sites")
    .select("*")
    .eq("id", siteId)
    .single()

  if (restoredRow) {
    await createHeritageSiteVersion(siteId, "updated", user?.id ?? null, restoredRow)
  }

  const site = await getHeritageSiteByIdAdmin(siteId)
  if (!site) throw new Error("Failed to fetch restored site")
  return site
}

export async function getAllCategories(): Promise<HeritageCategory[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_categories")
    .select("*")
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

export async function createCategory(data: { name: string; description?: string; icon?: string; color?: string; displayOrder?: number }): Promise<HeritageCategory> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: category, error } = await supabase
    .from("heritage_categories")
    .insert({
      name: data.name,
      description: data.description ?? null,
      icon: data.icon ?? null,
      color: data.color ?? null,
      display_order: data.displayOrder ?? null,
      status: "active",
    })
    .select("*")
    .single()

  if (error) throw new Error(`Failed to create category: ${error.message}`)

  return {
    id: category.id as string,
    name: category.name as string,
    description: (category.description ?? null) as string | null,
    icon: (category.icon ?? null) as string | null,
    color: (category.color ?? null) as string | null,
    displayOrder: (category.display_order ?? null) as number | null,
    status: (category.status ?? "active") as HeritageCategory["status"],
  }
}

export async function updateCategory(id: string, updates: Partial<HeritageCategory>): Promise<HeritageCategory> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const updateData: Record<string, unknown> = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.icon !== undefined) updateData.icon = updates.icon
  if (updates.color !== undefined) updateData.color = updates.color
  if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder
  if (updates.status !== undefined) updateData.status = updates.status

  const { error } = await supabase
    .from("heritage_categories")
    .update(updateData)
    .eq("id", id)

  if (error) throw new Error(`Failed to update category: ${error.message}`)

  const { data: updated, error: fetchError } = await supabase
    .from("heritage_categories")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError) throw new Error("Failed to fetch updated category")

  return {
    id: updated.id as string,
    name: updated.name as string,
    description: (updated.description ?? null) as string | null,
    icon: (updated.icon ?? null) as string | null,
    color: (updated.color ?? null) as string | null,
    displayOrder: (updated.display_order ?? null) as number | null,
    status: (updated.status ?? "active") as HeritageCategory["status"],
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Check if any sites use this category
  const { count } = await supabase
    .from("heritage_sites")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)

  if (count && count > 0) {
    throw new Error(`Cannot delete category: ${count} heritage site(s) still use it`)
  }

  const { error } = await supabase
    .from("heritage_categories")
    .delete()
    .eq("id", id)

  if (error) throw new Error(`Failed to delete category: ${error.message}`)
}

export async function getCategoriesWithSiteCount(): Promise<(HeritageCategory & { siteCount: number })[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: categories, error: catError } = await supabase
    .from("heritage_categories")
    .select("*")
    .order("display_order", { ascending: true })

  if (catError) throw catError

  const results: (HeritageCategory & { siteCount: number })[] = []

  for (const cat of categories ?? []) {
    const { count } = await supabase
      .from("heritage_sites")
      .select("id", { count: "exact", head: true })
      .eq("category_id", cat.id)

    results.push({
      id: cat.id as string,
      name: cat.name as string,
      description: (cat.description ?? null) as string | null,
      icon: (cat.icon ?? null) as string | null,
      color: (cat.color ?? null) as string | null,
      displayOrder: (cat.display_order ?? null) as number | null,
      status: (cat.status ?? "active") as HeritageCategory["status"],
      siteCount: count ?? 0,
    })
  }

  return results
}

export async function backupHeritageRepository(options?: { name?: string }): Promise<HeritageBackup> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all heritage data
  const [sitesRes, categoriesRes, mediaRes, tagsRes, linksRes] = await Promise.all([
    supabase.from("heritage_sites").select("*"),
    supabase.from("heritage_categories").select("*"),
    supabase.from("heritage_site_media").select("*"),
    supabase.from("heritage_site_tags").select("*"),
    supabase.from("heritage_site_reference_links").select("*"),
  ])

  const backupData = {
    sites: sitesRes.data ?? [],
    categories: categoriesRes.data ?? [],
    media: mediaRes.data ?? [],
    tags: tagsRes.data ?? [],
    referenceLinks: linksRes.data ?? [],
    exportedAt: new Date().toISOString(),
  }

  const backupJson = JSON.stringify(backupData)
  const recordsCount = (sitesRes.data?.length ?? 0) + (categoriesRes.data?.length ?? 0)

  const { data: backup, error } = await supabase
    .from("backups")
    .insert({
      backup_name: options?.name ?? `Backup ${new Date().toISOString().split("T")[0]}`,
      type: "full",
      size_bytes: new TextEncoder().encode(backupJson).length,
      records_count: recordsCount,
      created_by: user?.id ?? null,
      status: "completed",
      file_url: null,
    })
    .select("*")
    .single()

  if (error) throw new Error(`Failed to create backup: ${error.message}`)

  return {
    id: backup.id as string,
    backupName: (backup.backup_name as string) ?? null,
    type: (backup.type as HeritageBackup["type"]) ?? null,
    sizeBytes: (backup.size_bytes as number) ?? null,
    recordsCount: (backup.records_count as number) ?? null,
    createdBy: (backup.created_by as string) ?? null,
    status: (backup.status as string) ?? null,
    fileUrl: (backup.file_url as string) ?? null,
    createdAt: backup.created_at as string,
  }
}

export async function getBackupsList(): Promise<HeritageBackup[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("backups")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id as string,
    backupName: (row.backup_name as string) ?? null,
    type: (row.type as HeritageBackup["type"]) ?? null,
    sizeBytes: (row.size_bytes as number) ?? null,
    recordsCount: (row.records_count as number) ?? null,
    createdBy: (row.created_by as string) ?? null,
    status: (row.status as string) ?? null,
    fileUrl: (row.file_url as string) ?? null,
    createdAt: row.created_at as string,
  }))
}
