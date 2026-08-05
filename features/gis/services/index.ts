import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type {
  GeoFeatureCollection,
  MapViewport,
  GisConfig,
  HeritageCategoryWithStatus,
  IntegrationInfo,
  BoundaryGeoJSON,
  MunicipalBoundary,
} from "../types"

export type MapSite = {
  id: string
  siteName: string
  latitude: number | null
  longitude: number | null
  elevation: number | null
  geoAccuracy: string | null
  categoryId: string | null
  categoryName: string | null
  categoryColor: string | null
  barangay: string | null
  publicationStatus: string
  shortDescription: string | null
  primaryImage: string | null
}

export type MapSiteDetail = MapSite & {
  alternativeName: string | null
  exactAddress: string | null
  detailedDescription: string | null
  historicalPeriod: string | null
  yearEstablished: string | null
  architecturalStyle: string | null
  historicalSignificance: string | null
  culturalSignificance: string | null
  accessibilityInfo: string | null
  operatingHours: string | null
  media: { id: string; mediaType: string; fileUrl: string; caption: string | null }[]
}

export async function getHeritageGeoJSON(): Promise<GeoFeatureCollection> {
  return { type: "FeatureCollection", features: [] }
}

/**
 * Boundaries for every municipality that has one uploaded, as a GeoJSON
 * FeatureCollection ready to feed into `<MapGeoJSON>`. Municipalities with no
 * uploaded boundary simply have no feature here (CHT-081 requirement: no
 * crash / blank overlay for those).
 */
export async function getMunicipalityBoundaries(): Promise<GeoFeatureCollection> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("municipal_boundaries")
    .select("municipality_id, boundary_geojson, municipalities(name)")

  if (error) throw new Error(`Failed to fetch municipal boundaries: ${error.message}`)

  return {
    type: "FeatureCollection",
    features: (data ?? []).flatMap((row) => {
      const geojson = row.boundary_geojson as BoundaryGeoJSON | null
      if (!geojson?.geometry) return []

      const municipalityRaw = row.municipalities as { name: string }[] | { name: string } | null
      const municipality = Array.isArray(municipalityRaw) ? municipalityRaw[0] : municipalityRaw

      return [
        {
          type: "Feature",
          geometry: geojson.geometry,
          properties: {
            municipalityId: row.municipality_id as string,
            municipalityName: municipality?.name ?? "Unknown municipality",
          },
        },
      ]
    }),
  }
}

export function calculateViewportBounds(coordinates: [number, number][]): MapViewport {
  return { center: [120.78, 13.92], zoom: 10, bearing: 0, pitch: 0 }
}

export async function getGisConfig(): Promise<GisConfig> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "gis_config")
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch gis_config: ${error.message}`)

  const defaults: GisConfig = {
    defaultMapCenter: { lat: 13.92, lng: 120.78 },
    defaultZoom: 10,
    basemapProvider: "openstreetmap",
    visibleCategoryIds: [],
  }

  if (!data?.value) return defaults

  const stored = data.value as Record<string, unknown>
  return {
    defaultMapCenter: {
      lat: (stored.defaultMapCenter as { lat: number })?.lat ?? defaults.defaultMapCenter.lat,
      lng: (stored.defaultMapCenter as { lng: number })?.lng ?? defaults.defaultMapCenter.lng,
    },
    defaultZoom: (stored.defaultZoom as number) ?? defaults.defaultZoom,
    basemapProvider: (stored.basemapProvider as GisConfig["basemapProvider"]) ?? defaults.basemapProvider,
    googleMapsStyle: stored.googleMapsStyle as GisConfig["googleMapsStyle"],
    visibleCategoryIds: (stored.visibleCategoryIds as string[]) ?? defaults.visibleCategoryIds,
  }
}

export async function getHeritageCategories(): Promise<HeritageCategoryWithStatus[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_categories")
    .select("id, name, color, icon, status")
    .order("display_order", { ascending: true })

  if (error) throw new Error(`Failed to fetch heritage_categories: ${error.message}`)

  return (data ?? []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    color: cat.color ?? "#6366f1",
    icon: cat.icon,
    status: cat.status as "active" | "inactive",
  }))
}

/** Feed 1 (map pins): fetch all heritage sites for the MTO's municipality with category color */
export async function getMtoMapSites(municipalityId: string): Promise<MapSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      id, site_name, latitude, longitude, elevation, geo_accuracy,
      category_id, barangay, publication_status, short_description,
      category:heritage_categories(name, color),
      media:heritage_site_media(id, media_type, file_url, caption)
    `)
    .eq("municipality_id", municipalityId)
    .order("site_name", { ascending: true })
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })

  if (error) throw new Error(`Failed to fetch map sites: ${error.message}`)

  return (data ?? []).map((row) => {
    // Supabase returns a to-one embed as a plain object, not an array.
    const catRaw = row.category as Record<string, unknown>[] | Record<string, unknown> | null
    const cat = (Array.isArray(catRaw) ? catRaw[0] : catRaw) as { name: string; color: string } | null
    const mediaArr = (row.media ?? []) as Record<string, unknown>[]
    const primaryImage = mediaArr.find((m) => m.media_type === "image")

    return {
      id: row.id as string,
      siteName: row.site_name as string,
      latitude: row.latitude as number | null,
      longitude: row.longitude as number | null,
      elevation: row.elevation as number | null,
      geoAccuracy: row.geo_accuracy as string | null,
      categoryId: row.category_id as string | null,
      categoryName: cat?.name ?? null,
      categoryColor: cat?.color ?? null,
      barangay: row.barangay as string | null,
      publicationStatus: row.publication_status as string,
      shortDescription: row.short_description as string | null,
      primaryImage: primaryImage?.file_url as string | null ?? null,
    }
  })
}

