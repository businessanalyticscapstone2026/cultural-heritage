"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { ensureSessionId } from "@/lib/session"
import { generateRecommendations } from "../services"
import type { RecommendationResult, UserPreferences } from "@/types/recommendation"

export async function getRecommendationsAction(
  preferences: UserPreferences,
): Promise<RecommendationResult[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  const prefs: UserPreferences = {
    ...preferences,
    sessionId: preferences.sessionId ?? (user ? undefined : await ensureSessionId()),
    touristId: null,
  }

  if (user) {
    const { data: profile } = await supabase
      .from("tourist_profiles")
      .select("interests, preferred_category_ids, home_latitude, home_longitude, travel_style, group_type, accessibility_needs")
      .eq("id", user.id)
      .maybeSingle()

    if (profile) {
      // Only a real tourist_profiles row satisfies recommendations_tourist_id_fkey —
      // a logged-in staff/admin account has no such row and must not be persisted as tourist_id.
      prefs.touristId = user.id
      prefs.interests = (profile.interests as string[]) ?? preferences.interests ?? []
      prefs.preferredCategoryIds = (profile.preferred_category_ids as string[]) ?? preferences.preferredCategoryIds ?? []
      if (!preferences.homeLatitude && profile.home_latitude) {
        prefs.homeLatitude = Number(profile.home_latitude)
      }
      if (!preferences.homeLongitude && profile.home_longitude) {
        prefs.homeLongitude = Number(profile.home_longitude)
      }
      if (!preferences.travelStyle && profile.travel_style) {
        prefs.travelStyle = profile.travel_style as string
      }
      if (!preferences.groupType && profile.group_type) {
        prefs.groupType = profile.group_type as string
      }
      if (!preferences.accessibilityNeeds?.length && profile.accessibility_needs) {
        prefs.accessibilityNeeds = (profile.accessibility_needs as string[]) ?? []
      }
    }
  }

  const results = await generateRecommendations(supabase, prefs)

  return results
}
