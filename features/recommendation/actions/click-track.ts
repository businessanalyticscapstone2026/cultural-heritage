"use server"

import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { CACHE_TAGS, CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"
import { DEFAULT_AGE_GROUP } from "@/lib/constants"

export async function trackRecommendationClickAction(recommendationId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: rec } = await supabase
    .from("recommendations")
    .select("site_id, tourist_id")
    .eq("id", recommendationId)
    .maybeSingle()

  const { error } = await supabase
    .from("recommendations")
    .update({ was_clicked: true, clicked_at: new Date().toISOString() })
    .eq("id", recommendationId)

  if (error) {
    console.error("Failed to mark recommendation clicked:", error.message)
  }

  // Also log to tourist_visits so site visit metrics reflect real tourist interactions
  if (rec?.site_id) {
    const today = new Date().toISOString().slice(0, 10)
    try {
      let ageGroup: string = DEFAULT_AGE_GROUP
      if (rec.tourist_id) {
        const { data: profile } = await supabase
          .from("tourist_profiles")
          .select("age_group")
          .eq("id", rec.tourist_id)
          .maybeSingle()
        ageGroup = profile?.age_group ?? DEFAULT_AGE_GROUP
      }

      await supabase.from("tourist_visits").insert({
        site_id: rec.site_id,
        visit_date: today,
        visitor_origin: "domestic",
        visitor_type: "domestic",
        source: "recommendation",
        tourist_id: rec.tourist_id ?? null,
        age_group: ageGroup,
      })
    } catch {
      // Non-blocking
    }
  }

  revalidateTag(CACHE_TAGS.dashboardRecommendations, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardVisits, { expire: CACHE_REVALIDATE_SECONDS })
}
