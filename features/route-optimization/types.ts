export interface RouteWaypoint {
  id: string
  name: string
  coordinates: [number, number]
}

export interface OptimizedRoute {
  waypoints: RouteWaypoint[]
  totalDistance: number
  totalDuration: number
  path: [number, number][]
}
