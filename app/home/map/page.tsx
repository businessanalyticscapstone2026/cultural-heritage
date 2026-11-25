import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { getTouristMapSites, getTouristMapCategories, getCuratedTrails } from "@/features/gis/services/tourist-map"
import { getMunicipalityBoundaries } from "@/features/gis/services"
import { getMunicipalityOptions } from "@/features/municipalities/services"
import { TouristMapClient } from "@/app/map/tourist-map-client"

interface HomeMapPageProps {
  searchParams: Promise<{ site?: string }>
}

export default async function HomeMapPage({ searchParams }: HomeMapPageProps) {
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

  const [sites, categories, curatedTrails, municipalities, boundaries] = await Promise.all([
    getTouristMapSites(),
    getTouristMapCategories(),
    getCuratedTrails(),
    getMunicipalityOptions(),
    getMunicipalityBoundaries(),
  ])

  return (
    <div className="fixed inset-x-0 bottom-0 top-16">
      <TouristMapClient
        sites={sites}
        categories={categories}
        curatedTrails={curatedTrails}
        municipalities={municipalities}
        boundaries={boundaries}
        user={user}
        homeLatitude={homeLatitude}
        homeLongitude={homeLongitude}
        initialSiteId={sp.site ?? null}
      />
    </div>
  )
}
