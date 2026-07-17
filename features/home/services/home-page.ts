import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { getMunicipalityImage } from "@/utils/images"
import { generateRecommendations } from "@/features/recommendation/services"
import type {
  HomeAtlasStats,
  HomeCategoryTile,
  HomeEditorialHighlight,
  HomeMapPin,
  HomePagePayload,
  HomeSiteCard,
  HomeTestimonial,
  TrendingSource,
} from "@/features/home/types"
import type { RecommendationResult } from "@/types/recommendation"

const FEATURED_LIMIT = 4
const TRENDING_LIMIT = 3
const RECOMMENDED_LIMIT = 3
const TESTIMONIAL_LIMIT = 3
const MAP_PIN_LIMIT = 50
const EDITORIAL_LIMIT = 2
/**
 * Minimum character length for historical_significance or cultural_significance
 * to count as non-trivial narrative (beyond a name or short tagline).
 * Deliberately not relaxed when fewer than 2 sites qualify — show 1 or empty.
 */
const NARRATIVE_MIN_LENGTH = 80
const TRENDING_WINDOW_DAYS = 30
/** Below this many engagement events (visits + clicks) we fall back to most-reviewed. */
const TRENDING_ENGAGEMENT_THRESHOLD = 5

type SupabaseServer = ReturnType<typeof createClient>

type MediaRow = {
  file_url: string
  is_primary: boolean
  media_type: string
}

