"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

export async function saveOnboardingStep1Action(userId: string, preferredCategoryIds: string[]) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("tourist_profiles")
    .update({ preferred_category_ids: preferredCategoryIds })
    .eq("id", userId)

  if (error) throw new Error(error.message)
}

export async function saveOnboardingStep2Action(
  userId: string,
  homeLatitude: number | null,
  homeLongitude: number | null,
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("tourist_profiles")
    .update({ home_latitude: homeLatitude, home_longitude: homeLongitude })
    .eq("id", userId)

  if (error) throw new Error(error.message)
}

export async function saveOnboardingStep3Action(userId: string, interests: string[]) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("tourist_profiles")
    .update({ interests })
    .eq("id", userId)

  if (error) throw new Error(error.message)
}

export async function saveOnboardingStepTravelAction(
  userId: string,
  travelStyle: string | null,
  groupType: string | null,
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("tourist_profiles")
    .update({ travel_style: travelStyle, group_type: groupType })
    .eq("id", userId)

  if (error) throw new Error(error.message)
}

export async function saveOnboardingStepAccessibilityAction(
  userId: string,
  accessibilityNeeds: string[],
  interests: string[],
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("tourist_profiles")
    .update({ accessibility_needs: accessibilityNeeds, interests })
    .eq("id", userId)

  if (error) throw new Error(error.message)
}

export async function completeOnboardingAction(userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const now = new Date().toISOString()
  const { error } = await supabase
    .from("tourist_profiles")
    .update({ onboarding_completed_at: now })
    .eq("id", userId)

  if (error) throw new Error(error.message)
}

export async function getHeritageCategoriesAction() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_categories")
    .select("id, name, description, icon, color, display_order")
    .eq("status", "active")
    .order("display_order", { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function getOnboardingStatusAction(userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("tourist_profiles")
    .select("onboarding_completed_at, preferred_category_ids, home_latitude, home_longitude, interests, travel_style, group_type, accessibility_needs")
    .eq("id", userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return {
    completed: data?.onboarding_completed_at != null,
    preferredCategoryIds: (data?.preferred_category_ids as string[]) ?? [],
    homeLatitude: data?.home_latitude ? Number(data.home_latitude) : null,
    homeLongitude: data?.home_longitude ? Number(data.home_longitude) : null,
    interests: (data?.interests as string[]) ?? [],
    travelStyle: (data?.travel_style as string) ?? null,
    groupType: (data?.group_type as string) ?? null,
    accessibilityNeeds: (data?.accessibility_needs as string[]) ?? [],
  }
}
