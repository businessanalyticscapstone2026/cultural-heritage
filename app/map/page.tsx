import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { getTouristMapSites, getTouristMapCategories } from "@/features/gis/services/tourist-map"
import { TouristMapClient } from "./tourist-map-client"

interface MapPageProps {
  searchParams: Promise<{ site?: string }>
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const sp = await searchParams
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
    <TouristMapClient
      sites={sites}
      categories={categories}
      user={user}
      homeLatitude={homeLatitude}
      homeLongitude={homeLongitude}
      initialSiteId={sp.site ?? null}
    />
  )
}
