import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type { HeritageSite, HeritageCategory, HeritageSiteTag } from "@/types/heritage"
import { createHeritageSiteVersion, deleteSiteDependencies, findDuplicateHeritageSiteByName } from "./index"
import { DuplicateHeritageSiteError } from "../errors"

export type SiteWithDetails = HeritageSite & {
  creatorName?: string | null
  referenceLinks?: { id: string; url: string; label: string | null }[]
}

async function getSupabase() {
  const cookieStore = await cookies()
  return createClient(cookieStore)
}

export async function getCurrentStaffProfile() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("id, municipality_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle()

  return profile
}

/** Fetch KPI counts — feeds the 4 KPI cards: Total, Published, Draft, Archived */
export async function getMtoSiteKpiCounts(municipalityId: string) {
  const supabase = await getSupabase()

  const { count: total, error: totalError } = await supabase
    .from("heritage_sites")
    .select("id", { count: "exact", head: true })
    .eq("municipality_id", municipalityId)

  if (totalError) throw totalError

  const { count: published, error: pubError } = await supabase
    .from("heritage_sites")
    .select("id", { count: "exact", head: true })
    .eq("municipality_id", municipalityId)
    .eq("publication_status", "published")

  if (pubError) throw pubError

  const { count: draft, error: draftError } = await supabase
    .from("heritage_sites")
    .select("id", { count: "exact", head: true })
    .eq("municipality_id", municipalityId)
    .eq("publication_status", "draft")

  if (draftError) throw draftError

  const { count: archived, error: archError } = await supabase
    .from("heritage_sites")
    .select("id", { count: "exact", head: true })
    .eq("municipality_id", municipalityId)
    .eq("publication_status", "archived")

  if (archError) throw archError

  return {
    total: total ?? 0,
    published: published ?? 0,
    draft: draft ?? 0,
    archived: archived ?? 0,
  }
}

