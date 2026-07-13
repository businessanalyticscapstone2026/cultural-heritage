"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import type { GisConfig } from "./types"

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
