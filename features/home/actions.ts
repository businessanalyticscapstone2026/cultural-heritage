"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { getTouristHomePageData } from "@/features/home/services/home-page"

/** Full homepage payload for Server Components and client revalidation. */
export async function getHomePageDataAction() {
  return getTouristHomePageData()
}

export async function getUserProfileAction(userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from("tourist_profiles")
    .select("first_name, onboarding_completed_at")
    .eq("id", userId)
    .maybeSingle()

  return {
    firstName: data?.first_name ?? null,
    onboarded: data?.onboarding_completed_at != null,
  }
}
