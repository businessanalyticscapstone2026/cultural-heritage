"use server"

import {
  resolveMunicipalityId,
  logRecommendationEvent,
  markRecommendationClicked,
  markRecommendationConverted,
  getRecommendationFunnel,
  getRecommendationSiteSummaries,
  getUnderPromotedRecommendations,
  getSiteRecommendationDetail,
} from "../services"
import type { LogRecommendationEventPayload, RecommendationMonitoringFilters } from "../types"

export async function logRecommendationEventAction(
  payload: LogRecommendationEventPayload
) {
  const municipalityId = await resolveMunicipalityId()
  return logRecommendationEvent(municipalityId, payload)
}

export async function markRecommendationClickedAction(
  recommendationId: string
) {
  return markRecommendationClicked(recommendationId)
}

export async function markRecommendationConvertedAction(
  recommendationId: string,
  type: "route" | "bookmark"
) {
  return markRecommendationConverted(recommendationId, type)
}

export async function getRecommendationFunnelAction(
  filters: RecommendationMonitoringFilters
) {
  const municipalityId = await resolveMunicipalityId()
  return getRecommendationFunnel(municipalityId, filters)
}

export async function getRecommendationSiteSummariesAction(
  filters: RecommendationMonitoringFilters
) {
  const municipalityId = await resolveMunicipalityId()
  return getRecommendationSiteSummaries(municipalityId, filters)
}

export async function getUnderPromotedRecommendationsAction(
  filters: RecommendationMonitoringFilters
) {
  const municipalityId = await resolveMunicipalityId()
  return getUnderPromotedRecommendations(municipalityId, filters)
}

export async function getSiteRecommendationDetailAction(
  siteId: string,
  filters: RecommendationMonitoringFilters
) {
  const municipalityId = await resolveMunicipalityId()
  return getSiteRecommendationDetail(municipalityId, siteId, filters)
}
