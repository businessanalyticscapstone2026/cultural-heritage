import type { DijkstraResult, RouteEdge } from "../types"

export type RouteGraph = Map<string, Map<string, RouteEdge>>

export interface DijkstraOptions {
  /** What "cheapest" means: least kilometres (default) or least minutes. */
  weight?: "distance" | "time"
}

/**
 * Dijkstra's shortest path between two stops.
 *
 * `graph.get(a).get(b)` is the edge from a to b (edges may differ per
 * direction). Returns the cheapest path by the chosen weight, plus the total
 * kilometres and minutes along that path. If `end` cannot be reached,
 * `distance` is Infinity and `path` is empty.
 *
 * Dijkstra only finds the best path between TWO stops. The visiting order of
 * many stops is chosen by `solver.ts`.
 */
export function dijkstra(
  graph: RouteGraph,
  start: string,
  end: string,
  options: DijkstraOptions = {},
): DijkstraResult {
  const byTime = options.weight === "time"
  const cost = new Map<string, number>()
  const km = new Map<string, number>()
  const minutes = new Map<string, number>()
  const previous = new Map<string, string | null>()
  const done = new Set<string>()

  for (const node of graph.keys()) {
    cost.set(node, Infinity)
    km.set(node, Infinity)
    minutes.set(node, 0)
    previous.set(node, null)
  }
  cost.set(start, 0)
  km.set(start, 0)

  const heap = new MinHeap()
  heap.push(start, 0)

  while (heap.size > 0) {
    const { node: current, priority } = heap.pop()
    // Old heap entries are skipped (we push again instead of updating in place).
    if (done.has(current) || priority > cost.get(current)!) continue
    if (current === end) break
    done.add(current)

    for (const [neighbor, edge] of graph.get(current) ?? []) {
      if (done.has(neighbor)) continue
      const step = byTime ? edge.travelTimeMin : edge.distanceKm
      const alt = cost.get(current)! + step
      if (alt < (cost.get(neighbor) ?? Infinity)) {
        cost.set(neighbor, alt)
        km.set(neighbor, km.get(current)! + edge.distanceKm)
        minutes.set(neighbor, minutes.get(current)! + edge.travelTimeMin)
        previous.set(neighbor, current)
        heap.push(neighbor, alt)
      }
    }
  }

  const path: string[] = []
  let current: string | null = end
  while (current !== null) {
    path.unshift(current)
    current = previous.get(current) ?? null
  }

  return {
    distance: km.get(end) ?? 0,
    time: minutes.get(end) ?? 0,
    path: path.length > 1 ? path : [],
  }
}

/** Small binary min-heap of (node, priority). */
class MinHeap {
  private items: { node: string; priority: number }[] = []

  get size(): number {
    return this.items.length
  }

  push(node: string, priority: number): void {
    const items = this.items
    items.push({ node, priority })
    let i = items.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (items[parent].priority <= items[i].priority) break
      ;[items[parent], items[i]] = [items[i], items[parent]]
      i = parent
    }
  }

  pop(): { node: string; priority: number } {
    const items = this.items
    const top = items[0]
    const last = items.pop()!
    if (items.length > 0) {
      items[0] = last
      let i = 0
      for (;;) {
        const left = 2 * i + 1
        const right = left + 1
        let smallest = i
        if (left < items.length && items[left].priority < items[smallest].priority) smallest = left
        if (right < items.length && items[right].priority < items[smallest].priority) smallest = right
        if (smallest === i) break
        ;[items[smallest], items[i]] = [items[i], items[smallest]]
        i = smallest
      }
    }
    return top
  }
}
