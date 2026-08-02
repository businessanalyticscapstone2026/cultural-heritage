"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { autoGenerateQrForSite } from "@/features/qr-code/services/qr-management"
import { CACHE_TAGS, CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"
import {
  createHeritageSite,
  updateHeritageSite,
  deleteHeritageSite,
  getAllHeritageSites,
  getHeritageSiteByIdAdmin,
  getHeritageSitesByMunicipality,
  getArchivedSites,
  getArchivedSitesByMunicipality,
  getHeritageSiteVersions,
  restoreHeritageSiteVersion,
} from "../services"
import type { HeritageSite } from "../types"

export async function getHeritageSitesAction() {
  return getAllHeritageSites()
}

export async function getHeritageSiteByIdAction(id: string) {
  return getHeritageSiteByIdAdmin(id)
}

export async function getHeritageSitesByMunicipalityAction(municipalityId: string) {
  return getHeritageSitesByMunicipality(municipalityId)
}

export async function getArchivedSitesAction() {
  return getArchivedSites()
}

export async function getArchivedSitesByMunicipalityAction(municipalityId: string) {
  return getArchivedSitesByMunicipality(municipalityId)
}

export async function createHeritageSiteAction(data: Partial<HeritageSite>) {
  const site = await createHeritageSite(data)
  revalidatePath("/admin/heritage-repository")
  revalidatePath("/mto/heritage-sites")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    try {
      await autoGenerateQrForSite(site.id, user.id)
      revalidatePath("/mto/qr-codes")
    } catch (err) {
      console.error(`Failed to auto-generate QR code for site ${site.id}:`, err)
    }
  }

  return site
}

export async function updateHeritageSiteAction(id: string, updates: Partial<HeritageSite>) {
  const site = await updateHeritageSite(id, updates)
  revalidatePath("/admin/heritage-repository")
  revalidatePath("/mto/heritage-sites")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })
  return site
}

export async function deleteHeritageSiteAction(id: string) {
  await deleteHeritageSite(id)
  revalidatePath("/admin/heritage-repository")
  revalidatePath("/mto/heritage-sites")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })
}

export async function getHeritageSiteVersionsAction(siteId: string) {
  return getHeritageSiteVersions(siteId)
}

export async function restoreHeritageSiteVersionAction(versionId: string) {
  const site = await restoreHeritageSiteVersion(versionId)
  revalidatePath("/admin/heritage-repository")
  revalidatePath("/mto/heritage-sites")
  revalidateTag(CACHE_TAGS.heritageSites, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardSites, { expire: CACHE_REVALIDATE_SECONDS })
  return site
}
