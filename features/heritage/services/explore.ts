import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type {
  HeritageSite,
  HeritageSiteTag,
  HeritageSiteMedia,
  HeritageCategory,
} from "@/types/heritage"

export interface ExploreResult {
  sites: HeritageSite[]
  totalCount: number
  totalPages: number
  page: number
  pageSize: number
}

export interface ExploreCategory {
  id: string
  name: string
  icon: string | null
  color: string | null
  siteCount: number
}

function mapDbRow(row: Record<string, unknown>): HeritageSite {
  const category = row.category as Record<string, unknown> | null
  const municipality = row.municipality as Record<string, unknown> | null
  const tags = (row.tags ?? []) as HeritageSiteTag[]
  const rawMedia = (row.media ?? []) as Record<string, unknown>[]
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

export async function getPublishedSites(options: {
  search?: string
  categoryId?: string
  page?: number
  pageSize?: number
} = {}): Promise<ExploreResult> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const page = Math.max(1, options.page ?? 1)
  const pageSize = Math.max(1, Math.min(100, options.pageSize ?? 10))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("heritage_sites")
    .select(`
      *,
      category:heritage_categories(*),
      municipality:municipalities(name),
      tags:heritage_site_tags(*),
      media:heritage_site_media(*)
    `, { count: "exact" })
    .eq("publication_status", "published")
    .eq("visibility", "public")

  if (options.search) {
    const escaped = options.search.replace(/%/g, "\\%").replace(/_/g, "\\_")
    const q = `%${escaped}%`
    query = query.or(
      `site_name.ilike.${q},alternative_name.ilike.${q},short_description.ilike.${q}`
    )
  }

  if (options.categoryId) {
    query = query.eq("category_id", options.categoryId)
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) throw error

  const sites = (data ?? []).map((row) => mapDbRow(row))
  const totalCount = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return { sites, totalCount, totalPages, page, pageSize }
}

export async function getExploreCategories(): Promise<ExploreCategory[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: categories, error: catError } = await supabase
    .from("heritage_categories")
    .select("id, name, icon, color")
    .eq("status", "active")
    .order("display_order", { ascending: true, nullsFirst: false })

  if (catError) throw catError

  const results: ExploreCategory[] = []

  for (const cat of categories ?? []) {
    const { count, error: countError } = await supabase
      .from("heritage_sites")
      .select("id", { count: "exact", head: true })
      .eq("category_id", cat.id)
      .eq("publication_status", "published")
      .eq("visibility", "public")

    if (countError) throw countError

    results.push({
      id: cat.id as string,
      name: cat.name as string,
      icon: (cat.icon ?? null) as string | null,
      color: (cat.color ?? null) as string | null,
      siteCount: count ?? 0,
    })
  }

  return results
}
