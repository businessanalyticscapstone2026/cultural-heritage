"use client"

import { Map, MapMarker, MarkerContent, MapPopup, MapRoute } from "@/components/ui/map"
import { Landmark, Navigation } from "lucide-react"
import type { NearbySite } from "../types"
import Link from "next/link"

interface NearbyMiniMapProps {
  siteLatitude: number
  siteLongitude: number
  siteName: string
  sites: NearbySite[]
  selectedSiteId: string | null
  onSiteHover: (siteId: string | null) => void
}

export default function NearbyMiniMap({
  siteLatitude,
  siteLongitude,
  siteName,
  sites,
  selectedSiteId,
  onSiteHover,
}: NearbyMiniMapProps) {
  const routeLines = sites.map((site) => ({
    id: site.siteId,
    coordinates: [
      [siteLongitude, siteLatitude] as [number, number],
      [site.longitude, site.latitude] as [number, number],
    ],
  }))

  return (
    <div className="relative h-48 overflow-hidden rounded-lg border border-border lg:h-56">
      <Map center={[siteLongitude, siteLatitude]} zoom={12} className="h-full w-full">
        <MapMarker longitude={siteLongitude} latitude={siteLatitude}>
          <MarkerContent>
            <div className="relative">
              <Landmark
                className="h-7 w-7 -translate-x-1/2 -translate-y-full drop-shadow-lg"
                fill="#0F2747"
                color="#FFFFFF"
              />
            </div>
          </MarkerContent>
          <MapPopup longitude={siteLongitude} latitude={siteLatitude} closeButton={false}>
            <p className="max-w-[140px] text-xs font-semibold text-heading">{siteName}</p>
          </MapPopup>
        </MapMarker>

        {sites.map((site) => {
          const isSelected = selectedSiteId === site.siteId
          return (
            <MapMarker
              key={site.siteId}
              longitude={site.longitude}
              latitude={site.latitude}
            >
              <MarkerContent>
                <Link href={`/heritage/${site.siteId}`}>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-lg transition-all ${
                      isSelected ? "scale-125 ring-2 ring-accent" : ""
                    }`}
                    style={{ backgroundColor: "#2E5BFF" }}
                    onMouseEnter={() => onSiteHover(site.siteId)}
                    onMouseLeave={() => onSiteHover(null)}
                  >
                    <Landmark className="h-3 w-3 text-white" />
                  </div>
                </Link>
              </MarkerContent>
              <MapPopup longitude={site.longitude} latitude={site.latitude} closeButton={false}>
                <div className="max-w-[160px]">
                  <p className="text-xs font-semibold text-heading">{site.siteName}</p>
                  {site.category && (
                    <p className="text-[10px] text-muted">{site.category}</p>
                  )}
                  <p className="mt-0.5 text-[10px] font-medium text-secondary">
                    {site.distanceKm.toFixed(1)} km
                  </p>
                </div>
              </MapPopup>
            </MapMarker>
          )
        })}

        {routeLines.map((route) => (
          <MapRoute
            key={route.id}
            coordinates={route.coordinates}
            color={selectedSiteId === route.id ? "#2E5BFF" : "#94A3B8"}
            width={selectedSiteId === route.id ? 2.5 : 1.5}
            opacity={selectedSiteId === route.id ? 0.9 : 0.4}
            dashArray={[4, 4]}
            interactive={false}
          />
        ))}
      </Map>
    </div>
  )
}
