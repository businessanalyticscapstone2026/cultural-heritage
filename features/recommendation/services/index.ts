import { createClient } from "@/utils/supabase/server"
import { haversineDistance } from "@/utils/geo"
import type {
  RecommendationResult,
  UserPreferences,
  RecommendationWeights,
  SiteScoreBreakdown,
} from "@/types/recommendation"
import type { HeritageSite, HeritageSiteTag } from "@/types/heritage"

const DEFAULT_WEIGHTS: RecommendationWeights = {
  categoryMatch: 0.25,
  historicalSignificance: 0.2,
  accessibility: 0.15,
  distance: 0.15,
  popularity: 0.1,
  travelStyle: 0.15,
}

const DISTANCE_DECAY_FACTOR = 20

interface RawSite {
  id: string
  site_name: string
  alternative_name: string | null
  category_id: string | null
  municipality_id: string | null
  barangay: string | null
  exact_address: string | null
  short_description: string | null
  detailed_description: string | null
  historical_period: string | null
  year_established: string | null
  architect_builder: string | null
  architectural_style: string | null
  historical_significance: string | null
  cultural_significance: string | null
  latitude: number | null
  longitude: number | null
  elevation: number | null
  geo_accuracy: string | null
  accessibility_info: string | null
  operating_hours: string | null
  entrance_fee: string | null
  designation: string | null
  publication_status: string
  is_featured: boolean
  visibility: string
  created_by: string | null
  created_at: string
  updated_at: string
  average_rating: number
  review_count: number
  category: { id: string; name: string; description: string | null; icon: string | null; color: string | null; display_order: number | null; status: string } | null
  municipality: { name: string } | null
  tags: HeritageSiteTag[]
  media: { id: string; site_id: string; media_type: string; file_url: string; file_name: string | null; file_size_bytes: number | null; mime_type: string | null; is_primary: boolean; sort_order: number | null; caption: string | null; uploaded_by: string | null; created_at: string }[]
}

function toHeritageSite(raw: RawSite): HeritageSite {
  return {
    id: raw.id,
    siteName: raw.site_name,
    alternativeName: raw.alternative_name,
    categoryId: raw.category_id,
    municipalityId: raw.municipality_id,
    barangay: raw.barangay,
    exactAddress: raw.exact_address,
    shortDescription: raw.short_description,
    detailedDescription: raw.detailed_description,
    historicalPeriod: raw.historical_period,
    yearEstablished: raw.year_established,
    architectBuilder: raw.architect_builder,
    architecturalStyle: raw.architectural_style,
    historicalSignificance: raw.historical_significance,
    culturalSignificance: raw.cultural_significance,
    latitude: raw.latitude,
    longitude: raw.longitude,
    elevation: raw.elevation,
    geoAccuracy: raw.geo_accuracy,
    accessibilityInfo: raw.accessibility_info,
    operatingHours: raw.operating_hours,
    entranceFee: raw.entrance_fee,
    designation: raw.designation,
    publicationStatus: raw.publication_status as HeritageSite["publicationStatus"],
    isFeatured: raw.is_featured,
    visibility: raw.visibility as HeritageSite["visibility"],
    createdBy: raw.created_by,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    category: raw.category
      ? {
          id: raw.category.id,
          name: raw.category.name,
          description: raw.category.description,
          icon: raw.category.icon,
          color: raw.category.color,
          displayOrder: raw.category.display_order,
          status: raw.category.status as "active" | "inactive",
        }
      : null,
    municipalityName: raw.municipality?.name ?? null,
    tags: raw.tags ?? [],
    media: (raw.media ?? []).map((m) => ({
      id: m.id,
      siteId: m.site_id,
      mediaType: m.media_type as HeritageSite["media"][number]["mediaType"],
      fileUrl: m.file_url,
      fileName: m.file_name,
      fileSizeBytes: m.file_size_bytes,
      mimeType: m.mime_type,
      isPrimary: m.is_primary,
      sortOrder: m.sort_order ?? 0,
      caption: m.caption,
      uploadedBy: m.uploaded_by,
      createdAt: m.created_at,
    })),
    averageRating: raw.average_rating,
    reviewCount: raw.review_count,
  }
}

