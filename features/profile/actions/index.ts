"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import type { RecommendationHistoryItem } from "../types"

export async function getProfileAction(userId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: authUser } = await supabase.auth.getUser()
  if (!authUser.user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("tourist_profiles")
    .select("first_name, last_name, home_latitude, home_longitude, interests, preferred_category_ids, travel_style, group_type, age_group, accessibility_needs, onboarding_completed_at")
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
    travelStyle: (data?.travel_style as string) ?? null,
    groupType: (data?.group_type as string) ?? null,
    ageGroup: (data?.age_group as string) ?? null,
    accessibilityNeeds: (data?.accessibility_needs as string[]) ?? [],
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
    preferredCategoryIds?: string[]
    travelStyle?: string | null
    groupType?: string | null
    ageGroup?: string | null
    accessibilityNeeds?: string[]
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
  if (data.preferredCategoryIds !== undefined) updates.preferred_category_ids = data.preferredCategoryIds
  if (data.travelStyle !== undefined) updates.travel_style = data.travelStyle
  if (data.groupType !== undefined) updates.group_type = data.groupType
  if (data.ageGroup !== undefined) updates.age_group = data.ageGroup
  if (data.accessibilityNeeds !== undefined) updates.accessibility_needs = data.accessibilityNeeds

  if (Object.keys(updates).length === 0) return

  const { error } = await supabase
    .from("tourist_profiles")
    .update(updates)
    .eq("id", userId)

  if (error) throw new Error(error.message)
}

export async function getRecommendationHistoryAction(userId: string): Promise<RecommendationHistoryItem[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("recommendations")
    .select(`
      id,
      site_id,
      score,
      method,
      was_clicked,
      clicked_at,
      bookmarked,
      generated_at,
      site:heritage_sites(
        id,
        site_name,
        municipality:municipalities(name),
        category:heritage_categories(name),
        media:heritage_site_media!inner(file_url, is_primary, media_type)
      )
    `)
    .eq("tourist_id", userId)
    .order("generated_at", { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => {
    const site = row.site as unknown as Record<string, unknown> | null
    const mediaArr = (site?.media ?? []) as { file_url: string; is_primary: boolean; media_type: string }[]
    const primaryImage = mediaArr.find((m) => m.is_primary) ?? mediaArr.find((m) => m.media_type === "image")
    const munArr = site?.municipality as { name: string }[] | null | undefined
    const mun = Array.isArray(munArr) ? munArr[0] : munArr
    const catArr = site?.category as { name: string }[] | null | undefined
    const cat = Array.isArray(catArr) ? catArr[0] : catArr

    return {
      id: row.id as string,
      siteId: row.site_id as string,
      siteName: (site?.site_name as string) ?? "Unknown site",
      municipalityName: mun?.name ?? null,
      categoryName: cat?.name ?? null,
      imageUrl: primaryImage?.file_url ?? null,
      matchScore: Math.round(((row.score as number) ?? 0) * 100),
      reasons: [] as string[],
      method: (row.method as string) ?? null,
      wasClicked: (row.was_clicked as boolean) ?? false,
      clickedAt: (row.clicked_at as string) ?? null,
      bookmarked: (row.bookmarked as boolean) ?? false,
      createdAt: row.generated_at as string,
    }
  })
}
