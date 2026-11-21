"use client"

import { MapPin } from "lucide-react"
import { Map, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map"
import type { HomeMapPin } from "@/features/home/types"

const DISTRICT_CENTER: [number, number] = [120.68, 13.95]

interface AtlasMapCanvasProps {
  pins: HomeMapPin[]
}

export function AtlasMapCanvas({ pins }: AtlasMapCanvasProps) {
  const center: [number, number] =
    pins.length > 0
      ? [pins[0].longitude, pins[0].latitude]
      : DISTRICT_CENTER

  return (
    <Map center={center} zoom={10} className="h-full w-full" theme="light">
      {pins.map((pin) => (
        <MapMarker key={pin.id} longitude={pin.longitude} latitude={pin.latitude}>
          <MarkerContent>
            <MapPin
              className="h-7 w-7 -translate-x-1/2 -translate-y-full drop-shadow"
              style={{
                fill: pin.categoryColor ?? "#2E5BFF",
                color: pin.categoryColor ?? "#2E5BFF",
              }}
            />
          </MarkerContent>
          <MarkerPopup closeButton>
            <p className="text-sm font-semibold text-ink">{pin.name}</p>
            {pin.categoryName && (
              <p className="text-xs text-ink-soft">{pin.categoryName}</p>
            )}
          </MarkerPopup>
        </MapMarker>
      ))}
    </Map>
  )
}
