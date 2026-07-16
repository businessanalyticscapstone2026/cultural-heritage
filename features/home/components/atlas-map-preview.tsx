"use client"

import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"
import type { HomeMapPin } from "@/features/home/types"

const Map = dynamic(
  () => import("@/components/ui/map").then((m) => m.Map),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-cream/5">
        <span className="font-mono text-xs uppercase tracking-widest text-cream/50">
          Loading map…
        </span>
      </div>
    ),
  },
)
const MapMarker = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapMarker),
  { ssr: false },
)
const MarkerContent = dynamic(
  () => import("@/components/ui/map").then((m) => m.MarkerContent),
  { ssr: false },
)
const MarkerPopup = dynamic(
  () => import("@/components/ui/map").then((m) => m.MarkerPopup),
  { ssr: false },
)

/** First District of Batangas approximate center. */
const DISTRICT_CENTER: [number, number] = [120.68, 13.95]

interface AtlasMapPreviewProps {
  pins: HomeMapPin[]
}

/**
 * Lightweight static/preview map for the homepage atlas section.
 * Full interactivity (filters, routing, detail panel) lives on /map (CR-CHTS-004).
 */
export function AtlasMapPreview({ pins }: AtlasMapPreviewProps) {
  const center: [number, number] =
    pins.length > 0
      ? [pins[0].longitude, pins[0].latitude]
      : DISTRICT_CENTER

  if (pins.length === 0) {
    return (
      <div className="flex h-[500px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-cream/10 bg-cream/5 backdrop-blur md:h-[600px]">
        <MapPin size={32} className="text-cream/30" strokeWidth={1.5} />
        <p className="max-w-xs text-center text-sm text-cream/60">
          Heritage site pins will appear here once published sites with coordinates are available.
        </p>
        <span className="font-mono text-xs uppercase tracking-widest text-cream/40">
          Atlas preview
        </span>
      </div>
    )
  }

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-2xl border border-cream/10 md:h-[600px]">
      <Map center={center} zoom={10} className="h-full w-full" theme="dark">
        {pins.map((pin) => (
          <MapMarker key={pin.id} longitude={pin.longitude} latitude={pin.latitude}>
            <MarkerContent>
              <MapPin
                className="h-7 w-7 -translate-x-1/2 -translate-y-full drop-shadow"
                style={{
                  fill: pin.categoryColor ?? "#6BA3E8",
                  color: pin.categoryColor ?? "#6BA3E8",
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
    </div>
  )
}
