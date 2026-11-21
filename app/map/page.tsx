import { cookies } from "next/headers"
import { createClient, getAuthenticatedUser } from "@/utils/supabase/server"
import { getTouristMapSites, getTouristMapCategories, getCuratedTrails } from "@/features/gis/services/tourist-map"
import { getMunicipalityBoundaries } from "@/features/gis/services"
import { getMunicipalityOptions } from "@/features/municipalities/services"
import RestrictedGuestPrompt from "@/components/auth/restricted-guest-prompt"
import { TouristMapClient } from "./tourist-map-client"

interface MapPageProps {
  searchParams: Promise<{ site?: string; planRoute?: string }>
}

export default async function MapPage({ searchParams }: MapPageProps) {
  // 1. Kick off cached public map data queries immediately in parallel with auth
  const mapDataPromise = Promise.all([
    getTouristMapSites(),
    getTouristMapCategories(),
    getCuratedTrails(),
    getMunicipalityOptions(),
    getMunicipalityBoundaries(),
  ])

  const [sp, user] = await Promise.all([searchParams, getAuthenticatedUser()])

  if (!user) {
    return (
      <RestrictedGuestPrompt
        title="Sign in to view the map"
        description="Explore heritage sites across the First District of Batangas with our interactive GIS map."
      />
    )
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 2. Fetch user profile and await map data concurrently
  const [profileResult, [sites, categories, curatedTrails, municipalities, boundaries]] = await Promise.all([
    supabase
      .from("tourist_profiles")
      .select("home_latitude, home_longitude")
      .eq("id", user.id)
      .maybeSingle(),
    mapDataPromise,
  ])

  const homeLatitude = profileResult.data?.home_latitude ?? null
  const homeLongitude = profileResult.data?.home_longitude ?? null

  return (
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
      initialPlanRouteSiteId={sp.planRoute ?? null}
    />
  )
}