function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0
  const setA = new Set(a.map((s) => s.toLowerCase().trim()))
  const setB = new Set(b.map((s) => s.toLowerCase().trim()))
  const intersection = new Set([...setA].filter((x) => setB.has(x)))
  const union = new Set([...setA, ...setB])
  return union.size === 0 ? 0 : intersection.size / union.size
}

function computeCategoryMatch(
  siteCategoryId: string | null,
  preferredCategoryIds: string[],
): number {
  if (!siteCategoryId || preferredCategoryIds.length === 0) return 0
  return preferredCategoryIds.includes(siteCategoryId) ? 1 : 0
}

function computeTagInterestScore(
  interests: string[],
  tags: HeritageSiteTag[],
): number {
  if (interests.length === 0 || tags.length === 0) return 0
  const tagValues = tags.map((t) => t.tag)
  return jaccardSimilarity(interests, tagValues)
}

function computeAccessibilityScore(accessibilityInfo: string | null): number {
  return accessibilityInfo && accessibilityInfo.length > 0 ? 1 : 0.5
}

function computeLocationScore(
  siteLat: number | null,
  siteLng: number | null,
  originLat: number | null,
  originLng: number | null,
): { score: number; distanceKm: number | null } {
  if (
    siteLat === null || siteLng === null ||
    originLat === null || originLng === null
  ) {
    return { score: 0, distanceKm: null }
  }
  const distanceKm = haversineDistance(originLat, originLng, siteLat, siteLng)
  const score = Math.exp(-distanceKm / DISTANCE_DECAY_FACTOR)
  return { score, distanceKm }
}

function computePopularityScore(
  averageRating: number,
  reviewCount: number,
  visitCount: number,
): number {
  if (reviewCount > 0) {
    return averageRating / 5
  }
  if (visitCount > 0) {
    return Math.min(visitCount / 100, 1)
  }
  return 0
}

function computeTravelStyleScore(
  travelStyle: string | null,
  groupType: string | null,
  accessibilityInfo: string | null,
): number {
  if (!travelStyle && !groupType) return 0.5

  let score = 0.5

  if (travelStyle === "family" || travelStyle === "group") {
    if (accessibilityInfo && accessibilityInfo.length > 0) {
      score += 0.2
    }
  }

  if (groupType === "walking") {
    if (accessibilityInfo && /walk|foot|pedestrian/i.test(accessibilityInfo)) {
      score += 0.15
    }
  }

  if (groupType === "driving") {
    if (accessibilityInfo && /park|car|vehicle/i.test(accessibilityInfo)) {
      score += 0.15
    }
  }

  if (travelStyle === "solo") {
    score += 0.1
  }

  return Math.min(score, 1)
}

function buildReasons(breakdown: {
  categoryMatch: number
  tagInterestScore: number
  accessibilityScore: number
  locationScore: number
  popularityScore: number
  travelStyleScore: number
  distanceKm: number | null
}): string[] {
  const reasons: string[] = []
  if (breakdown.categoryMatch > 0) {
    reasons.push("Matches your preferred heritage categories")
  }
  if (breakdown.tagInterestScore > 0) {
    reasons.push("Aligns with your interests")
  }
  if (breakdown.distanceKm !== null && breakdown.distanceKm < 5) {
    reasons.push("Very close to your location")
  } else if (breakdown.distanceKm !== null && breakdown.distanceKm < 20) {
    reasons.push("Near your location")
  }
  if (breakdown.popularityScore > 0.7) {
    reasons.push("Highly rated by other visitors")
  }
  if (breakdown.travelStyleScore > 0.6) {
    reasons.push("Great fit for your travel style")
  }
  if (reasons.length === 0) {
    reasons.push("Popular heritage destination")
  }
  return reasons
}

function parseWeights(value: Record<string, unknown> | null): RecommendationWeights {
  if (!value) return DEFAULT_WEIGHTS
  return {
    categoryMatch: typeof value.categoryMatch === "number" ? value.categoryMatch : DEFAULT_WEIGHTS.categoryMatch,
    historicalSignificance: typeof value.historicalSignificance === "number" ? value.historicalSignificance : DEFAULT_WEIGHTS.historicalSignificance,
    accessibility: typeof value.accessibility === "number" ? value.accessibility : DEFAULT_WEIGHTS.accessibility,
    distance: typeof value.distance === "number" ? value.distance : DEFAULT_WEIGHTS.distance,
    popularity: typeof value.popularity === "number" ? value.popularity : DEFAULT_WEIGHTS.popularity,
    travelStyle: typeof value.travelStyle === "number" ? value.travelStyle : DEFAULT_WEIGHTS.travelStyle,
  }
}

