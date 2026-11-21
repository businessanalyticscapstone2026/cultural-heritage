"use server"

import {
  resolveMTOUserId,
  getMonitoringSummary,
  getActivityLog,
  getSitePopularity,
  getMTORecommendationPerformance,
  getUnderPromotedSites,
  getMonitoringSites,
  getMonitoringCategories,
  getTouristMonitoringBundle,
} from "../services"
import { parseMonitoringFilters } from "../utils"
import type { TouristMonitoringBundle } from "../types"

export async function getTouristMonitoringBundleAction(
  searchParams: Record<string, string | undefined>
): Promise<TouristMonitoringBundle> {
  const { municipalityId } = await resolveMTOUserId()
  const filters = parseMonitoringFilters(searchParams)
  return getTouristMonitoringBundle(municipalityId, filters)
}

export async function getMonitoringSummaryAction(
  searchParams: Record<string, string | undefined>
) {
  const { municipalityId } = await resolveMTOUserId()
  const filters = parseMonitoringFilters(searchParams)
  return getMonitoringSummary(municipalityId, filters)
}

export async function getActivityLogAction(
  searchParams: Record<string, string | undefined>,
  page: number,
  pageSize: number
) {
  const { municipalityId } = await resolveMTOUserId()
  const filters = parseMonitoringFilters(searchParams)
  return getActivityLog(municipalityId, filters, page, pageSize)
}

export async function getSitePopularityAction(
  searchParams: Record<string, string | undefined>
) {
  const { municipalityId } = await resolveMTOUserId()
  const filters = parseMonitoringFilters(searchParams)
  return getSitePopularity(municipalityId, filters)
}

export async function getRecommendationPerformanceAction(
  searchParams: Record<string, string | undefined>
) {
  const { municipalityId } = await resolveMTOUserId()
  const filters = parseMonitoringFilters(searchParams)
  return getMTORecommendationPerformance(municipalityId, filters)
}

export async function getUnderPromotedSitesAction(
  searchParams: Record<string, string | undefined>
) {
  const { municipalityId } = await resolveMTOUserId()
  const filters = parseMonitoringFilters(searchParams)
  return getUnderPromotedSites(municipalityId, filters)
}

export async function getMonitoringSitesAction() {
  const { municipalityId } = await resolveMTOUserId()
  return getMonitoringSites(municipalityId)
}

export async function getMonitoringCategoriesAction() {
  return getMonitoringCategories()
}
