"use server"

import { revalidatePath, revalidateTag } from "next/cache"
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
