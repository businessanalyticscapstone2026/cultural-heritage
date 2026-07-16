import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { getRecommendationsAction } from "@/features/recommendation/actions"
import type { UserPreferences } from "@/types/recommendation"
import RecommendationsClient from "./recommendations-client"

export default async function RecommendationsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  const preferences: UserPreferences = {
    interests: [],
    preferredCategoryIds: [],
    limit: 20,
    touristId: user?.id ?? null,
  }

  if (user) {
    const { data: profile } = await supabase
      .from("tourist_profiles")
      .select("interests, preferred_category_ids, home_latitude, home_longitude")
      .eq("id", user.id)
      .maybeSingle()

    if (profile) {
      preferences.interests = (profile.interests as string[]) ?? []
      preferences.preferredCategoryIds = (profile.preferred_category_ids as string[]) ?? []
      if (profile.home_latitude) preferences.homeLatitude = Number(profile.home_latitude)
      if (profile.home_longitude) preferences.homeLongitude = Number(profile.home_longitude)
    }
  }

  const results = await getRecommendationsAction(preferences)

  return <RecommendationsClient initialResults={results} />
}
