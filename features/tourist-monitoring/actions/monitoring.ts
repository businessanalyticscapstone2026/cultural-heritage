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
} from "../services"
import { parseMonitoringFilters } from "../utils"

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
