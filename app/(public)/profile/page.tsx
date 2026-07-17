import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getProfileAction, getRecommendationHistoryAction } from "@/features/profile/actions"
import { getHeritageCategoriesAction } from "@/features/onboarding/actions"
import { getBookmarkedSitesAction } from "@/features/heritage/actions/bookmark"
import ProfileClient from "@/features/profile/components/profile-client"

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const [profile, categories, savedSites, recommendationHistory] = await Promise.all([
    getProfileAction(user.id),
    getHeritageCategoriesAction(),
    getBookmarkedSitesAction(),
    getRecommendationHistoryAction(user.id),
  ])

  return (
    <ProfileClient
      userId={user.id}
      profile={profile}
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description ?? null,
        icon: c.icon ?? null,
        color: c.color ?? null,
      }))}
      savedSites={savedSites}
      recommendationHistory={recommendationHistory}
    />
  )
}
