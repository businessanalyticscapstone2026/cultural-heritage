import { EXACT_SOLVER_MAX_POINTS } from "../constants"

/**
 * Picks the visiting order of points 0..size-1 (pure, no I/O).
 *
 * `stepCost(from, to, position)` is the cost of going from `from` to `to`,
 * where `position` is the index `to` will have in the final order
 * (position === size means "the trip back to the start" on a round trip).
 * Costs may differ per direction.
 */
export interface SolveInput {
  size: number
  stepCost: (from: number, to: number, position: number) => number
  /** Fixed first point, or null to let the solver pick the best first point. */
  start: number | null
  /** Come back to the first point at the end. */
  roundTrip: boolean
}

/** Total cost of one order under `input`. */
export function orderCost(order: number[], input: SolveInput): number {
  let total = 0
  for (let i = 1; i < order.length; i++) total += input.stepCost(order[i - 1], order[i], i)
  if (input.roundTrip && order.length > 1) total += input.stepCost(order[order.length - 1], order[0], order.length)
  return total
}

/**
 * Best order of all points.
 * Up to EXACT_SOLVER_MAX_POINTS points: exact answer (Held-Karp).
 * Above that: Nearest Neighbor, then improved with 2-opt (good, not always perfect).
 */
export function solveOrder(input: SolveInput): number[] {
  if (input.size <= 1) return input.size === 1 ? [0] : []
  if (input.size <= EXACT_SOLVER_MAX_POINTS) return heldKarp(input)
  return twoOpt(nearestNeighbor(input), input)
}

/**
 * Held-Karp dynamic programming: exact best order.
 * best[mask][j] = cheapest way to visit the points in `mask`, ending at j.
 * Time grows like 2^n * n^2, fine for about 11 points.
 */
export function heldKarp(input: SolveInput): number[] {
  const { size, start, roundTrip } = input
  // A round trip with a free start: try every start and keep the cheapest.
  if (start === null && roundTrip) {
    let bestOrder: number[] = []
    let bestCost = Infinity
    for (let s = 0; s < size; s++) {
      const order = heldKarp({ ...input, start: s })
      const cost = orderCost(order, input)
      if (cost < bestCost) {
        bestCost = cost
        bestOrder = order
      }
    }
    return bestOrder
  }

  const full = (1 << size) - 1
  const best = new Float64Array((full + 1) * size).fill(Infinity)
  const parent = new Int8Array((full + 1) * size).fill(-1)

  for (let j = 0; j < size; j++) {
    if (start === null || j === start) best[(1 << j) * size + j] = 0
  }

  for (let mask = 1; mask <= full; mask++) {
    const position = popcount(mask) // index the next point will get
    for (let j = 0; j < size; j++) {
      const here = best[mask * size + j]
      if (here === Infinity) continue
      for (let k = 0; k < size; k++) {
        if (mask & (1 << k)) continue
        const next = mask | (1 << k)
        const cost = here + input.stepCost(j, k, position)
        if (cost < best[next * size + k]) {
          best[next * size + k] = cost
          parent[next * size + k] = j
        }
      }
    }
  }

  let last = -1
  let lastCost = Infinity
  for (let j = 0; j < size; j++) {
    const back = roundTrip && start !== null && j !== start ? input.stepCost(j, start, size) : 0
    const cost = best[full * size + j] + back
    if (cost < lastCost) {
      lastCost = cost
      last = j
    }
  }

  const order: number[] = []
  let mask = full
  while (last !== -1) {
    order.unshift(last)
    const prev = parent[mask * size + last]
    mask &= ~(1 << last)
    last = prev
  }
  return order
}

/** Greedy: always go to the cheapest next point. Free start tries every start. */
export function nearestNeighbor(input: SolveInput): number[] {
  const starts = input.start === null ? [...Array(input.size).keys()] : [input.start]
  let bestOrder: number[] = []
  let bestCost = Infinity
  for (const s of starts) {
    const order = [s]
    const left = new Set([...Array(input.size).keys()].filter((i) => i !== s))
    while (left.size > 0) {
      let next = -1
      let nextCost = Infinity
      for (const k of left) {
        const cost = input.stepCost(order[order.length - 1], k, order.length)
        if (cost < nextCost) {
          nextCost = cost
          next = k
        }
      }
      order.push(next)
      left.delete(next)
    }
    const cost = orderCost(order, input)
    if (cost < bestCost) {
      bestCost = cost
      bestOrder = order
    }
  }
  return bestOrder
}

/** 2-opt: keep reversing a part of the order while that makes it cheaper. Never makes it worse. */
export function twoOpt(order: number[], input: SolveInput): number[] {
  let best = [...order]
  let bestCost = orderCost(best, input)
  // A fixed start must stay first, so reversals begin at index 1.
  const from = input.start === null && !input.roundTrip ? 0 : 1
  let improved = true
  while (improved) {
    improved = false
    for (let i = from; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        const candidate = [...best.slice(0, i), ...best.slice(i, k + 1).reverse(), ...best.slice(k + 1)]
        const cost = orderCost(candidate, input)
        if (cost < bestCost - 1e-9) {
          best = candidate
          bestCost = cost
          improved = true
        }
      }
    }
  }
  return best
}

function popcount(mask: number): number {
  let count = 0
  while (mask) {
    mask &= mask - 1
    count++
  }
  return count
}