/** Admin map preview: fetch all heritage sites system-wide (all municipalities) with category color */
export async function getAllMapSites(): Promise<MapSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      id, site_name, latitude, longitude, elevation, geo_accuracy,
      category_id, barangay, publication_status, short_description,
      category:heritage_categories(name, color),
      media:heritage_site_media(id, media_type, file_url, caption)
    `)
    .order("site_name", { ascending: true })
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })

  if (error) throw new Error(`Failed to fetch map sites: ${error.message}`)

  return (data ?? []).map((row) => {
    // Supabase returns a to-one embed as a plain object, not an array.
    const catRaw = row.category as Record<string, unknown>[] | Record<string, unknown> | null
    const cat = (Array.isArray(catRaw) ? catRaw[0] : catRaw) as { name: string; color: string } | null
    const mediaArr = (row.media ?? []) as Record<string, unknown>[]
    const primaryImage = mediaArr.find((m) => m.media_type === "image")

    return {
      id: row.id as string,
      siteName: row.site_name as string,
      latitude: row.latitude as number | null,
      longitude: row.longitude as number | null,
      elevation: row.elevation as number | null,
      geoAccuracy: row.geo_accuracy as string | null,
      categoryId: row.category_id as string | null,
      categoryName: cat?.name ?? null,
      categoryColor: cat?.color ?? null,
      barangay: row.barangay as string | null,
      publicationStatus: row.publication_status as string,
      shortDescription: row.short_description as string | null,
      primaryImage: primaryImage?.file_url as string | null ?? null,
    }
  })
}

/** Feed 2 (detail panel): fetch full site detail scoped to municipality */
export async function getMtoSiteDetail(
  siteId: string,
  municipalityId: string,
): Promise<MapSiteDetail | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_sites")
    .select(`
      id, site_name, alternative_name, latitude, longitude, elevation, geo_accuracy,
      category_id, barangay, exact_address, publication_status,
      short_description, detailed_description,
      historical_period, year_established, architectural_style,
      historical_significance, cultural_significance,
      accessibility_info, operating_hours,
      category:heritage_categories(name, color),
      media:heritage_site_media(id, media_type, file_url, caption)
    `)
    .eq("id", siteId)
    .eq("municipality_id", municipalityId)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch site detail: ${error.message}`)
  if (!data) return null

  const catRaw = data.category as Record<string, unknown>[] | Record<string, unknown> | null
  const cat = (Array.isArray(catRaw) ? catRaw[0] : catRaw) as { name: string; color: string } | null
  const mediaArr = (data.media ?? []) as Record<string, unknown>[]
  const primaryImage = mediaArr.find(
    (m) => m.media_type === "image",
  ) ?? mediaArr.find((m) => m.media_type === "image")

  return {
    id: data.id as string,
    siteName: data.site_name as string,
    alternativeName: data.alternative_name as string | null,
    latitude: data.latitude as number | null,
    longitude: data.longitude as number | null,
    elevation: data.elevation as number | null,
    geoAccuracy: data.geo_accuracy as string | null,
    categoryId: data.category_id as string | null,
    categoryName: cat?.name ?? null,
    categoryColor: cat?.color ?? null,
    barangay: data.barangay as string | null,
    exactAddress: data.exact_address as string | null,
    publicationStatus: data.publication_status as string,
    shortDescription: data.short_description as string | null,
    detailedDescription: data.detailed_description as string | null,
    historicalPeriod: data.historical_period as string | null,
    yearEstablished: data.year_established as string | null,
    architecturalStyle: data.architectural_style as string | null,
    historicalSignificance: data.historical_significance as string | null,
    culturalSignificance: data.cultural_significance as string | null,
    accessibilityInfo: data.accessibility_info as string | null,
    operatingHours: data.operating_hours as string | null,
    primaryImage: primaryImage?.file_url as string | null ?? null,
    media: mediaArr.map((m) => ({
      id: m.id as string,
      mediaType: m.media_type as string,
      fileUrl: m.file_url as string,
      caption: m.caption as string | null,
    })),
  }
}

