"use server"

import { revalidateTag } from "next/cache"
import { CACHE_TAGS, CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"
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
  const result = await logRecommendationEvent(municipalityId, payload)
  revalidateTag(CACHE_TAGS.dashboardRecommendations, { expire: CACHE_REVALIDATE_SECONDS })
  return result
}

export async function markRecommendationClickedAction(
  recommendationId: string
) {
  const result = await markRecommendationClicked(recommendationId)
  revalidateTag(CACHE_TAGS.dashboardRecommendations, { expire: CACHE_REVALIDATE_SECONDS })
  return result
}

export async function markRecommendationConvertedAction(
  recommendationId: string,
  type: "route" | "bookmark"
) {
  const result = await markRecommendationConverted(recommendationId, type)
  revalidateTag(CACHE_TAGS.dashboardRecommendations, { expire: CACHE_REVALIDATE_SECONDS })
  return result
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
