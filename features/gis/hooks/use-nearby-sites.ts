"use client"

import { useMemo } from "react"
import { haversineDistance } from "@/utils/geo"
import type { TouristMapSite } from "../services/tourist-map"

export interface SiteWithDistance extends TouristMapSite {
  distanceKm: number | null
}

/**
 * Computes distance from a reference point (user location) to each site
 * using the Haversine formula. If no origin is known, all sites return
 * distanceKm = null and are unsorted.
 */
export function useNearbySites(
  sites: TouristMapSite[],
  originLat: number | null,
  originLng: number | null,
): SiteWithDistance[] {
  return useMemo(() => {
    if (originLat == null || originLng == null) {
      return sites.map((s) => ({ ...s, distanceKm: null }))
    }

    const withDistance = sites.map((s) => ({
      ...s,
      distanceKm: haversineDistance(originLat, originLng, s.latitude, s.longitude),
    }))

    withDistance.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))

    return withDistance
  }, [sites, originLat, originLng])
}
