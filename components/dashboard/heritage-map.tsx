"use client"

import dynamic from "next/dynamic"
import type { HeritageSiteMapMarker } from "@/features/dashboard/types"
import { MapMarker, MarkerContent, MarkerTooltip, MapControls } from "@/components/ui/map"
import { MapPin } from "lucide-react"

const Map = dynamic(() => import("@/components/ui/map").then((m) => m.Map), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading map…</div>
  ),
})

interface HeritageMapProps {
  markers: HeritageSiteMapMarker[]
}

export function HeritageMap({ markers }: HeritageMapProps) {
  if (markers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No published heritage sites with coordinates
      </div>
    )
  }

  const lngs = markers.map((m) => m.longitude)
  const lats = markers.map((m) => m.latitude)
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2

  return (
    <Map
      className="h-full w-full rounded-md"
      theme="light"
      viewport={{ center: [centerLng, centerLat], zoom: 10, bearing: 0, pitch: 0 }}
    >
      <MapControls position="bottom-right" showZoom />
      {markers.map((mkr) => (
        <MapMarker key={mkr.id} longitude={mkr.longitude} latitude={mkr.latitude}>
          <MarkerContent>
            <MapPin className="size-5 drop-shadow-sm" style={{ color: mkr.categoryColor }} fill={mkr.categoryColor} />
          </MarkerContent>
          <MarkerTooltip>
            <p className="font-medium">{mkr.siteName}</p>
            <p className="text-muted-foreground text-xs">{mkr.categoryName}</p>
          </MarkerTooltip>
        </MapMarker>
      ))}
    </Map>
  )
}