/** Fetch all sites for the MTO's municipality — feeds the main table */
export async function getMtoSites(municipalityId: string): Promise<SiteWithDetails[]> {
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      *,
      category:heritage_categories(*),
      tags:heritage_site_tags(*),
      media:heritage_site_media(*),
      creator:staff_profiles!heritage_sites_created_by_fkey(first_name, last_name)
    `)
    .eq("municipality_id", municipalityId)
    .neq("publication_status", "archived")
    .order("created_at", { ascending: false })
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => {
    const creator = row.creator as { first_name: string | null; last_name: string | null } | null
    const cat = row.category as Record<string, unknown> | null
    const tags = (row.tags ?? []) as HeritageSiteTag[]
    const mediaArr = (row.media ?? []) as Record<string, unknown>[]

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
      entranceFee: row.entrance_fee as string | null,
      designation: row.designation as string | null,
      publicationStatus: (row.publication_status ?? "draft") as HeritageSite["publicationStatus"],
      isFeatured: (row.is_featured ?? false) as boolean,
      visibility: (row.visibility ?? "public") as HeritageSite["visibility"],
      createdBy: row.created_by as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      averageRating: 0,
      reviewCount: 0,
      category: cat
        ? {
            id: cat.id as string,
            name: cat.name as string,
            description: (cat.description ?? null) as string | null,
            icon: (cat.icon ?? null) as string | null,
            color: (cat.color ?? null) as string | null,
            displayOrder: (cat.display_order ?? null) as number | null,
            status: (cat.status ?? "active") as HeritageCategory["status"],
          }
        : null,
      municipalityName: null,
      tags,
      media: mediaArr.map((m) => ({
        id: m.id as string,
        siteId: m.site_id as string,
        mediaType: (m.media_type ?? "image") as HeritageSite["media"][number]["mediaType"],
        fileUrl: m.file_url as string,
        fileName: (m.file_name as string) ?? null,
        fileSizeBytes: (m.file_size_bytes as number) ?? null,
        mimeType: (m.mime_type as string) ?? null,
        isPrimary: (m.is_primary as boolean) ?? false,
        sortOrder: (m.sort_order as number) ?? 0,
        caption: (m.caption as string) ?? null,
        uploadedBy: (m.uploaded_by as string) ?? null,
        createdAt: m.created_at as string,
      })),
      creatorName: creator
        ? `${creator.first_name ?? ""} ${creator.last_name ?? ""}`.trim() || null
        : null,
      referenceLinks: [],
    }
  })
}

/** Fetch a single site by ID — feeds the slide-in panel and edit form */
export async function getMtoSiteById(siteId: string, municipalityId: string): Promise<SiteWithDetails | null> {
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      *,
      category:heritage_categories(*),
      tags:heritage_site_tags(*),
      media:heritage_site_media(*),
      reference_links:heritage_site_reference_links(*),
      creator:staff_profiles!heritage_sites_created_by_fkey(first_name, last_name)
    `)
    .eq("id", siteId)
    .eq("municipality_id", municipalityId)
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const creator = data.creator as { first_name: string | null; last_name: string | null } | null
  const cat = data.category as Record<string, unknown> | null
  const tags = (data.tags ?? []) as HeritageSiteTag[]
  const mediaArr = (data.media ?? []) as Record<string, unknown>[]
  const refLinks = (data.reference_links ?? []) as { id: string; url: string; label: string | null }[]

  return {
    id: data.id as string,
    siteName: data.site_name as string,
    alternativeName: data.alternative_name as string | null,
    categoryId: data.category_id as string | null,
    municipalityId: data.municipality_id as string | null,
    barangay: data.barangay as string | null,
    exactAddress: data.exact_address as string | null,
    shortDescription: data.short_description as string | null,
    detailedDescription: data.detailed_description as string | null,
    historicalPeriod: data.historical_period as string | null,
    yearEstablished: data.year_established as string | null,
    architectBuilder: data.architect_builder as string | null,
    architecturalStyle: data.architectural_style as string | null,
    historicalSignificance: data.historical_significance as string | null,
    culturalSignificance: data.cultural_significance as string | null,
    latitude: data.latitude as number | null,
    longitude: data.longitude as number | null,
    elevation: data.elevation as number | null,
    geoAccuracy: data.geo_accuracy as string | null,
    accessibilityInfo: data.accessibility_info as string | null,
    operatingHours: data.operating_hours as string | null,
    entranceFee: data.entrance_fee as string | null,
    designation: data.designation as string | null,
    publicationStatus: (data.publication_status ?? "draft") as HeritageSite["publicationStatus"],
    isFeatured: (data.is_featured ?? false) as boolean,
    visibility: (data.visibility ?? "public") as HeritageSite["visibility"],
    createdBy: data.created_by as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    averageRating: 0,
    reviewCount: 0,
    category: cat
      ? {
          id: cat.id as string,
          name: cat.name as string,
          description: (cat.description ?? null) as string | null,
          icon: (cat.icon ?? null) as string | null,
          color: (cat.color ?? null) as string | null,
          displayOrder: (cat.display_order ?? null) as number | null,
          status: (cat.status ?? "active") as HeritageCategory["status"],
        }
      : null,
    municipalityName: null,
    tags,
    media: mediaArr.map((m) => ({
      id: m.id as string,
      siteId: m.site_id as string,
      mediaType: (m.media_type ?? "image") as HeritageSite["media"][number]["mediaType"],
      fileUrl: m.file_url as string,
      fileName: (m.file_name as string) ?? null,
      fileSizeBytes: (m.file_size_bytes as number) ?? null,
      mimeType: (m.mime_type as string) ?? null,
      isPrimary: (m.is_primary as boolean) ?? false,
      sortOrder: (m.sort_order as number) ?? 0,
      caption: (m.caption as string) ?? null,
      uploadedBy: (m.uploaded_by as string) ?? null,
      createdAt: m.created_at as string,
    })),
    creatorName: creator
      ? `${creator.first_name ?? ""} ${creator.last_name ?? ""}`.trim() || null
      : null,
    referenceLinks: refLinks,
  }
}

