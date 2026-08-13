"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type { DashboardData } from "@/types/mto-dashboard"
import {
  getMTODashboardStats,
  getMTOVisitsOverview,
  getMTOVisitsByCategory,
  getMTORecentSites,
  getMTORecentActivity,
  getMTOVisitorStats,
  getMTORecentScans,
  getMTOTodayScanCount,
  getMTOTopAttractions,
  getMTOScanDeviceBreakdown,
  getMTOCategoryDistribution,
  getMTOSitesForMunicipality,
  deriveMTODashboardInsights,
} from "../services"

async function resolveMunicipalityId(): Promise<string> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("municipality_id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.municipality_id) throw new Error("No municipality assigned to this account")

  return profile.municipality_id as string
}

export async function getDashboardStatsAction() {
  const municipalityId = await resolveMunicipalityId()
  return getMTODashboardStats(municipalityId)
}

export async function getVisitsOverviewAction() {
  const municipalityId = await resolveMunicipalityId()
  return getMTOVisitsOverview(municipalityId)
}

export async function getVisitsByCategoryAction() {
  const municipalityId = await resolveMunicipalityId()
  return getMTOVisitsByCategory(municipalityId)
}

export async function getRecentSitesAction() {
  const municipalityId = await resolveMunicipalityId()
  return getMTORecentSites(municipalityId)
}

export async function getRecentActivityAction() {
  const municipalityId = await resolveMunicipalityId()
  return getMTORecentActivity(municipalityId)
}

export async function getVisitorStatsAction() {
  const municipalityId = await resolveMunicipalityId()
  return getMTOVisitorStats(municipalityId)
}

export async function getRecentScansAction() {
  const municipalityId = await resolveMunicipalityId()
  return getMTORecentScans(municipalityId)
}

export async function getTodayScanCountAction() {
  const municipalityId = await resolveMunicipalityId()
  return getMTOTodayScanCount(municipalityId)
}

export async function getResolvedMunicipalityId(): Promise<string> {
  return resolveMunicipalityId()
}

export async function getAllDashboardDataAction(
  municipalityId: string
): Promise<DashboardData> {
  // Widgets on the dashboard only need site ids/categories, never recent
  // activity or today's scan count (no widget renders those) — resolve the
  // shared site list once instead of re-querying heritage_sites in every
  // service function below.
  const { siteIds, sites } = await getMTOSitesForMunicipality(municipalityId)

  const [stats, visitsOverview, visitsByCategory, recentSites, visitorStats, recentScans, topAttractions, scanDeviceBreakdown, categoryDistribution] =
    await Promise.all([
      getMTODashboardStats(municipalityId, siteIds),
      getMTOVisitsOverview(municipalityId),
      getMTOVisitsByCategory(municipalityId, sites),
      getMTORecentSites(municipalityId),
      getMTOVisitorStats(municipalityId, siteIds),
      getMTORecentScans(municipalityId),
      getMTOTopAttractions(municipalityId, 5, siteIds),
      getMTOScanDeviceBreakdown(municipalityId, siteIds),
      getMTOCategoryDistribution(municipalityId, sites),
    ])

  const insights = deriveMTODashboardInsights({
    stats,
    visitsOverview,
    topAttractions,
    categoryDistribution,
    scanDeviceBreakdown,
    visitorStats,
  })

  return {
    stats,
    visitsOverview,
    visitsByCategory,
    recentSites,
    visitorStats,
    recentScans,
    topAttractions,
    scanDeviceBreakdown,
    categoryDistribution,
    insights,
  }
}
