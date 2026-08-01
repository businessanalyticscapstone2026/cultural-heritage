import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type {
  HeritageSite,
  HeritageSiteTag,
  HeritageSiteMedia,
  HeritageSiteReferenceLink,
  HeritageCategory,
} from "../types"
import { DuplicateHeritageSiteError } from "../errors"

export type DuplicateSiteMatch = {
  id: string
  siteName: string
  publicationStatus: string
  municipalityName: string | null
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`)
}

/**
 * Case-insensitive, trimmed lookup for an existing site with the same name in the
 * same municipality. Matches across all publication_status values (including
 * archived) — see CHT-037: the confirmed production duplicate was one archived
 * + one published row with an identical name, so archived rows are treated as
 * duplicates too rather than exempted.
 */
export async function findDuplicateHeritageSiteByName(
  supabase: ReturnType<typeof createClient>,
  siteName: string,
  municipalityId: string | null | undefined,
  excludeId?: string,
): Promise<DuplicateSiteMatch | null> {
  const trimmedName = siteName.trim()
  if (!trimmedName || !municipalityId) return null

  let query = supabase
    .from("heritage_sites")
    .select("id, site_name, publication_status, municipality:municipalities(name)")
    .eq("municipality_id", municipalityId)
    .ilike("site_name", escapeLikePattern(trimmedName))
    .limit(1)

  if (excludeId) query = query.neq("id", excludeId)

  const { data, error } = await query.maybeSingle()
  if (error) throw new Error(`Failed to check for duplicate site name: ${error.message}`)
  if (!data) return null

  const municipality = data.municipality as unknown as { name: string } | null
  return {
    id: data.id as string,
    siteName: data.site_name as string,
    publicationStatus: data.publication_status as string,
    municipalityName: municipality?.name ?? null,
  }
}

export function mapDbRowToSite(row: Record<string, unknown>, joined: Record<string, unknown>): HeritageSite {
  const category = joined.category as Record<string, unknown> | null
  const municipality = joined.municipality as Record<string, unknown> | null
  const tags = (joined.tags ?? []) as HeritageSiteTag[]
  const rawMedia = (joined.media ?? []) as Record<string, unknown>[]
  const rawReferenceLinks = (joined.reference_links ?? []) as Record<string, unknown>[]
  const referenceLinks: HeritageSiteReferenceLink[] = rawReferenceLinks.map((l) => ({
    id: l.id as string,
    siteId: l.site_id as string,
    url: l.url as string,
    label: (l.label ?? null) as string | null,
  }))
  const media: HeritageSiteMedia[] = rawMedia.map((m) => ({
    id: m.id as string,
    siteId: m.site_id as string,
    mediaType: (m.media_type as HeritageSiteMedia["mediaType"]) ?? "image",
    fileUrl: m.file_url as string,
    fileName: (m.file_name as string) ?? null,
    fileSizeBytes: (m.file_size_bytes as number) ?? null,
    mimeType: (m.mime_type as string) ?? null,
    isPrimary: (m.is_primary as boolean) ?? false,
    sortOrder: (m.sort_order as number) ?? 0,
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
    referenceLinks,
  }
}

const SITE_SELECT = `
  *,
  category:heritage_categories(*),
  municipality:municipalities(name),
  tags:heritage_site_tags(*),
  media:heritage_site_media(*),
  reference_links:heritage_site_reference_links(*)
`

export async function getHeritageSites(): Promise<HeritageSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(SITE_SELECT)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => mapDbRowToSite(row, row))
}

export async function getHeritageSiteById(id: string): Promise<HeritageSite | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(SITE_SELECT)
    .eq("id", id)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapDbRowToSite(data, data)
}

export async function getHeritageSiteByIdAdmin(id: string): Promise<HeritageSite | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(SITE_SELECT)
    .eq("id", id)
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })
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
    .select(SITE_SELECT)
    .order("created_at", { ascending: false })
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => mapDbRowToSite(row, row))
}

export async function getHeritageSitesByMunicipality(municipalityId: string): Promise<HeritageSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(SITE_SELECT)
    .eq("municipality_id", municipalityId)
    .order("created_at", { ascending: false })
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => mapDbRowToSite(row, row))
}

export async function getArchivedSites(): Promise<HeritageSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(SITE_SELECT)
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
    .select(SITE_SELECT)
    .eq("publication_status", "archived")
    .eq("municipality_id", municipalityId)
    .order("updated_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapDbRowToSite(row, row))
}

export async function createHeritageSite(data: Partial<HeritageSite>): Promise<HeritageSite> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  const duplicate = await findDuplicateHeritageSiteByName(supabase, data.siteName ?? "", data.municipalityId)
  if (duplicate) throw new DuplicateHeritageSiteError(duplicate.siteName, duplicate.municipalityName)

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

  const { createHeritageSiteVersion } = await import("./versions")
  await createHeritageSiteVersion(site.id, "created", user?.id ?? null, site)

  const fullSite = await getHeritageSiteByIdAdmin(site.id)
  if (!fullSite) throw new Error("Failed to fetch created site")
  return fullSite
}

export async function updateHeritageSite(id: string, updates: Partial<HeritageSite>): Promise<HeritageSite> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (updates.siteName !== undefined || updates.municipalityId !== undefined) {
    const existing = await getHeritageSiteByIdAdmin(id)
    if (existing) {
      const nextName = updates.siteName ?? existing.siteName
      const nextMunicipalityId = updates.municipalityId ?? existing.municipalityId
      const duplicate = await findDuplicateHeritageSiteByName(supabase, nextName, nextMunicipalityId, id)
      if (duplicate) throw new DuplicateHeritageSiteError(duplicate.siteName, duplicate.municipalityName)
    }
  }

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

  const changeType = updates.publicationStatus !== undefined ? "status_changed" : "updated"

  const { error } = await supabase
    .from("heritage_sites")
    .update(updateData)
    .eq("id", id)

  if (error) throw new Error(`Failed to update heritage site: ${error.message}`)

  const { data: updatedRow } = await supabase
    .from("heritage_sites")
    .select("*")
    .eq("id", id)
    .single()

  if (updatedRow) {
    const { createHeritageSiteVersion } = await import("./versions")
    await createHeritageSiteVersion(id, changeType, user?.id ?? null, updatedRow)
  }

  const site = await getHeritageSiteByIdAdmin(id)
  if (!site) throw new Error("Heritage site not found after update")
  return site
}

export async function deleteSiteDependencies(siteId: string): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error: recommendationsError } = await supabase
    .from("recommendations")
    .delete()
    .eq("site_id", siteId)
  if (recommendationsError) {
    throw new Error(`Failed to delete site recommendations: ${recommendationsError.message}`)
  }

  const { error: routeStopsError } = await supabase
    .from("route_stops")
    .delete()
    .eq("site_id", siteId)
  if (routeStopsError) {
    throw new Error(`Failed to delete site route stops: ${routeStopsError.message}`)
  }

  const { error: reviewsError } = await supabase
    .from("governance_reviews")
    .delete()
    .eq("heritage_site_id", siteId)
  if (reviewsError) throw new Error(`Failed to delete governance reviews: ${reviewsError.message}`)

  const { error: versionsError } = await supabase
    .from("heritage_site_versions")
    .delete()
    .eq("heritage_site_id", siteId)
  if (versionsError) throw new Error(`Failed to delete site versions: ${versionsError.message}`)

  const { error: mediaError } = await supabase
    .from("heritage_site_media")
    .delete()
    .eq("site_id", siteId)
  if (mediaError) throw new Error(`Failed to delete site media: ${mediaError.message}`)

  const { error: tagsError } = await supabase
    .from("heritage_site_tags")
    .delete()
    .eq("site_id", siteId)
  if (tagsError) throw new Error(`Failed to delete site tags: ${tagsError.message}`)

  const { error: linksError } = await supabase
    .from("heritage_site_reference_links")
    .delete()
    .eq("site_id", siteId)
  if (linksError) throw new Error(`Failed to delete site reference links: ${linksError.message}`)
}

export async function deleteHeritageSite(id: string): Promise<void> {
  await deleteSiteDependencies(id)

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("heritage_sites")
    .delete()
    .eq("id", id)

  if (error) throw new Error(`Failed to delete heritage site: ${error.message}`)
}
