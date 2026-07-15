"use client"

import { MapPin } from "lucide-react"
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
} from "@/components/ui/map"
import type { HomeMapSite } from "@/features/home/types"

interface MapInnerProps {
  sites: HomeMapSite[]
}

export default function MapInner({ sites }: MapInnerProps) {
  const hasSites = sites.length > 0
  const center: [number, number] = hasSites
    ? [sites[0].longitude, sites[0].latitude]
    : [120.78, 13.92]

  return (
    <Map center={center} zoom={10} className="h-full w-full">
      <MapControls position="top-right" />
      {sites.map((site) => (
        <MapMarker
          key={site.id}
          longitude={site.longitude}
          latitude={site.latitude}
        >
          <MarkerContent>
            <MapPin
              className="h-7 w-7 -translate-x-1/2 -translate-y-full drop-shadow"
              style={{ fill: "#2E5BFF", color: "#2E5BFF" }}
            />
          </MarkerContent>
          <MarkerPopup closeButton>
            <p className="text-sm font-semibold text-primary">{site.name}</p>
            {site.categoryName && (
              <p className="text-xs text-muted">{site.categoryName}</p>
            )}
          </MarkerPopup>
        </MapMarker>
      ))}
    </Map>
  )
}