export async function generateRecommendations(
  supabase: ReturnType<typeof createClient>,
  preferences: UserPreferences,
): Promise<RecommendationResult[]> {
  const [weightsResult, sitesResult, visitsResult] = await Promise.all([
    supabase
      .from("system_settings")
      .select("value")
      .eq("key", "recommendation_weights")
      .maybeSingle(),
    supabase
      .from("heritage_sites")
      .select(`
        id, site_name, alternative_name, category_id, municipality_id,
        barangay, exact_address, short_description, detailed_description,
        historical_period, year_established, architect_builder,
        architectural_style, historical_significance, cultural_significance,
        latitude, longitude, elevation, geo_accuracy, accessibility_info,
        operating_hours, entrance_fee, designation,
        publication_status, is_featured, visibility,
        created_by, created_at, updated_at,
        average_rating, review_count,
        category:heritage_categories(id, name, description, icon, color, display_order, status),
        municipality:municipalities(name),
        tags:heritage_site_tags(id, site_id, tag),
        media:heritage_site_media(id, site_id, media_type, file_url, file_name, file_size_bytes, mime_type, is_primary, caption, uploaded_by, created_at)
      `)
      .eq("publication_status", "published")
      .eq("visibility", "public"),
    supabase
      .from("tourist_visits")
      .select("site_id"),
  ])

  if (sitesResult.error) {
    throw new Error(`Failed to fetch heritage sites: ${sitesResult.error.message}`)
  }

  const weights = parseWeights(weightsResult.data?.value as Record<string, unknown> | null)
  const rawSites = (sitesResult.data ?? []) as unknown as RawSite[]

  const visitCounts = new Map<string, number>()
  if (visitsResult.data) {
    for (const row of visitsResult.data as { site_id: string }[]) {
      visitCounts.set(row.site_id, (visitCounts.get(row.site_id) ?? 0) + 1)
    }
  }

  const originLat = preferences.homeLatitude ?? null
  const originLng = preferences.homeLongitude ?? null
  const interests = preferences.interests ?? []
  const preferredCategoryIds = preferences.preferredCategoryIds ?? []
  const travelStyle = preferences.travelStyle ?? null
  const groupType = preferences.groupType ?? null

  const scored: (SiteScoreBreakdown | null)[] = rawSites.map((site) => {
    const categoryMatch = computeCategoryMatch(site.category_id, preferredCategoryIds)
    const tagInterestScore = computeTagInterestScore(interests, site.tags ?? [])
    const accessScore = computeAccessibilityScore(site.accessibility_info)
    const { score: locScore, distanceKm } = computeLocationScore(
      site.latitude,
      site.longitude,
      originLat,
      originLng,
    )
    const popScore = computePopularityScore(
      site.average_rating,
      site.review_count,
      visitCounts.get(site.id) ?? 0,
    )
    const travelScore = computeTravelStyleScore(travelStyle, groupType, site.accessibility_info)

    const hasSignal =
      categoryMatch > 0 ||
      tagInterestScore > 0 ||
      locScore > 0 ||
      popScore > 0

    if (!hasSignal) {
      return null
    }

    const finalScore =
      weights.categoryMatch * categoryMatch +
      weights.historicalSignificance * tagInterestScore +
      weights.accessibility * accessScore +
      weights.distance * locScore +
      weights.popularity * popScore +
      weights.travelStyle * travelScore

    const matchPercentage = Math.round(finalScore * 100)

    return {
      siteId: site.id,
      categoryMatch,
      tagInterestScore,
      accessibilityScore: accessScore,
      locationScore: locScore,
      popularityScore: popScore,
      travelStyleScore: travelScore,
      finalScore,
      matchPercentage,
      distanceKm,
      reasons: buildReasons({
        categoryMatch,
        tagInterestScore,
        accessibilityScore: accessScore,
        locationScore: locScore,
        popularityScore: popScore,
        travelStyleScore: travelScore,
        distanceKm,
      }),
    }
  })

  let validScores = scored.filter((s): s is SiteScoreBreakdown => s !== null)

  // Cold-start fallback: if every site has zero signal, fall back to pure popularity
  if (validScores.length === 0 && rawSites.length > 0) {
    validScores = rawSites.map((site) => {
      const popScore = computePopularityScore(
        site.average_rating,
        site.review_count,
        visitCounts.get(site.id) ?? 0,
      )

      return {
        siteId: site.id,
        categoryMatch: 0,
        tagInterestScore: 0,
        accessibilityScore: 0,
        locationScore: 0,
        popularityScore: popScore,
        travelStyleScore: 0,
        finalScore: popScore,
        matchPercentage: Math.round(popScore * 100),
        distanceKm: null,
        reasons: ["Popular heritage destination"],
      }
    })
  }

  validScores.sort((a, b) => b.finalScore - a.finalScore)

  const limit = preferences.limit ?? 20
  const topScores = validScores.slice(0, limit)

  const recIds = topScores.map(() => crypto.randomUUID())

  const results: RecommendationResult[] = topScores.map((s, i) => {
    const raw = rawSites.find((r) => r.id === s.siteId)!
    return {
      recommendationId: recIds[i],
      site: toHeritageSite(raw),
      score: s.finalScore,
      matchPercentage: s.matchPercentage,
      reasons: s.reasons,
    }
  })

  await persistRecommendations(supabase, results, preferences)

  return results
}

