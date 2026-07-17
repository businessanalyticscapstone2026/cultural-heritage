"use client"

import { useUserLocation } from "@/features/gis/hooks/use-user-location"
import { TouristGISPanel } from "@/features/gis/components"
import type { TouristMapSite, TouristMapCategory, CuratedTrail } from "@/features/gis/services/tourist-map"
import type { User } from "@supabase/supabase-js"

interface TouristMapClientProps {
  sites: TouristMapSite[]
  categories: TouristMapCategory[]
  curatedTrails: CuratedTrail[]
  user: User | null
  homeLatitude: number | null
  homeLongitude: number | null
  /** Deep-link target from `/map?site=<uuid>`. */
  initialSiteId?: string | null
  /** Deep-link target from `/map?planRoute=<uuid>` to start route planning. */
  initialPlanRouteSiteId?: string | null
}

export function TouristMapClient({
  sites,
  categories,
  curatedTrails,
  user,
  homeLatitude,
  homeLongitude,
  initialSiteId = null,
  initialPlanRouteSiteId = null,
}: TouristMapClientProps) {
  const {
    latitude: userLatitude,
    longitude: userLongitude,
    source: locationSource,
  } = useUserLocation(user, homeLatitude, homeLongitude)

  return (
    <TouristGISPanel
      sites={sites}
      categories={categories}
      curatedTrails={curatedTrails}
      user={user}
      homeLatitude={homeLatitude}
      homeLongitude={homeLongitude}
      userLatitude={userLatitude}
      userLongitude={userLongitude}
      locationSource={locationSource}
      initialSiteId={initialSiteId}
      initialPlanRouteSiteId={initialPlanRouteSiteId}
    />
  )
}
