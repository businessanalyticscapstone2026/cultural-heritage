"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
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
    sessionId: preferences.sessionId ?? (user ? undefined : crypto.randomUUID()),
    touristId: user?.id ?? null,
  }

  if (user) {
    const { data: profile } = await supabase
      .from("tourist_profiles")
      .select("interests, preferred_category_ids, home_latitude, home_longitude")
      .eq("id", user.id)
      .maybeSingle()

    if (profile) {
      prefs.interests = (profile.interests as string[]) ?? preferences.interests ?? []
      prefs.preferredCategoryIds = (profile.preferred_category_ids as string[]) ?? preferences.preferredCategoryIds ?? []
      if (!preferences.homeLatitude && profile.home_latitude) {
        prefs.homeLatitude = Number(profile.home_latitude)
      }
      if (!preferences.homeLongitude && profile.home_longitude) {
        prefs.homeLongitude = Number(profile.home_longitude)
      }
    }
  }

  const results = await generateRecommendations(supabase, prefs)

  return results
}
