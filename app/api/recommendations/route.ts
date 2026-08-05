import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { ensureSessionId } from "@/lib/session"
import { generateRecommendations } from "@/features/recommendation/services"
import type { UserPreferences } from "@/types/recommendation"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const querySessionId = searchParams.get("session_id")
    const latParam = searchParams.get("latitude")
    const lngParam = searchParams.get("longitude")
    const limitParam = searchParams.get("limit")

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    const sessionId = user ? undefined : (querySessionId ?? await ensureSessionId())

    const preferences: UserPreferences = {
      interests: [],
      preferredCategoryIds: [],
      sessionId,
      homeLatitude: latParam ? Number(latParam) : undefined,
      homeLongitude: lngParam ? Number(lngParam) : undefined,
      limit: limitParam ? Number(limitParam) : 20,
      touristId: null,
    }

    if (user) {
      const { data: profile } = await supabase
        .from("tourist_profiles")
        .select("interests, preferred_category_ids, home_latitude, home_longitude")
        .eq("id", user.id)
        .maybeSingle()

      if (profile) {
        // Only a real tourist_profiles row satisfies recommendations_tourist_id_fkey —
        // a logged-in staff/admin account has no such row and must not be persisted as tourist_id.
        preferences.touristId = user.id
        preferences.interests = (profile.interests as string[]) ?? []
        preferences.preferredCategoryIds = (profile.preferred_category_ids as string[]) ?? []
        if (!preferences.homeLatitude && profile.home_latitude) {
          preferences.homeLatitude = Number(profile.home_latitude)
        }
        if (!preferences.homeLongitude && profile.home_longitude) {
          preferences.homeLongitude = Number(profile.home_longitude)
        }
      }
    }

    const results = await generateRecommendations(supabase, preferences)

    return NextResponse.json({ data: results })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
