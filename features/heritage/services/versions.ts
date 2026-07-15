import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type { HeritageSiteVersion, ChangeType } from "../types"

const SITE_SELECT = `
  *,
  category:heritage_categories(*),
  municipality:municipalities(name),
  tags:heritage_site_tags(*),
  media:heritage_site_media(*)
`

export async function createHeritageSiteVersion(
  siteId: string,
  changeType: ChangeType,
  changedBy: string | null,
  snapshot: Record<string, unknown>
): Promise<HeritageSiteVersion> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_site_versions")
    .insert({
      heritage_site_id: siteId,
      snapshot,
      changed_by: changedBy,
      change_type: changeType,
    })
    .select("*")
    .single()

  if (error) throw new Error(`Failed to create version: ${error.message}`)

  return {
    id: data.id as string,
    heritageSiteId: data.heritage_site_id as string,
    snapshot: (data.snapshot as Record<string, unknown>) ?? {},
    changedBy: (data.changed_by as string) ?? null,
    changeType: data.change_type as ChangeType,
    createdAt: data.created_at as string,
  }
}

export async function getHeritageSiteVersions(siteId: string): Promise<HeritageSiteVersion[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_site_versions")
    .select("*")
    .eq("heritage_site_id", siteId)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id as string,
    heritageSiteId: row.heritage_site_id as string,
    snapshot: (row.snapshot as Record<string, unknown>) ?? {},
    changedBy: (row.changed_by as string) ?? null,
    changeType: row.change_type as ChangeType,
    createdAt: row.created_at as string,
  }))
}

export async function restoreHeritageSiteVersion(versionId: string): Promise<import("../types").HeritageSite> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: version, error: versionError } = await supabase
    .from("heritage_site_versions")
    .select("*")
    .eq("id", versionId)
    .single()

  if (versionError || !version) throw new Error("Version not found")

  const snapshot = version.snapshot as Record<string, unknown>
  const siteId = version.heritage_site_id as string

  const updateData: Record<string, unknown> = {}
  const updatableFields = [
    "site_name", "alternative_name", "category_id", "municipality_id",
    "barangay", "exact_address", "short_description", "detailed_description",
    "historical_period", "year_established", "architect_builder", "architectural_style",
    "historical_significance", "cultural_significance", "latitude", "longitude",
    "elevation", "geo_accuracy", "accessibility_info", "operating_hours",
    "entrance_fee", "designation", "publication_status", "is_featured", "visibility",
  ]

  for (const field of updatableFields) {
    if (field in snapshot) {
      updateData[field] = snapshot[field]
    }
  }

  const { error: updateError } = await supabase
    .from("heritage_sites")
    .update(updateData)
    .eq("id", siteId)

  if (updateError) throw new Error(`Failed to restore version: ${updateError.message}`)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: restoredRow } = await supabase
    .from("heritage_sites")
    .select("*")
    .eq("id", siteId)
    .single()

  if (restoredRow) {
    await createHeritageSiteVersion(siteId, "updated", user?.id ?? null, restoredRow)
  }

  const { data: site, error: fetchError } = await supabase
    .from("heritage_sites")
    .select(SITE_SELECT)
    .eq("id", siteId)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!site) throw new Error("Failed to fetch restored site")

  const { mapDbRowToSite } = await import("./sites")
  return mapDbRowToSite(site, site)
}
