import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { generateRecommendations } from "@/features/recommendation/services"
import type { UserPreferences } from "@/types/recommendation"
import TouristRecommendationsClient from "./tourist-recommendations-client"

export default async function TouristRecommendationsPage() {
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

  const results = await generateRecommendations(supabase, preferences)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Recommendations</h1>
        <p className="text-sm text-muted-foreground mt-1">Personalized suggestions based on your interests.</p>
      </div>
      <TouristRecommendationsClient initialResults={results} />
    </div>
  )
}