async function persistRecommendations(
  supabase: ReturnType<typeof createClient>,
  results: RecommendationResult[],
  preferences: UserPreferences,
): Promise<void> {
  if (!preferences.touristId && !preferences.sessionId) {
    return
  }

  const rows = results
    .filter((r) => r.site.municipalityId != null)
    .map((r) => ({
      id: r.recommendationId,
      site_id: r.site.id,
      municipality_id: r.site.municipalityId as string,
      score: r.score,
      method: "weighted_hybrid" as const,
      tourist_id: preferences.touristId ?? null,
      session_id: preferences.sessionId ?? null,
    }))

  if (rows.length === 0) {
    return
  }

  const { error } = await supabase.from("recommendations").insert(rows)

  if (error) {
    console.error("Failed to persist recommendations:", error.message)
  }
}

export async function getRecommendations(
  supabase: ReturnType<typeof createClient>,
  preferences: UserPreferences,
): Promise<RecommendationResult[]> {
  return generateRecommendations(supabase, preferences)
}

export function calculateScore(
  site: {
    categoryId: string | null
    tags: HeritageSiteTag[]
    accessibilityInfo: string | null
    latitude: number | null
    longitude: number | null
    averageRating: number
    reviewCount: number
  },
  preferences: UserPreferences,
  weights: RecommendationWeights,
  originLat: number | null,
  originLng: number | null,
): SiteScoreBreakdown {
  const categoryMatch = computeCategoryMatch(site.categoryId, preferences.preferredCategoryIds)
  const tagInterestScore = computeTagInterestScore(preferences.interests, site.tags)
  const accessScore = computeAccessibilityScore(site.accessibilityInfo)
  const { score: locScore, distanceKm } = computeLocationScore(
    site.latitude,
    site.longitude,
    originLat,
    originLng,
  )
  const popScore = computePopularityScore(site.averageRating, site.reviewCount, 0)
  const travelScore = computeTravelStyleScore(
    preferences.travelStyle ?? null,
    preferences.groupType ?? null,
    site.accessibilityInfo,
  )

  const finalScore =
    weights.categoryMatch * categoryMatch +
    weights.historicalSignificance * tagInterestScore +
    weights.accessibility * accessScore +
    weights.distance * locScore +
    weights.popularity * popScore +
    weights.travelStyle * travelScore

  const matchPercentage = Math.round(finalScore * 100)

  return {
    siteId: site.categoryId ?? "",
    categoryMatch,
    tagInterestScore,
    accessibilityScore: accessScore,
    locationScore: locScore,
    popularityScore: popScore,
    travelStyleScore: travelScore,
    finalScore,
    matchPercentage,
    distanceKm,
    reasons: buildReasons({
      categoryMatch,
      tagInterestScore,
      accessibilityScore: accessScore,
      locationScore: locScore,
      popularityScore: popScore,
      travelStyleScore: travelScore,
      distanceKm,
    }),
  }
}

export function getWeightedScore(scores: Record<string, number>): number {
  return Object.values(scores).reduce((sum, val) => sum + val, 0)
}
