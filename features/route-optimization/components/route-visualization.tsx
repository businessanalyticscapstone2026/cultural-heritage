"use client"

import RouteMapView from "./route-map-view"
import RouteStopList from "./route-stop-list"
import type { OptimizedRoute } from "../types"

interface RouteVisualizationProps {
  route: OptimizedRoute
}

export default function RouteVisualization({ route }: RouteVisualizationProps) {
  return (
    <div className="space-y-6">
      {/* Route name header */}
      <div>
        <h2 className="text-xl font-semibold text-heading">{route.name}</h2>
        <p className="text-sm text-muted-foreground">
          {route.stops.length} stops · {route.totalDistanceKm} km total · ~{route.totalDurationMin} min
        </p>
      </div>

      {/* Map */}
      <RouteMapView stops={route.stops} path={route.path} />

      {/* Stop list with summary */}
      <RouteStopList
        stops={route.stops}
        totalDistanceKm={route.totalDistanceKm}
        totalDurationMin={route.totalDurationMin}
        hasEstimatedEdges={route.hasEstimatedEdges}
      />
    </div>
  )
}
