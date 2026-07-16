import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { getTouristMapSites, getTouristMapCategories } from "@/features/gis/services/tourist-map"
import { TouristMapClient } from "@/app/map/tourist-map-client"

export default async function HomeMapPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  let homeLatitude: number | null = null
  let homeLongitude: number | null = null

  if (user) {
    const { data: profile } = await supabase
      .from("tourist_profiles")
      .select("home_latitude, home_longitude")
      .eq("id", user.id)
      .maybeSingle()

    homeLatitude = profile?.home_latitude ?? null
    homeLongitude = profile?.home_longitude ?? null
  }

  const [sites, categories] = await Promise.all([
    getTouristMapSites(),
    getTouristMapCategories(),
  ])

  return (
    <div className="fixed inset-x-0 bottom-0 top-16">
      <TouristMapClient
        sites={sites}
        categories={categories}
        user={user}
        homeLatitude={homeLatitude}
        homeLongitude={homeLongitude}
      />
    </div>
  )
}
