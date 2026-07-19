"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { CACHE_TAGS, CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"
import { z } from "zod"
import type { GisConfig } from "./types"
import { getMtoMapSites, getMtoSiteDetail, updateSiteLocation, buildSiteGeoJSON } from "./services"
import type { MapSite, MapSiteDetail } from "./services"

async function getMtoAuthContext() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("id, municipality_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.municipality_id) {
    throw new Error("MTO staff must be assigned to a municipality")
  }

  return { staffProfileId: profile.id, municipalityId: profile.municipality_id }
}

async function getCurrentConfig(supabase: ReturnType<typeof createClient>) {
  const { data } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "gis_config")
    .maybeSingle()
  return (data?.value as Record<string, unknown>) ?? {}
}

export async function updateVisibleCategories(categoryIds: string[]) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const current = await getCurrentConfig(supabase)
  current.visibleCategoryIds = categoryIds

  const { error } = await supabase
    .from("system_settings")
    .upsert({ key: "gis_config", value: current }, { onConflict: "key" })

  if (error) throw new Error(`Failed to update visible categories: ${error.message}`)
  revalidatePath("/admin/gis-admin")
}

export async function updateBasemapProvider(
  provider: GisConfig["basemapProvider"],
  googleMapsStyle?: string,
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const current = await getCurrentConfig(supabase)
  current.basemapProvider = provider
  if (googleMapsStyle) {
    current.googleMapsStyle = googleMapsStyle
  } else {
    delete current.googleMapsStyle
  }

  const { error } = await supabase
    .from("system_settings")
    .upsert({ key: "gis_config", value: current }, { onConflict: "key" })

  if (error) throw new Error(`Failed to update basemap provider: ${error.message}`)
  revalidatePath("/admin/gis-admin")
}

export async function updateDefaultMapCenter(lat: number, lng: number, zoom: number) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const current = await getCurrentConfig(supabase)
  current.defaultMapCenter = { lat, lng }
  current.defaultZoom = zoom

  const { error } = await supabase
    .from("system_settings")
    .upsert({ key: "gis_config", value: current }, { onConflict: "key" })

  if (error) throw new Error(`Failed to update default map center: ${error.message}`)
  revalidatePath("/admin/gis-admin")
}

const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  elevation: z.number().nullable().optional(),
  geoAccuracy: z.string().max(100).nullable().optional(),
})

/** Feed 1 (map pins): Fetch all sites for MTO's municipality as GeoJSON with category colors */
export async function getMtoMapSitesAction(): Promise<{
  sites: MapSite[]
  geoJSON: ReturnType<typeof buildSiteGeoJSON>
}> {
  const { municipalityId } = await getMtoAuthContext()
  const sites = await getMtoMapSites(municipalityId)
  const geoJSON = buildSiteGeoJSON(sites)
  return { sites, geoJSON }
}

/** Feed 2 (detail panel): Fetch full site detail by ID scoped to MTO's municipality */
export async function getMtoSiteDetailAction(
  siteId: string,
): Promise<MapSiteDetail | null> {
  const { municipalityId } = await getMtoAuthContext()
  return getMtoSiteDetail(siteId, municipalityId)
}

/** Feed 3 (coordinate write): Update a site's coordinates with server-side validation */
export async function updateSiteCoordinatesAction(formData: FormData) {
  const { municipalityId } = await getMtoAuthContext()

  const siteId = formData.get("siteId") as string
  if (!siteId) throw new Error("siteId is required")

  const raw = {
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
    elevation: formData.get("elevation") ? Number(formData.get("elevation")) : null,
    geoAccuracy: formData.get("geoAccuracy") as string | null,
  }

  const validated = coordinatesSchema.parse(raw)

  await updateSiteLocation(siteId, municipalityId, validated)

  revalidatePath("/mto/gis")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })
}

/** Feed 3b (coordinate write via JSON): Update a site's coordinates from a click-on-map interaction */
export async function updateSiteCoordinatesJSON(json: string) {
  const { municipalityId } = await getMtoAuthContext()

  const parsed = JSON.parse(json)
  const siteId = parsed.siteId as string
  if (!siteId) throw new Error("siteId is required")

  const validated = coordinatesSchema.parse({
    latitude: parsed.latitude ?? null,
    longitude: parsed.longitude ?? null,
    elevation: parsed.elevation ?? null,
    geoAccuracy: parsed.geoAccuracy ?? null,
  })

  await updateSiteLocation(siteId, municipalityId, validated)

  revalidatePath("/mto/gis")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })
}
