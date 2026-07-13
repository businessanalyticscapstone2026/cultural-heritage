import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type { GeoFeatureCollection, MapViewport, GisConfig, HeritageCategoryWithStatus, IntegrationInfo } from "../types"

export async function getHeritageGeoJSON(): Promise<GeoFeatureCollection> {
  return { type: "FeatureCollection", features: [] }
}

export async function getMunicipalityBoundaries(): Promise<GeoFeatureCollection> {
  return { type: "FeatureCollection", features: [] }
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

export async function getGoogleMapsIntegration(): Promise<IntegrationInfo | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("integrations")
    .select("id, name, status, api_key_masked, config")
    .eq("name", "Google Maps Platform")
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch Google Maps integration: ${error.message}`)

  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    status: data.status as "active" | "inactive" | "error",
    apiKeyMasked: data.api_key_masked,
    config: data.config as Record<string, unknown> | null,
  }
}