/** Create a new heritage site — scoped to the MTO's municipality */
export async function createMtoSite(
  data: {
    siteName: string
    alternativeName?: string | null
    categoryId?: string | null
    municipalityId: string
    barangay?: string | null
    exactAddress?: string | null
    shortDescription?: string | null
    detailedDescription?: string | null
    historicalPeriod?: string | null
    yearEstablished?: string | null
    architectBuilder?: string | null
    architecturalStyle?: string | null
    designation?: string | null
    historicalSignificance?: string | null
    culturalSignificance?: string | null
    latitude?: number | null
    longitude?: number | null
    elevation?: number | null
    geoAccuracy?: string | null
    publicationStatus?: string
    isFeatured?: boolean
    tags?: { tag: string }[]
    referenceLinks?: { url: string; label?: string | null }[]
  },
  staffProfileId: string,
): Promise<SiteWithDetails> {
  const supabase = await getSupabase()

  const duplicate = await findDuplicateHeritageSiteByName(supabase, data.siteName, data.municipalityId)
  if (duplicate) throw new DuplicateHeritageSiteError(duplicate.siteName, duplicate.municipalityName)

  const { data: site, error } = await supabase
    .from("heritage_sites")
    .insert({
      site_name: data.siteName,
      alternative_name: data.alternativeName ?? null,
      category_id: data.categoryId ?? null,
      municipality_id: data.municipalityId,
      barangay: data.barangay ?? null,
      exact_address: data.exactAddress ?? null,
      short_description: data.shortDescription ?? null,
      detailed_description: data.detailedDescription ?? null,
      historical_period: data.historicalPeriod ?? null,
      year_established: data.yearEstablished ?? null,
      architect_builder: data.architectBuilder ?? null,
      architectural_style: data.architecturalStyle ?? null,
      designation: data.designation ?? null,
      historical_significance: data.historicalSignificance ?? null,
      cultural_significance: data.culturalSignificance ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      elevation: data.elevation ?? null,
      geo_accuracy: data.geoAccuracy ?? null,
      publication_status: data.publicationStatus ?? "draft",
      is_featured: data.isFeatured ?? false,
      visibility: "public",
      created_by: staffProfileId,
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to create site: ${error.message}`)

  const siteId = site.id

  if (data.tags && data.tags.length > 0) {
    const { error: tagError } = await supabase.from("heritage_site_tags").insert(
      data.tags.map((t) => ({
        site_id: siteId,
        tag: t.tag,
      })),
    )
    if (tagError) throw new Error(`Failed to add tags: ${tagError.message}`)
  }

  if (data.referenceLinks && data.referenceLinks.length > 0) {
    const { error: linkError } = await supabase.from("heritage_site_reference_links").insert(
      data.referenceLinks.map((l) => ({
        site_id: siteId,
        url: l.url,
        label: l.label ?? null,
      })),
    )
    if (linkError) throw new Error(`Failed to add reference links: ${linkError.message}`)
  }

  // Create version snapshot for audit trail
  const { data: rawSite } = await supabase
    .from("heritage_sites")
    .select("*")
    .eq("id", siteId)
    .single()
  if (rawSite) {
    await createHeritageSiteVersion(siteId, "created", staffProfileId, rawSite)
  }

  const fullSite = await getMtoSiteById(siteId, data.municipalityId)
  if (!fullSite) throw new Error("Failed to fetch created site")
  return fullSite
}

/** Update an existing heritage site — scoped to municipality */
export async function updateMtoSite(
  siteId: string,
  municipalityId: string,
  data: {
    siteName?: string
    alternativeName?: string | null
    categoryId?: string | null
    barangay?: string | null
    exactAddress?: string | null
    shortDescription?: string | null
    detailedDescription?: string | null
    historicalPeriod?: string | null
    yearEstablished?: string | null
    architectBuilder?: string | null
    architecturalStyle?: string | null
    designation?: string | null
    historicalSignificance?: string | null
    culturalSignificance?: string | null
    latitude?: number | null
    longitude?: number | null
    elevation?: number | null
    geoAccuracy?: string | null
    publicationStatus?: string
    isFeatured?: boolean
    tags?: { id?: string; tag: string }[]
    referenceLinks?: { id?: string; url: string; label?: string | null }[]
  },
): Promise<SiteWithDetails> {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()

  if (data.siteName !== undefined) {
    const duplicate = await findDuplicateHeritageSiteByName(supabase, data.siteName, municipalityId, siteId)
    if (duplicate) throw new DuplicateHeritageSiteError(duplicate.siteName, duplicate.municipalityName)
  }

  const updateData: Record<string, unknown> = {}
  if (data.siteName !== undefined) updateData.site_name = data.siteName
  if (data.alternativeName !== undefined) updateData.alternative_name = data.alternativeName
  if (data.categoryId !== undefined) updateData.category_id = data.categoryId
  if (data.barangay !== undefined) updateData.barangay = data.barangay
  if (data.exactAddress !== undefined) updateData.exact_address = data.exactAddress
  if (data.shortDescription !== undefined) updateData.short_description = data.shortDescription
  if (data.detailedDescription !== undefined) updateData.detailed_description = data.detailedDescription
  if (data.historicalPeriod !== undefined) updateData.historical_period = data.historicalPeriod
  if (data.yearEstablished !== undefined) updateData.year_established = data.yearEstablished
  if (data.architectBuilder !== undefined) updateData.architect_builder = data.architectBuilder
  if (data.architecturalStyle !== undefined) updateData.architectural_style = data.architecturalStyle
  if (data.designation !== undefined) updateData.designation = data.designation
  if (data.historicalSignificance !== undefined) updateData.historical_significance = data.historicalSignificance
  if (data.culturalSignificance !== undefined) updateData.cultural_significance = data.culturalSignificance
  if (data.latitude !== undefined) updateData.latitude = data.latitude
  if (data.longitude !== undefined) updateData.longitude = data.longitude
  if (data.elevation !== undefined) updateData.elevation = data.elevation
  if (data.geoAccuracy !== undefined) updateData.geo_accuracy = data.geoAccuracy
  if (data.publicationStatus !== undefined) updateData.publication_status = data.publicationStatus
  if (data.isFeatured !== undefined) updateData.is_featured = data.isFeatured

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from("heritage_sites")
      .update(updateData)
      .eq("id", siteId)
      .eq("municipality_id", municipalityId)

    if (error) throw new Error(`Failed to update site: ${error.message}`)
  }

  if (data.tags !== undefined) {
    await supabase.from("heritage_site_tags").delete().eq("site_id", siteId)

    if (data.tags.length > 0) {
      const { error: tagError } = await supabase.from("heritage_site_tags").insert(
        data.tags.map((t) => ({
          site_id: siteId,
          tag: t.tag,
        })),
      )
      if (tagError) throw new Error(`Failed to update tags: ${tagError.message}`)
    }
  }

  if (data.referenceLinks !== undefined) {
    await supabase.from("heritage_site_reference_links").delete().eq("site_id", siteId)

    if (data.referenceLinks.length > 0) {
      const { error: linkError } = await supabase.from("heritage_site_reference_links").insert(
        data.referenceLinks.map((l) => ({
          site_id: siteId,
          url: l.url,
          label: l.label ?? null,
        })),
      )
      if (linkError) throw new Error(`Failed to update reference links: ${linkError.message}`)
    }
  }

  // Create version snapshot for audit trail
  const { data: rawSite } = await supabase
    .from("heritage_sites")
    .select("*")
    .eq("id", siteId)
    .single()
  if (rawSite) {
    await createHeritageSiteVersion(siteId, "updated", user?.id ?? null, rawSite)
  }

  const fullSite = await getMtoSiteById(siteId, municipalityId)
  if (!fullSite) throw new Error("Site not found after update")
  return fullSite
}

/** Archive (soft-delete) a site by setting publication_status to 'archived' */
export async function archiveMtoSite(siteId: string, municipalityId: string): Promise<void> {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the site to create a version snapshot before archiving
  const { data: site } = await supabase
    .from("heritage_sites")
    .select("*")
    .eq("id", siteId)
    .eq("municipality_id", municipalityId)
    .maybeSingle()

  if (!site) throw new Error("Site not found")

  // Create version snapshot
  const { data: version } = await supabase
    .from("heritage_site_versions")
    .insert({
      heritage_site_id: siteId,
      snapshot: site,
      changed_by: user?.id ?? null,
      change_type: "status_changed",
    })
    .select("id")
    .single()

  // Update publication status
  const { error } = await supabase
    .from("heritage_sites")
    .update({ publication_status: "archived" })
    .eq("id", siteId)
    .eq("municipality_id", municipalityId)

  if (error) throw new Error(`Failed to archive site: ${error.message}`)

  // Create governance review record (graceful failure if table not migrated)
  if (version && user) {
    const { error: govError } = await supabase
      .from("governance_reviews")
      .insert({
        heritage_site_id: siteId,
        heritage_site_version_id: version.id,
        status: "archived",
        submitted_by: user.id,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        reviewer_comment: "Archived by MTO staff",
      })

    if (govError && !govError.message?.includes("does not exist") && !govError.message?.includes("schema cache")) {
      console.error("Failed to create governance review for archive:", govError.message)
    }
  }
}

/** Restore an archived site back to draft */
export async function restoreMtoSite(siteId: string, municipalityId: string): Promise<void> {
  const supabase = await getSupabase()

  const { error } = await supabase
    .from("heritage_sites")
    .update({ publication_status: "draft" })
    .eq("id", siteId)
    .eq("municipality_id", municipalityId)

  if (error) throw new Error(`Failed to restore site: ${error.message}`)
}

/** Permanently delete an archived site — scoped to the MTO's municipality */
export async function deleteMtoSite(siteId: string, municipalityId: string): Promise<void> {
  const supabase = await getSupabase()

  const { data: site } = await supabase
    .from("heritage_sites")
    .select("id")
    .eq("id", siteId)
    .eq("municipality_id", municipalityId)
    .eq("publication_status", "archived")
    .maybeSingle()

  if (!site) throw new Error("Site not found or cannot be deleted")

  await deleteSiteDependencies(siteId)

  const { error } = await supabase
    .from("heritage_sites")
    .delete()
    .eq("id", siteId)
    .eq("municipality_id", municipalityId)

  if (error) throw new Error(`Failed to delete site: ${error.message}`)
}

/** Fetch barangays for the MTO's municipality */
export async function getBarangays(_municipalityId: string): Promise<{ name: string }[]> {
  return []
}

/** Fetch municipalities list (for reference) */
export async function getMunicipalities(): Promise<{ id: string; name: string }[]> {
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from("municipalities")
    .select("id, name")
    .eq("status", "active")
    .order("name", { ascending: true })

  if (error) throw error
  return data ?? []
}

/** Fetch all active categories for dropdown */
export async function getActiveCategories(): Promise<HeritageCategory[]> {
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from("heritage_categories")
    .select("*")
    .eq("status", "active")
    .order("display_order", { ascending: true, nullsFirst: false })

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
