import { describe, it, expect } from "bun:test"
import { dijkstra, type RouteGraph } from "./dijkstra"

function graphOf(edges: [string, string, number, number][]): RouteGraph {
  const g: RouteGraph = new Map()
  const add = (from: string, to: string, distanceKm: number, travelTimeMin: number) => {
    if (!g.has(from)) g.set(from, new Map())
    g.get(from)!.set(to, { from, to, distanceKm, travelTimeMin, isEstimated: false })
  }
  for (const [a, b, km, min] of edges) {
    add(a, b, km, min)
    add(b, a, km, min)
  }
  return g
}

// A->B->D is short but slow (town streets); A->C->D is longer but fast (highway).
const g = graphOf([
  ["A", "B", 2, 30],
  ["B", "D", 2, 30],
  ["A", "C", 5, 5],
  ["C", "D", 5, 5],
])

describe("dijkstra", () => {
  it("old signature still picks the shortest distance", () => {
    expect(dijkstra(g, "A", "D")).toEqual({ distance: 4, time: 60, path: ["A", "B", "D"] })
  })

  it("weight 'time' picks the faster path", () => {
    expect(dijkstra(g, "A", "D", { weight: "time" })).toEqual({ distance: 10, time: 10, path: ["A", "C", "D"] })
  })

  it("unreachable end gives Infinity and an empty path; start === end gives zero", () => {
    const split = graphOf([["A", "B", 1, 1]])
    split.set("Z", new Map())
    expect(dijkstra(split, "A", "Z")).toEqual({ distance: Infinity, time: 0, path: [] })
    expect(dijkstra(g, "A", "A")).toEqual({ distance: 0, time: 0, path: [] })
  })

  it("goes through another stop when that is cheaper than the direct edge", () => {
    const tri = graphOf([
      ["A", "B", 10, 10],
      ["A", "C", 3, 3],
      ["C", "B", 3, 3],
    ])
    expect(dijkstra(tri, "A", "B").path).toEqual(["A", "C", "B"])
  })
})
