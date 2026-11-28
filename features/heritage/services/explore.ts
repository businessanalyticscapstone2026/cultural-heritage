import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { unstable_cache } from "next/cache"
import { createTokenClient } from "@/utils/supabase/cached"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags"
import type {
  HeritageSite,
  HeritageSiteTag,
  HeritageSiteMedia,
  HeritageCategory,
} from "@/types/heritage"
import {
  DEFAULT_EXPLORE_SORT,
  sortExploreRows,
  type ExploreOrigin,
  type ExploreSort,
  type ExploreSortRow,
} from "./explore-sort"

export interface ExploreResult {
  sites: HeritageSite[]
  totalCount: number
  totalPages: number
  page: number
  pageSize: number
  distancesKm: Record<string, number>
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
          imageUrl: (category.image_url ?? null) as string | null,
          displayOrder: (category.display_order ?? null) as number | null,
          status: (category.status ?? "active") as HeritageCategory["status"],
        }
      : null,
    municipalityName: (municipality?.name as string) ?? null,
    tags,
    media,
  }
}

interface ExploreFilters {
  search?: string
  categoryId?: string
  municipalityId?: string
  historicalPeriod?: string
  accessibility?: string
}

const EXPLORE_SITE_SELECT = `
      *,
      category:heritage_categories(*),
      municipality:municipalities(name),
      tags:heritage_site_tags(*),
      media:heritage_site_media(*)
    `

function buildExploreSitesQuery(
  supabase: ReturnType<typeof createClient>,
  select: string,
  options: ExploreFilters,
) {
  let query = supabase
    .from("heritage_sites")
    .select(select)
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

  if (options.municipalityId) {
    query = query.eq("municipality_id", options.municipalityId)
  }

  if (options.historicalPeriod) {
    query = query.eq("historical_period", options.historicalPeriod)
  }

  if (options.accessibility) {
    const escaped = options.accessibility.replace(/%/g, "\\%").replace(/_/g, "\\_")
    query = query.ilike("accessibility_info", `%${escaped}%`)
  }

  return query
}

export async function getPublishedSites(options: ExploreFilters & {
  page?: number
  pageSize?: number
  sort?: ExploreSort
  recommendedSiteIds?: string[]
  origin?: ExploreOrigin | null
} = {}): Promise<ExploreResult> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const page = Math.max(1, options.page ?? 1)
  const pageSize = Math.max(1, Math.min(100, options.pageSize ?? 10))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Query 1 (light): all matching rows, needed because sorting must happen
  // across every match before the page slice is taken.
  const { data: lightRows, error: lightError } = await buildExploreSitesQuery(
    supabase,
    "id, site_name, latitude, longitude, created_at",
    options,
  ).limit(1000)

  if (lightError) throw lightError

  const sortRows: ExploreSortRow[] = (lightRows ?? []).map((row) => {
    const r = row as unknown as Record<string, unknown>
    return {
      id: r.id as string,
      siteName: (r.site_name as string) ?? "",
      latitude: (r.latitude as number | null) ?? null,
      longitude: (r.longitude as number | null) ?? null,
      createdAt: r.created_at as string,
    }
  })

  const { orderedIds, distancesKm } = sortExploreRows(sortRows, {
    sort: options.sort ?? DEFAULT_EXPLORE_SORT,
    recommendedIds: new Set(options.recommendedSiteIds ?? []),
    origin: options.origin ?? null,
  })

  const totalCount = orderedIds.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const pageIds = orderedIds.slice(from, to + 1)

  if (pageIds.length === 0) {
    return { sites: [], totalCount, totalPages, page, pageSize, distancesKm: {} }
  }

  // Query 2 (full): only the rows on the current page.
  const { data, error } = await buildExploreSitesQuery(
    supabase,
    EXPLORE_SITE_SELECT,
    options,
  )
    .in("id", pageIds)
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })

  if (error) throw error

  const rowsById = new Map<string, Record<string, unknown>>()
  for (const row of data ?? []) {
    const r = row as unknown as Record<string, unknown>
    rowsById.set(r.id as string, r)
  }

  const sites = pageIds
    .map((id) => rowsById.get(id))
    .filter((row): row is Record<string, unknown> => row !== undefined)
    .map(mapDbRow)

  const pageIdSet = new Set(pageIds)
  const pageDistancesKm: Record<string, number> = {}
  for (const [id, km] of Object.entries(distancesKm)) {
    if (pageIdSet.has(id)) pageDistancesKm[id] = km
  }

  return { sites, totalCount, totalPages, page, pageSize, distancesKm: pageDistancesKm }
}

const getCachedExploreCategories = unstable_cache(
  async (): Promise<ExploreCategory[]> => {
    const supabase = createTokenClient("")

    const [categoriesRes, sitesRes] = await Promise.all([
      supabase
        .from("heritage_categories")
        .select("id, name, icon, color")
        .eq("status", "active")
        .order("display_order", { ascending: true, nullsFirst: false }),
      supabase
        .from("heritage_sites")
        .select("category_id")
        .eq("publication_status", "published")
        .eq("visibility", "public")
        .not("category_id", "is", null),
    ])

    if (categoriesRes.error) throw categoriesRes.error

    const counts = new Map<string, number>()
    for (const row of sitesRes.data ?? []) {
      if (row.category_id) {
        counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1)
      }
    }

    return (categoriesRes.data ?? []).map((cat) => ({
      id: cat.id as string,
      name: cat.name as string,
      icon: (cat.icon ?? null) as string | null,
      color: (cat.color ?? null) as string | null,
      siteCount: counts.get(cat.id) ?? 0,
    }))
  },
  ["explore-categories"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.heritageCategories] },
)

export async function getExploreCategories(): Promise<ExploreCategory[]> {
  return getCachedExploreCategories()
}

const getCachedExploreFilterOptions = unstable_cache(
  async (): Promise<{
    municipalities: { id: string; name: string }[]
    historicalPeriods: string[]
  }> => {
    const supabase = createTokenClient("")

    const [municipalitiesResult, periodsResult] = await Promise.all([
      supabase
        .from("municipalities")
        .select("id, name")
        .eq("status", "active")
        .order("name", { ascending: true }),
      supabase
        .from("heritage_sites")
        .select("historical_period")
        .eq("publication_status", "published")
        .eq("visibility", "public")
        .not("historical_period", "is", null)
        .neq("historical_period", "")
        .order("historical_period", { ascending: true }),
    ])

    if (municipalitiesResult.error) throw municipalitiesResult.error
    if (periodsResult.error) throw periodsResult.error

    const seen = new Set<string>()
    const historicalPeriods: string[] = []
    for (const row of periodsResult.data ?? []) {
      const period = row.historical_period as string
      if (!seen.has(period)) {
        seen.add(period)
        historicalPeriods.push(period)
      }
    }

    return {
      municipalities: municipalitiesResult.data ?? [],
      historicalPeriods,
    }
  },
  ["explore-filter-options"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.municipalities, CACHE_TAGS.heritageSites] },
)

export async function getExploreFilterOptions(): Promise<{
  municipalities: { id: string; name: string }[]
  historicalPeriods: string[]
}> {
  return getCachedExploreFilterOptions()
}
