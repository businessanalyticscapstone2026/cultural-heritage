"use client"

import { useEffect, useCallback, useState } from "react"
import { Plus, Map, Check, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Reveal, Stagger, StaggerItem } from "@/components/animations/reveal"
import RouteVisualization from "@/features/route-optimization/components/route-visualization"
import type { OptimizedRoute } from "@/features/route-optimization/types"
import { useCreateRoute, useRoutes } from "@/features/route-optimization/hooks"

interface RoutesClientProps {
  initialRoutes: OptimizedRoute[]
}

export default function RoutesClient({ initialRoutes }: RoutesClientProps) {
  const { routes, list, complete, loading } = useRoutes()
  const { create, loading: creating } = useCreateRoute()
  const [selectedRoute, setSelectedRoute] = useState<OptimizedRoute | null>(null)
  const [showNewRoute, setShowNewRoute] = useState(false)

  useEffect(() => {
    if (initialRoutes.length > 0) {
      list()
    }
  }, [])

  const displayRoutes = routes.length > 0 ? routes : initialRoutes

  const handleCreateRoute = useCallback(async () => {
    setShowNewRoute(false)
  }, [create])

  if (loading && displayRoutes.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (selectedRoute) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedRoute(null)}
          className="text-ink-soft hover:text-ink"
        >
          ← Back to routes
        </Button>
        <RouteVisualization route={selectedRoute} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <Card size="sm" className="border-dashed border-accent/30 bg-accent/5">
          <CardContent className="flex items-center justify-between px-4 py-3">
            <div>
              <CardTitle className="text-sm">Plan a new route</CardTitle>
              <CardDescription className="text-xs">
                Select heritage sites from your bookmarks or recommendations to build an optimized itinerary.
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowNewRoute(true)}>
              <Plus className="mr-1 h-4 w-4" />
              New Route
            </Button>
          </CardContent>
        </Card>
      </Reveal>

      {displayRoutes.length === 0 ? (
        <Reveal>
          <Card size="sm">
            <CardContent className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <Map className="h-8 w-8 text-ink-soft/40" />
              <p className="text-sm text-ink-soft">No routes yet</p>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <Stagger className="space-y-3">
          <h2 className="text-sm font-medium text-ink">Your Routes</h2>
          {displayRoutes.map((route) => (
            <StaggerItem key={route.id}>
              <Card size="sm">
              <CardContent className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink truncate">
                      {route.name}
                    </h3>
                    <Badge
                      variant={route.status === "completed" ? "default" : "outline"}
                      className="text-[10px] capitalize shrink-0"
                    >
                      {route.status}
                    </Badge>
                    {route.hasEstimatedEdges && (
                      <Badge variant="outline" className="text-[10px] shrink-0">Some edges estimated</Badge>
                    )}
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {route.stops.length} stops · {route.totalDistanceKm} km · ~{route.totalDurationMin} min
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRoute(route)}
                    aria-label={`View route ${route.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {route.status === "draft" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (route.id) await complete(route.id)
                      }}
                      aria-label={`Mark route ${route.name} as completed`}
                    >
                      <Check className="h-4 w-4 text-success" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}
