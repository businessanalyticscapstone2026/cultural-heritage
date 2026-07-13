"use server"

import {
  resolvePtcaoAdmin,
  getProvinceSummary,
  getVisitorTrend,
  getVisitsByMunicipality,
  getDemographics,
  getTopCategories,
  getTopSites,
  getRecommendationPerformance,
} from "../services"
import { parseFiltersFromSearchParams } from "../utils"
import type { TrendGranularity, AnalyticsFilters } from "../types"

function parseFilters(sp: Record<string, string | undefined>): AnalyticsFilters {
  return parseFiltersFromSearchParams(sp)
}

export async function getProvinceSummaryAction(
  searchParams: Record<string, string | undefined>
) {
  await resolvePtcaoAdmin()
  const filters = parseFilters(searchParams)
  return getProvinceSummary(filters)
}

export async function getVisitorTrendAction(
  searchParams: Record<string, string | undefined>,
  granularity: TrendGranularity
) {
  await resolvePtcaoAdmin()
  const filters = parseFilters(searchParams)
  return getVisitorTrend(filters, granularity)
}

export async function getVisitsByMunicipalityAction(
  searchParams: Record<string, string | undefined>
) {
  await resolvePtcaoAdmin()
  const filters = parseFilters(searchParams)
  return getVisitsByMunicipality(filters)
}

export async function getDemographicsAction(
  searchParams: Record<string, string | undefined>
) {
  await resolvePtcaoAdmin()
  const filters = parseFilters(searchParams)
  return getDemographics(filters)
}

export async function getTopCategoriesAction(
  searchParams: Record<string, string | undefined>
) {
  await resolvePtcaoAdmin()
  const filters = parseFilters(searchParams)
  return getTopCategories(filters)
}

export async function getTopSitesAction(
  searchParams: Record<string, string | undefined>
) {
  await resolvePtcaoAdmin()
  const filters = parseFilters(searchParams)
  return getTopSites(filters)
}

export async function getRecommendationPerformanceAction(
  searchParams: Record<string, string | undefined>
) {
  await resolvePtcaoAdmin()
  const filters = parseFilters(searchParams)
  return getRecommendationPerformance(filters)
}
