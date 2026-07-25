"use client"

import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"
import type { HomeMapPin } from "@/features/home/types"

const Map = dynamic(
  () => import("@/components/ui/map").then((m) => m.Map),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-3xl bg-parchment/30">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-soft/50">
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

export function AtlasMapPreview({ pins }: AtlasMapPreviewProps) {
  const center: [number, number] =
    pins.length > 0
      ? [pins[0].longitude, pins[0].latitude]
      : DISTRICT_CENTER

  if (pins.length === 0) {
    return (
      <div className="flex h-[500px] w-full flex-col items-center justify-center gap-4 rounded-3xl border border-ink/10 bg-parchment/30 backdrop-blur md:h-[600px]">
        <MapPin size={32} className="text-ink/20" strokeWidth={1.5} />
        <p className="max-w-xs text-center text-sm text-ink-soft">
          Heritage site pins will appear here once published sites with coordinates are available.
        </p>
        <span className="font-mono text-xs uppercase tracking-widest text-ink-soft/40">
          Atlas preview
        </span>
      </div>
    )
  }

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-3xl border border-ink/10 bg-background shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] md:h-[600px]">
      {/* Site count chip */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-ink/10 bg-background/90 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur-sm">
        <span className="size-2 rounded-full bg-accent" />
        {pins.length} {pins.length === 1 ? "SITE" : "SITES"}
      </div>

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
    </div>
  )
}
