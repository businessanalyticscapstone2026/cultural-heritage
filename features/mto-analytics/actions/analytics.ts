"use server"

import {
  resolveMunicipalityId,
  getSummaryMetrics,
  getVisitorTrend,
  getVisitsByAttraction,
  getDemographics,
  getTopSites,
  getRecommendationPerformance,
} from "../services"
import { parseMTOFiltersFromSearchParams } from "../utils"
import type { TrendGranularity, MTOAnalyticsFilters } from "../types"

function parseFilters(sp: Record<string, string | undefined>): MTOAnalyticsFilters {
  return parseMTOFiltersFromSearchParams(sp)
}

export async function getSummaryMetricsAction(
  searchParams: Record<string, string | undefined>
) {
  const municipalityId = await resolveMunicipalityId()
  const filters = parseFilters(searchParams)
  return getSummaryMetrics(municipalityId, filters)
}

export async function getVisitorTrendAction(
  searchParams: Record<string, string | undefined>,
  granularity: TrendGranularity
) {
  const municipalityId = await resolveMunicipalityId()
  const filters = parseFilters(searchParams)
  return getVisitorTrend(municipalityId, filters, granularity)
}

export async function getVisitsByAttractionAction(
  searchParams: Record<string, string | undefined>
) {
  const municipalityId = await resolveMunicipalityId()
  const filters = parseFilters(searchParams)
  return getVisitsByAttraction(municipalityId, filters)
}

export async function getDemographicsAction(
  searchParams: Record<string, string | undefined>
) {
  const municipalityId = await resolveMunicipalityId()
  const filters = parseFilters(searchParams)
  return getDemographics(municipalityId, filters)
}

export async function getTopSitesAction(
  searchParams: Record<string, string | undefined>
) {
  const municipalityId = await resolveMunicipalityId()
  const filters = parseFilters(searchParams)
  return getTopSites(municipalityId, filters)
}

export async function getRecommendationPerformanceAction(
  searchParams: Record<string, string | undefined>
) {
  const municipalityId = await resolveMunicipalityId()
  const filters = parseFilters(searchParams)
  return getRecommendationPerformance(municipalityId, filters)
}
