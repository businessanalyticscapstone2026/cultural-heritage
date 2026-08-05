"use client"

import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"
import type { HomeEditorialHighlight } from "@/features/home/types"

const Map = dynamic(
  () => import("@/components/ui/map").then((m) => m.Map),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-parchment/60">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
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

const DISTRICT_CENTER: [number, number] = [120.68, 13.95]

interface HighlightsMapPreviewProps {
  sites: HomeEditorialHighlight[]
  className?: string
}

/**
 * Scoped map for CR-CHTS-002 tourism highlights only.
 * Shows pins for the 1–2 editorially featured sites (not the full atlas).
 * Lightly interactive: pan/zoom + pin popup; full GIS remains on /map.
 */
export function HighlightsMapPreview({ sites, className }: HighlightsMapPreviewProps) {
  const withCoords = sites.filter(
    (s) => s.latitude != null && s.longitude != null,
  )

  if (withCoords.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-ink/10 bg-parchment/50 p-6 ${className ?? ""}`}
      >
        <MapPin size={28} className="text-ink/25" strokeWidth={1.5} />
        <p className="max-w-[14rem] text-center text-xs text-ink-soft">
          Map preview unavailable — highlighted site coordinates are not set yet.
        </p>
      </div>
    )
  }

  const center: [number, number] =
    withCoords.length === 1
      ? [withCoords[0].longitude as number, withCoords[0].latitude as number]
      : [
          withCoords.reduce((sum, s) => sum + (s.longitude as number), 0) / withCoords.length,
          withCoords.reduce((sum, s) => sum + (s.latitude as number), 0) / withCoords.length,
        ]

  const zoom = withCoords.length === 1 ? 12 : 10

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-ink/10 ${className ?? ""}`}
      aria-label="Map preview of highlighted heritage sites"
    >
      <Map center={center ?? DISTRICT_CENTER} zoom={zoom} className="h-full w-full" theme="light">
        {withCoords.map((site) => (
          <MapMarker
            key={site.id}
            longitude={site.longitude as number}
            latitude={site.latitude as number}
          >
            <MarkerContent>
              <MapPin
                className="h-7 w-7 -translate-x-1/2 -translate-y-full drop-shadow"
                style={{
                  fill: site.categoryColor ?? "#2E5BFF",
                  color: site.categoryColor ?? "#2E5BFF",
                }}
              />
            </MarkerContent>
            <MarkerPopup closeButton>
              <p className="text-sm font-semibold text-ink">{site.siteName}</p>
              {site.municipalityName && (
                <p className="text-xs text-ink-soft">{site.municipalityName}</p>
              )}
            </MarkerPopup>
          </MapMarker>
        ))}
      </Map>
    </div>
  )
}
