import type { OptimizedRoute, RouteWaypoint } from "../types"

export function calculateShortestPath(waypoints: RouteWaypoint[]): OptimizedRoute {
  return {
    waypoints: [],
    totalDistance: 0,
    totalDuration: 0,
    path: [],
  }
}

export function dijkstra(
  graph: Map<string, Map<string, number>>,
  start: string,
  end: string,
): { distance: number; path: string[] } {
  return { distance: 0, path: [] }
}
