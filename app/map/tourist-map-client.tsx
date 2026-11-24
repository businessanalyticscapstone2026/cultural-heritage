"use client"

import { useUserLocation } from "@/features/gis/hooks/use-user-location"
import { TouristGISPanel } from "@/features/gis/components"
import type { TouristMapSite, TouristMapCategory, CuratedTrail } from "@/features/gis/services/tourist-map"
import type { GeoFeatureCollection } from "@/features/gis/types"
import type { User } from "@supabase/supabase-js"
import type { InventoryCoverage } from "@/features/municipalities/services/inventory-coverage"

interface TouristMapClientProps {
  sites: TouristMapSite[]
  categories: TouristMapCategory[]
  curatedTrails: CuratedTrail[]
  inventoryCoverage: InventoryCoverage | null
  municipalities: { id: string; name: string }[]
  boundaries: GeoFeatureCollection
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
  inventoryCoverage,
  municipalities,
  boundaries,
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
      inventoryCoverage={inventoryCoverage}
      municipalities={municipalities}
      boundaries={boundaries}
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