type SiteJoinRow = {
  id: string
  site_name: string
  short_description: string | null
  year_established: string | null
  average_rating: number | null
  review_count: number | null
  municipality: { name: string } | { name: string }[] | null
  category:
    | { id: string; name: string; icon: string | null; color: string | null }
    | { id: string; name: string; icon: string | null; color: string | null }[]
    | null
  media?: MediaRow[] | null
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function pickPrimaryImage(media: MediaRow[] | null | undefined): string | null {
  if (!media?.length) return null
  const images = media.filter((m) => m.media_type === "image")
  if (images.length === 0) return null
  const primary = images.find((m) => m.is_primary)
  return (primary ?? images[0]).file_url
}

function mapSiteRow(row: SiteJoinRow): HomeSiteCard {
  const mun = unwrapOne(row.municipality)
  const cat = unwrapOne(row.category)
  return {
    id: row.id,
    siteName: row.site_name,
    shortDescription: row.short_description,
    yearEstablished: row.year_established,
    averageRating: row.average_rating,
    reviewCount: row.review_count,
    municipalityName: mun?.name ?? null,
    categoryId: cat?.id ?? null,
    categoryName: cat?.name ?? null,
    categoryIcon: cat?.icon ?? null,
    categoryColor: cat?.color ?? null,
    imageUrl: pickPrimaryImage(row.media),
  }
}

const SITE_CARD_SELECT = `
  id, site_name, short_description, year_established, average_rating, review_count,
  municipality:municipalities(name),
  category:heritage_categories(id, name, icon, color),
  media:heritage_site_media(file_url, is_primary, media_type)
`

async function getFeaturedSites(supabase: SupabaseServer): Promise<HomeSiteCard[]> {
  const { data, error } = await supabase
    .from("heritage_sites")
    .select(SITE_CARD_SELECT)
    .eq("is_featured", true)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .order("updated_at", { ascending: false })
    .limit(FEATURED_LIMIT)

  if (error) throw new Error(`Featured sites: ${error.message}`)
  return (data ?? []).map((row) => mapSiteRow(row as SiteJoinRow))
}

async function getCategoryTiles(supabase: SupabaseServer): Promise<HomeCategoryTile[]> {
  const { data: categories, error } = await supabase
    .from("heritage_categories")
    .select("id, name, description, icon, color, display_order")
    .eq("status", "active")
    .order("display_order", { ascending: true, nullsFirst: false })

  if (error) throw new Error(`Categories: ${error.message}`)

  const tiles: HomeCategoryTile[] = []
  for (const cat of categories ?? []) {
    const { count, error: countError } = await supabase
      .from("heritage_sites")
      .select("id", { count: "exact", head: true })
      .eq("category_id", cat.id)
      .eq("publication_status", "published")
      .eq("visibility", "public")

    if (countError) throw new Error(`Category count: ${countError.message}`)

    tiles.push({
      id: cat.id as string,
      name: cat.name as string,
      description: (cat.description ?? null) as string | null,
      icon: (cat.icon ?? null) as string | null,
      color: (cat.color ?? null) as string | null,
      siteCount: count ?? 0,
    })
  }

  return tiles
}

function countBySiteId(rows: { site_id: string }[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const row of rows) {
    map.set(row.site_id, (map.get(row.site_id) ?? 0) + 1)
  }
  return map
}

async function hydrateSitesByIds(
  supabase: SupabaseServer,
  ranked: { siteId: string; metricValue: number; metricLabel: string }[],
): Promise<HomeSiteCard[]> {
  if (ranked.length === 0) return []

  const ids = ranked.map((r) => r.siteId)
  const { data, error } = await supabase
    .from("heritage_sites")
    .select(SITE_CARD_SELECT)
    .in("id", ids)
    .eq("publication_status", "published")
    .eq("visibility", "public")

  if (error) throw new Error(`Trending hydrate: ${error.message}`)

  const byId = new Map((data ?? []).map((row) => {
    const card = mapSiteRow(row as SiteJoinRow)
    return [card.id, card] as const
  }))

  const hydrated: HomeSiteCard[] = []
  for (const r of ranked) {
    const site = byId.get(r.siteId)
    if (!site) continue
    hydrated.push({
      ...site,
      metricValue: r.metricValue,
      metricLabel: r.metricLabel,
    })
  }
  return hydrated
}

async function getMostReviewedSites(
  supabase: SupabaseServer,
  limit: number,
): Promise<HomeSiteCard[]> {
  const { data, error } = await supabase
    .from("heritage_sites")
    .select(SITE_CARD_SELECT)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .order("review_count", { ascending: false })
    .order("average_rating", { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Most reviewed: ${error.message}`)

  return (data ?? []).map((row) => {
    const card = mapSiteRow(row as SiteJoinRow)
    return {
      ...card,
      metricValue: card.reviewCount ?? 0,
      metricLabel: "reviews",
    }
  })
}

/**
 * Rank by recent tourist_visits and/or recommendation click-through.
 * Falls back to most-reviewed when engagement is too sparse to rank.
 */
async function getTrendingSites(
  supabase: SupabaseServer,
): Promise<{ sites: HomeSiteCard[]; source: TrendingSource }> {
  const since = new Date()
  since.setDate(since.getDate() - TRENDING_WINDOW_DAYS)
  const sinceIso = since.toISOString()

  const [visitsRes, clicksRes] = await Promise.all([
    supabase
      .from("tourist_visits")
      .select("site_id")
      .gte("created_at", sinceIso),
    supabase
      .from("recommendations")
      .select("site_id")
      .eq("was_clicked", true)
      .gte("clicked_at", sinceIso),
  ])

  // If clicked_at filter fails (nulls), retry without timestamp (sparse data still counts)
  let clickRows = clicksRes.data ?? []
  if (clicksRes.error) {
    const fallback = await supabase
      .from("recommendations")
      .select("site_id")
      .eq("was_clicked", true)
      .gte("generated_at", sinceIso)
    clickRows = fallback.data ?? []
  }

  const visitRows = visitsRes.error ? [] : (visitsRes.data ?? [])
  const visitCounts = countBySiteId(visitRows as { site_id: string }[])
  const clickCounts = countBySiteId(clickRows as { site_id: string }[])

  const totalVisits = visitRows.length
  const totalClicks = clickRows.length
  const totalEngagement = totalVisits + totalClicks

  if (totalEngagement < TRENDING_ENGAGEMENT_THRESHOLD) {
    const sites = await getMostReviewedSites(supabase, TRENDING_LIMIT)
    return { sites, source: "most_reviewed" }
  }

  const combined = new Map<string, number>()
  for (const [id, n] of visitCounts) combined.set(id, (combined.get(id) ?? 0) + n)
  for (const [id, n] of clickCounts) combined.set(id, (combined.get(id) ?? 0) + n)

  const ranked = [...combined.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TRENDING_LIMIT)
    .map(([siteId, metricValue]) => ({
      siteId,
      metricValue,
      metricLabel:
        totalVisits > 0 && totalClicks > 0
          ? "engagement (30d)"
          : totalVisits > 0
            ? "visits (30d)"
            : "recommendation clicks (30d)",
    }))

  const sites = await hydrateSitesByIds(supabase, ranked)
  if (sites.length === 0) {
    const fallback = await getMostReviewedSites(supabase, TRENDING_LIMIT)
    return { sites: fallback, source: "most_reviewed" }
  }

  let source: TrendingSource = "combined_engagement"
  if (totalVisits > 0 && totalClicks === 0) source = "visits"
  else if (totalClicks > 0 && totalVisits === 0) source = "recommendation_clicks"

  return { sites, source }
}

async function getMapPins(supabase: SupabaseServer): Promise<HomeMapPin[]> {
  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      id, site_name, latitude, longitude,
      category:heritage_categories(name, color)
    `)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("site_name", { ascending: true })
    .limit(MAP_PIN_LIMIT)

  if (error) throw new Error(`Map pins: ${error.message}`)

  return (data ?? []).map((row) => {
    const cat = unwrapOne(
      row.category as { name: string; color: string | null } | { name: string; color: string | null }[] | null,
    )
    return {
      id: row.id as string,
      name: row.site_name as string,
      categoryName: cat?.name ?? null,
      categoryColor: cat?.color ?? null,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    }
  })
}

async function getAtlasStats(supabase: SupabaseServer): Promise<HomeAtlasStats> {
  const [sitesRes, muniRes, reviewsRes] = await Promise.all([
    supabase
      .from("heritage_sites")
      .select("id", { count: "exact", head: true })
      .eq("publication_status", "published")
      .eq("visibility", "public"),
    supabase
      .from("municipalities")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
  ])

  if (sitesRes.error) throw new Error(`Atlas site count: ${sitesRes.error.message}`)
  if (muniRes.error) throw new Error(`Atlas municipality count: ${muniRes.error.message}`)

  return {
    heritageSiteCount: sitesRes.count ?? 0,
    municipalityCount: muniRes.count ?? 0,
    publishedReviewCount: reviewsRes.error ? 0 : (reviewsRes.count ?? 0),
  }
}

async function getRecommendedSites(
  supabase: SupabaseServer,
): Promise<{ sites: HomeSiteCard[]; results: RecommendationResult[] }> {
  const { data: { user } } = await supabase.auth.getUser()

  const preferences: import("@/types/recommendation").UserPreferences = {
    interests: [],
    preferredCategoryIds: [],
    limit: RECOMMENDED_LIMIT,
    touristId: user?.id ?? null,
    sessionId: user ? undefined : crypto.randomUUID(),
  }

  if (user) {
    const { data: profile } = await supabase
      .from("tourist_profiles")
      .select("interests, preferred_category_ids, home_latitude, home_longitude")
      .eq("id", user.id)
      .maybeSingle()

    if (profile) {
      preferences.interests = (profile.interests as string[]) ?? []
      preferences.preferredCategoryIds = (profile.preferred_category_ids as string[]) ?? []
      if (profile.home_latitude) preferences.homeLatitude = Number(profile.home_latitude)
      if (profile.home_longitude) preferences.homeLongitude = Number(profile.home_longitude)
    }
  }

  const results = await generateRecommendations(supabase, preferences)
  const sites = results.map<HomeSiteCard>((r) => ({
    id: r.site.id,
    siteName: r.site.siteName,
    shortDescription: r.site.shortDescription,
    yearEstablished: r.site.yearEstablished,
    averageRating: r.site.averageRating,
    reviewCount: r.site.reviewCount,
    municipalityName: r.site.municipalityName,
    categoryId: r.site.categoryId,
    categoryName: r.site.category?.name ?? null,
    categoryIcon: r.site.category?.icon ?? null,
    categoryColor: r.site.category?.color ?? null,
    imageUrl: r.site.media.find((m) => m.isPrimary)?.fileUrl
      ?? r.site.media.find((m) => m.mediaType === "image")?.fileUrl
      ?? null,
  }))

  return { sites, results }
}

async function getTestimonials(supabase: SupabaseServer): Promise<HomeTestimonial[]> {
  // Schema status values: published | flagged | hidden (no "approved")
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id, rating, comment, created_at, site_id,
      tourist:tourist_profiles(first_name, last_name),
      site:heritage_sites(id, site_name, publication_status, visibility)
    `)
    .eq("status", "published")
    .gte("rating", 4)
    .order("created_at", { ascending: false })
    .limit(TESTIMONIAL_LIMIT * 3)

  if (error) {
    // RLS or missing join may fail; surface empty rather than crash the homepage
    console.error("Testimonials query failed:", error.message)
    return []
  }

  const results: HomeTestimonial[] = []
  for (const row of data ?? []) {
    const site = unwrapOne(
      row.site as
        | { id: string; site_name: string; publication_status: string; visibility: string }
        | { id: string; site_name: string; publication_status: string; visibility: string }[]
        | null,
    )
    if (!site || site.publication_status !== "published" || site.visibility !== "public") {
      continue
    }

    const tourist = unwrapOne(
      row.tourist as
        | { first_name: string | null; last_name: string | null }
        | { first_name: string | null; last_name: string | null }[]
        | null,
    )
    const first = tourist?.first_name?.trim() ?? ""
    const last = tourist?.last_name?.trim() ?? ""
    const reviewerName =
      [first, last].filter(Boolean).join(" ") || "Heritage traveler"

    results.push({
      id: row.id as string,
      rating: row.rating as number,
      comment: (row.comment ?? null) as string | null,
      createdAt: row.created_at as string,
      reviewerName,
      siteId: site.id,
      siteName: site.site_name,
    })

    if (results.length >= TESTIMONIAL_LIMIT) break
  }

  return results
}

/**
 * Tourism highlights (CR-CHTS-002): editorial picks with real narrative content.
 * Qualifies when historical_significance or cultural_significance is non-trivial.
 * Returns up to 2 sites; if only one qualifies, returns one (does not lower threshold).
 */
async function getEditorialHighlights(
  supabase: SupabaseServer,
): Promise<HomeEditorialHighlight[]> {
  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      id, site_name, short_description, year_established,
      historical_significance, cultural_significance,
      latitude, longitude, is_featured, updated_at,
      municipality:municipalities(name),
      category:heritage_categories(name, color),
      media:heritage_site_media(file_url, is_primary, media_type)
    `)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .or(
      "historical_significance.not.is.null,cultural_significance.not.is.null",
    )
    .order("is_featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(40)

  if (error) throw new Error(`Editorial highlights: ${error.message}`)

  type EditorialRow = {
    id: string
    site_name: string
    short_description: string | null
    year_established: string | null
    historical_significance: string | null
    cultural_significance: string | null
    latitude: number | null
    longitude: number | null
    is_featured: boolean
    updated_at: string
    municipality: { name: string } | { name: string }[] | null
    category:
      | { name: string; color: string | null }
      | { name: string; color: string | null }[]
      | null
    media: MediaRow[] | null
  }

  const scored: { highlight: HomeEditorialHighlight; score: number }[] = []

  for (const row of data ?? []) {
    const r = row as EditorialRow
    const historical = (r.historical_significance ?? "").trim()
    const cultural = (r.cultural_significance ?? "").trim()

    let narrative = ""
    let narrativeKind: "historical" | "cultural" = "historical"
    if (historical.length >= NARRATIVE_MIN_LENGTH && historical.length >= cultural.length) {
      narrative = historical
      narrativeKind = "historical"
    } else if (cultural.length >= NARRATIVE_MIN_LENGTH) {
      narrative = cultural
      narrativeKind = "cultural"
    } else if (historical.length >= NARRATIVE_MIN_LENGTH) {
      narrative = historical
      narrativeKind = "historical"
    } else {
      continue
    }

    const mun = unwrapOne(r.municipality)
    const cat = unwrapOne(r.category)
    const lat = r.latitude != null ? Number(r.latitude) : null
    const lng = r.longitude != null ? Number(r.longitude) : null
    const hasCoords =
      lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)

    scored.push({
      highlight: {
        id: r.id,
        siteName: r.site_name,
        shortDescription: r.short_description,
        narrative,
        narrativeKind,
        yearEstablished: r.year_established,
        municipalityName: mun?.name ?? null,
        categoryName: cat?.name ?? null,
        categoryColor: cat?.color ?? null,
        imageUrl: pickPrimaryImage(r.media),
        latitude: hasCoords ? lat : null,
        longitude: hasCoords ? lng : null,
      },
      score: narrative.length + (r.is_featured ? 200 : 0) + (hasCoords ? 50 : 0),
    })
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, EDITORIAL_LIMIT)
    .map((x) => x.highlight)
}

async function resolveHeroImageUrl(
  supabase: SupabaseServer,
  featured: HomeSiteCard[],
  recommended: HomeSiteCard[],
): Promise<string | null> {
  const fromFeatured = featured.find((s) => s.imageUrl)?.imageUrl
  if (fromFeatured) return fromFeatured

  const fromRecommended = recommended.find((s) => s.imageUrl)?.imageUrl
  if (fromRecommended) return fromRecommended

  const { data } = await supabase
    .from("heritage_sites")
    .select(`
      media:heritage_site_media(file_url, is_primary, media_type),
      municipality:municipalities(name)
    `)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .limit(5)

  for (const row of data ?? []) {
    const url = pickPrimaryImage(row.media as MediaRow[] | null)
    if (url) return url
  }

  // District asset fallback (project static images, not mock site content)
  const muniNames = ["Balayan", "Taal", "Calatagan", "Nasugbu", "Lian"]
  for (const name of muniNames) {
    const img = await getMunicipalityImage(name)
    if (img) return img
  }

  return null
}

export async function getTouristHomePageData(): Promise<HomePagePayload> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [
    featuredSites,
    editorialHighlights,
    categories,
    trending,
    mapPins,
    atlasStats,
    recommended,
    testimonials,
  ] = await Promise.all([
    getFeaturedSites(supabase),
    getEditorialHighlights(supabase),
    getCategoryTiles(supabase),
    getTrendingSites(supabase),
    getMapPins(supabase),
    getAtlasStats(supabase),
    getRecommendedSites(supabase),
    getTestimonials(supabase),
  ])

  const heroImageUrl = await resolveHeroImageUrl(supabase, featuredSites, recommended.sites)

  return {
    featuredSites,
    editorialHighlights,
    categories,
    trendingSites: trending.sites,
    trendingSource: trending.source,
    mapPins,
    atlasStats,
    recommendedSites: recommended.sites,
    recommendedResults: recommended.results,
    testimonials,
    heroImageUrl,
  }
}
