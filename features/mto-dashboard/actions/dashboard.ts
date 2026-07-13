"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import {
  getMTODashboardStats,
  getMTOVisitsOverview,
  getMTOVisitsByCategory,
  getMTORecentSites,
  getMTORecentActivity,
  getMTOVisitorStats,
  getMTORecentScans,
  getMTOTodayScanCount,
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
