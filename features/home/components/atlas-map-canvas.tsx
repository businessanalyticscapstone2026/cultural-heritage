"use client"

import { useMemo } from "react"
import { MapPin } from "lucide-react"
import { Map, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map"
import type { HomeMapPin } from "@/features/home/types"

const DISTRICT_CENTER: [number, number] = [120.68, 13.95]

interface AtlasMapCanvasProps {
  pins: HomeMapPin[]
}

export function AtlasMapCanvas({ pins }: AtlasMapCanvasProps) {
  const center: [number, number] = useMemo(() => {
    if (pins.length === 0) return DISTRICT_CENTER
    const lngs = pins.map((p) => p.longitude)
    const lats = pins.map((p) => p.latitude)
    return [
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
      (Math.min(...lats) + Math.max(...lats)) / 2,
    ]
  }, [pins])

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