/** Feed 3 (coordinate write): update latitude, longitude, elevation, geo_accuracy with server-side validation */
export async function updateSiteLocation(
  siteId: string,
  municipalityId: string,
  data: {
    latitude: number | null
    longitude: number | null
    elevation?: number | null
    geoAccuracy?: string | null
  },
): Promise<void> {
  if (data.latitude != null && (data.latitude < -90 || data.latitude > 90)) {
    throw new Error("Latitude must be between -90 and 90")
  }
  if (data.longitude != null && (data.longitude < -180 || data.longitude > 180)) {
    throw new Error("Longitude must be between -180 and 180")
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const updateData: Record<string, unknown> = {
    latitude: data.latitude,
    longitude: data.longitude,
  }
  if (data.elevation !== undefined) updateData.elevation = data.elevation
  if (data.geoAccuracy !== undefined) updateData.geo_accuracy = data.geoAccuracy

  const { error } = await supabase
    .from("heritage_sites")
    .update(updateData)
    .eq("id", siteId)
    .eq("municipality_id", municipalityId)

  if (error) throw new Error(`Failed to update site location: ${error.message}`)
}

/** Build a GeoJSON FeatureCollection from map sites for rendering on the map */
export function buildSiteGeoJSON(sites: MapSite[]): GeoFeatureCollection {
  return {
    type: "FeatureCollection",
    features: sites
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [s.longitude as number, s.latitude as number],
        },
        properties: {
          id: s.id,
          siteName: s.siteName,
          categoryId: s.categoryId,
          categoryName: s.categoryName,
          categoryColor: s.categoryColor ?? "#6366f1",
          barangay: s.barangay,
          publicationStatus: s.publicationStatus,
          shortDescription: s.shortDescription,
          primaryImage: s.primaryImage,
          elevation: s.elevation,
          geoAccuracy: s.geoAccuracy,
        },
      })),
  }
}

/** Replaces any existing boundary for the municipality (UNIQUE municipality_id → upsert). */
export async function upsertMunicipalBoundary(
  municipalityId: string,
  boundaryGeojson: BoundaryGeoJSON,
): Promise<MunicipalBoundary> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("municipal_boundaries")
    .upsert(
      { municipality_id: municipalityId, boundary_geojson: boundaryGeojson },
      { onConflict: "municipality_id" },
    )
    .select("id, municipality_id, boundary_geojson, created_at, updated_at")
    .single()

  if (error) throw new Error(`Failed to save municipal boundary: ${error.message}`)

  return {
    id: data.id as string,
    municipalityId: data.municipality_id as string,
    boundaryGeojson: data.boundary_geojson as BoundaryGeoJSON,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

/** Lightweight status map (no geometry payload) for showing which municipalities already have a boundary uploaded. */
export async function getMunicipalBoundaryStatuses(): Promise<Record<string, string>> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("municipal_boundaries")
    .select("municipality_id, updated_at")

  if (error) throw new Error(`Failed to fetch boundary statuses: ${error.message}`)

  const statuses: Record<string, string> = {}
  for (const row of data ?? []) {
    statuses[row.municipality_id as string] = row.updated_at as string
  }
  return statuses
}

const GOOGLE_MAPS_INTEGRATION_NAME = "Google Maps Platform"

/**
 * Matches by name only, case-insensitively. Category is user-editable free text in the
 * Integrations UI (defaults to "Other"), so filtering on it here would silently break the
 * lookup for anyone who added the row without picking "Maps & Geolocation".
 * `.limit(1)` (rather than `.maybeSingle()` on an unbounded query) keeps a duplicate-named
 * row from throwing a raw Postgrest "multiple rows returned" error instead of resolving.
 */
export async function getGoogleMapsIntegration(): Promise<IntegrationInfo | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("integrations")
    .select("id, name, category, status, api_key_masked, config")
    .ilike("name", GOOGLE_MAPS_INTEGRATION_NAME)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch Google Maps integration: ${error.message}`)

  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    status: data.status as "active" | "inactive" | "error",
    apiKeyMasked: data.api_key_masked,
    config: data.config as Record<string, unknown> | null,
  }
}

/**
 * The `integrations` table only ever stores a masked display value — never the real key.
 * The live key is expected to come from a server-only env var so it's never persisted in the
 * DB or sent to the client.
 */
export function hasGoogleMapsServerApiKey(): boolean {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY)
}
