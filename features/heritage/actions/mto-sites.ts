"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { CACHE_TAGS, CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"
import { cookies } from "next/headers"
import {
  getMtoSiteKpiCounts,
  getMtoSites,
  getMtoSiteById,
  createMtoSite,
  updateMtoSite,
  archiveMtoSite,
  restoreMtoSite,
  getCurrentStaffProfile,
} from "../services/mto-sites"
import type { SiteWithDetails } from "../services/mto-sites"
import { mtoHeritageSiteSchema } from "../schemas/mto-heritage-site"

async function getAuthContext() {
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

  return { staffProfileId: profile.id, municipalityId: profile.municipality_id, profile }
}

/** Fetch KPI counts for dashboard — feeds the 4 KPI cards */
export async function getMtoKpiCountsAction() {
  const { municipalityId } = await getAuthContext()
  return getMtoSiteKpiCounts(municipalityId)
}

/** Fetch all sites for the MTO — feeds the main table */
export async function getMtoSitesAction(): Promise<SiteWithDetails[]> {
  const { municipalityId } = await getAuthContext()
  return getMtoSites(municipalityId)
}

/** Fetch a single site by ID — feeds the slide-in panel and edit form */
export async function getMtoSiteByIdAction(siteId: string): Promise<SiteWithDetails | null> {
  const { municipalityId } = await getAuthContext()
  return getMtoSiteById(siteId, municipalityId)
}

/** Create a new heritage site — server-side scoped to MTO's municipality */
export async function createMtoSiteAction(formData: FormData) {
  const { municipalityId, staffProfileId } = await getAuthContext()

  const raw: {
    siteName: string; alternativeName?: string | null; categoryId?: string | null;
    barangay?: string | null; exactAddress?: string | null; shortDescription?: string | null;
    detailedDescription?: string | null; yearEstablished?: string | null;
    architecturalStyle?: string | null; historicalSignificance?: string | null;
    culturalSignificance?: string | null; latitude?: number | null; longitude?: number | null;
    elevation?: number | null; geoAccuracy?: string | null; publicationStatus?: string;
    isFeatured?: boolean;
  } = {
    siteName: formData.get("siteName") as string,
    alternativeName: formData.get("alternativeName") as string | null,
    categoryId: formData.get("categoryId") as string | null,
    barangay: formData.get("barangay") as string | null,
    exactAddress: formData.get("exactAddress") as string | null,
    shortDescription: formData.get("shortDescription") as string | null,
    detailedDescription: formData.get("detailedDescription") as string | null,
    yearEstablished: formData.get("yearEstablished") as string | null,
    architecturalStyle: formData.get("architecturalStyle") as string | null,
    historicalSignificance: formData.get("historicalSignificance") as string | null,
    culturalSignificance: formData.get("culturalSignificance") as string | null,
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
    elevation: formData.get("elevation") ? Number(formData.get("elevation")) : null,
    geoAccuracy: formData.get("geoAccuracy") as string | null,
    publicationStatus: (formData.get("publicationStatus") as string) ?? "draft",
    isFeatured: formData.get("isFeatured") === "true",
  }

  let tags: { tag: string }[] = []
  const tagsRaw = formData.get("tags")
  if (tagsRaw) {
    try {
      tags = JSON.parse(tagsRaw as string)
    } catch {}
  }

  let referenceLinks: { url: string; label?: string | null }[] = []
  const linksRaw = formData.get("referenceLinks")
  if (linksRaw) {
    try {
      referenceLinks = JSON.parse(linksRaw as string)
    } catch {}
  }

  const site = await createMtoSite(
    { ...raw, tags, referenceLinks, municipalityId },
    staffProfileId,
  )

  revalidatePath("/mto/heritage-sites")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })
  return site
}

/** Update an existing heritage site */
export async function updateMtoSiteAction(siteId: string, formData: FormData) {
  const { municipalityId } = await getAuthContext()

  const raw: Record<string, unknown> = {}
  const fields = [
    "siteName", "alternativeName", "categoryId", "barangay", "exactAddress",
    "shortDescription", "detailedDescription", "yearEstablished", "architecturalStyle",
    "historicalSignificance", "culturalSignificance", "geoAccuracy", "publicationStatus",
  ]

  for (const field of fields) {
    const val = formData.get(field)
    if (val !== null) raw[field] = val
  }

  const lat = formData.get("latitude")
  const lng = formData.get("longitude")
  const elev = formData.get("elevation")
  if (lat !== null) raw.latitude = Number(lat)
  if (lng !== null) raw.longitude = Number(lng)
  if (elev !== null) raw.elevation = Number(elev)

  raw.isFeatured = formData.get("isFeatured") === "true"

  let tags: { id?: string; tag: string }[] | undefined
  const tagsRaw = formData.get("tags")
  if (tagsRaw !== null) {
    try {
      tags = JSON.parse(tagsRaw as string)
    } catch {
      tags = []
    }
  }

  let referenceLinks: { id?: string; url: string; label?: string | null }[] | undefined
  const linksRaw = formData.get("referenceLinks")
  if (linksRaw !== null) {
    try {
      referenceLinks = JSON.parse(linksRaw as string)
    } catch {
      referenceLinks = []
    }
  }

  const site = await updateMtoSite(siteId, municipalityId, {
    ...raw,
    tags,
    referenceLinks,
  } as Parameters<typeof updateMtoSite>[2])

  revalidatePath("/mto/heritage-sites")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })
  return site
}

/** Create or update a site using JSON payload (for client-side fetch calls) */
export async function saveMtoSiteAction(json: string) {
  const { municipalityId, staffProfileId } = await getAuthContext()

  const parsed = JSON.parse(json)
  const siteData = parsed.id ? { ...parsed, id: undefined } : parsed
  const validated = mtoHeritageSiteSchema.parse(siteData)

  if (validated.publicationStatus === "archived") {
    throw new Error("Cannot create/update a site with 'archived' status via this action. Use archiveMtoSiteAction instead.")
  }

  const tags = parsed.tags ?? []
  const referenceLinks = parsed.referenceLinks ?? []

  if (parsed.id) {
    return updateMtoSite(parsed.id, municipalityId, {
      ...validated,
      tags,
      referenceLinks,
    })
  }

  return createMtoSite(
    { ...validated, municipalityId, tags, referenceLinks },
    staffProfileId,
  )
}

/** Archive (soft-delete) a site — uses publication_status change */
export async function archiveMtoSiteAction(siteId: string) {
  const { municipalityId } = await getAuthContext()
  await archiveMtoSite(siteId, municipalityId)
  revalidatePath("/mto/heritage-sites")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })
}

/** Restore an archived site back to draft */
export async function restoreMtoSiteAction(siteId: string) {
  const { municipalityId } = await getAuthContext()
  await restoreMtoSite(siteId, municipalityId)
  revalidatePath("/mto/heritage-sites")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })
}

/** Get the current staff profile */
export async function getMtoStaffProfileAction() {
  return getCurrentStaffProfile()
}
