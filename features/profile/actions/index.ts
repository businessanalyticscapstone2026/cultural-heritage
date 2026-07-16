"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

export async function getProfileAction(userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: authUser } = await supabase.auth.getUser()
  if (!authUser.user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("tourist_profiles")
    .select("first_name, last_name, home_latitude, home_longitude, interests, preferred_category_ids, onboarding_completed_at")
    .eq("id", userId)
    .maybeSingle()

  if (error) throw new Error(error.message)

  return {
    firstName: data?.first_name ?? null,
    lastName: data?.last_name ?? null,
    email: authUser.user.email ?? null,
    homeLatitude: data?.home_latitude ? Number(data.home_latitude) : null,
    homeLongitude: data?.home_longitude ? Number(data.home_longitude) : null,
    interests: (data?.interests as string[]) ?? [],
    preferredCategoryIds: (data?.preferred_category_ids as string[]) ?? [],
    onboarded: data?.onboarding_completed_at != null,
  }
}

export async function updateProfileAction(
  userId: string,
  data: {
    firstName?: string
    lastName?: string
    homeLatitude?: number | null
    homeLongitude?: number | null
    interests?: string[]
  },
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const updates: Record<string, unknown> = {}
  if (data.firstName !== undefined) updates.first_name = data.firstName
  if (data.lastName !== undefined) updates.last_name = data.lastName
  if (data.homeLatitude !== undefined) updates.home_latitude = data.homeLatitude
  if (data.homeLongitude !== undefined) updates.home_longitude = data.homeLongitude
  if (data.interests !== undefined) updates.interests = data.interests

  if (Object.keys(updates).length === 0) return

  const { error } = await supabase
    .from("tourist_profiles")
    .update(updates)
    .eq("id", userId)

  if (error) throw new Error(error.message)
}
