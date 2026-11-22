"use client"

import { Map, MapMarker, MarkerContent, MapPopup, MapRoute } from "@/components/ui/map"
import { MapPin } from "lucide-react"
import { ROUTE_OPTION_META } from "../constants"
import type { RouteStop } from "../types"

interface RouteMapViewProps {
  stops: RouteStop[]
  path: [number, number][]
  /** Line color. Saved routes do not store which option they were, so this defaults to Shortest green. */
  color?: string
}

const STOP_COLORS = [
  "#2E5BFF",
  "#34A853",
  "#F4B400",
  "#EA4335",
  "#9C27B0",
  "#00BCD4",
  "#FF5722",
  "#607D8B",
]

export default function RouteMapView({ stops, path, color = ROUTE_OPTION_META.shortest.color }: RouteMapViewProps) {
  if (stops.length === 0) return null

  const center: [number, number] = [stops[0].longitude, stops[0].latitude]

  return (
    <div className="relative h-64 overflow-hidden rounded-xl border border-border lg:h-96">
      <Map center={center} zoom={11} className="h-full w-full">
        {path.length >= 2 && (
          <MapRoute
            coordinates={path}
            color={color}
            width={4}
            opacity={0.7}
          />
        )}

        {stops.map((stop, index) => (
          <MapMarker
            key={stop.siteId}
            longitude={stop.longitude}
            latitude={stop.latitude}
          >
            <MarkerContent>
              <div className="relative">
                <MapPin
                  className="h-6 w-6 -translate-x-1/2 -translate-y-full drop-shadow-lg"
                  style={{
                    fill: STOP_COLORS[index % STOP_COLORS.length],
                    color: "#ffffff",
                  }}
                />
                <span className="absolute left-1/2 top-0 flex h-4 w-4 -translate-x-1/2 -translate-y-1 items-center justify-center rounded-full bg-white text-[8px] font-bold shadow-sm"
                  style={{ color: STOP_COLORS[index % STOP_COLORS.length] }}
                  aria-hidden="true"
                >
                  {stop.stopOrder}
                </span>
              </div>
            </MarkerContent>
            <MapPopup longitude={stop.longitude} latitude={stop.latitude} closeButton={false}>
              <div className="max-w-[180px]">
                <p className="text-xs font-semibold text-heading">
                  <span aria-hidden="true">#{stop.stopOrder} </span>
                  {stop.siteName}
                </p>
                {stop.municipalityName && (
                  <p className="text-[10px] text-muted">{stop.municipalityName}</p>
                )}
                {stop.distanceFromPrevKm !== null && (
                  <p className="mt-0.5 text-[10px] font-medium text-secondary">
                    {stop.distanceFromPrevKm} km {stop.stopOrder === 1 ? "from start" : "from previous stop"}
                  </p>
                )}
              </div>
            </MapPopup>
          </MapMarker>
        ))}
      </Map>
    </div>
  )
}
