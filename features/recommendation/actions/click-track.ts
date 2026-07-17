"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

export async function trackRecommendationClickAction(recommendationId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("recommendations")
    .update({ was_clicked: true, clicked_at: new Date().toISOString() })
    .eq("id", recommendationId)

  if (error) {
    console.error("Failed to mark recommendation clicked:", error.message)
  }
}
