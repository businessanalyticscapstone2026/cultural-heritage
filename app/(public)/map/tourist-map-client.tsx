"use client"

import { useUserLocation } from "@/features/gis/hooks/use-user-location"
import { TouristGISPanel } from "@/features/gis/components"
import type { TouristMapSite, TouristMapCategory } from "@/features/gis/services/tourist-map"
import type { User } from "@supabase/supabase-js"

interface TouristMapClientProps {
  sites: TouristMapSite[]
  categories: TouristMapCategory[]
  user: User | null
  homeLatitude: number | null
  homeLongitude: number | null
}

export function TouristMapClient({
  sites,
  categories,
  user,
  homeLatitude,
  homeLongitude,
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
      user={user}
      homeLatitude={homeLatitude}
      homeLongitude={homeLongitude}
      userLatitude={userLatitude}
      userLongitude={userLongitude}
      locationSource={locationSource}
    />
  )
}
