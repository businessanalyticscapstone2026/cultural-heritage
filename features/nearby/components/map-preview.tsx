"use client"

import { Map, MapMarker, MarkerContent, MapPopup } from "@/components/ui/map"
import { MapPin, Navigation } from "lucide-react"
import type { NearbySite } from "@/types/heritage"
import Link from "next/link"

interface MapPreviewProps {
  latitude: number
  longitude: number
  sites: NearbySite[]
}

export default function MapPreview({ latitude, longitude, sites }: MapPreviewProps) {
  return (
    <div className="relative h-48 overflow-hidden rounded-xl border border-border lg:h-64">
      <Map center={[longitude, latitude]} zoom={12} className="h-full w-full">
        <MapMarker longitude={longitude} latitude={latitude}>
          <MarkerContent>
            <div className="relative">
              <Navigation
                className="h-6 w-6 -translate-x-1/2 -translate-y-full text-primary drop-shadow-lg"
                fill="#0F2747"
              />
              <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-2 rounded-full bg-primary animate-ping" />
            </div>
          </MarkerContent>
          <MapPopup longitude={longitude} latitude={latitude} closeButton={false}>
            <p className="text-xs font-medium text-primary">Your location</p>
          </MapPopup>
        </MapMarker>

        {sites.map((site) => (
          <MapMarker key={site.siteId} longitude={site.longitude} latitude={site.latitude}>
            <MarkerContent>
              <Link href={`/heritage/${site.siteId}`}>
                <MapPin
                  className="h-6 w-6 -translate-x-1/2 -translate-y-full cursor-pointer drop-shadow-lg transition-transform hover:scale-125"
                  style={{ fill: "#2E5BFF", color: "#2E5BFF" }}
                />
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
        ))}
      </Map>
    </div>
  )
}
