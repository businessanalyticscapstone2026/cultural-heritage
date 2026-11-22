import { describe, it, expect } from "bun:test"
import { solveOrder, orderCost, nearestNeighbor, heldKarp, type SolveInput } from "./solver"

/** Small seeded random generator so the tests always use the same numbers. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function randomMatrix(n: number, rand: () => number, symmetric = false): number[][] {
  const m = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      m[i][j] = symmetric && j < i ? m[j][i] : Math.round(rand() * 100) + 1
    }
  return m
}

function permutations(items: number[]): number[][] {
  if (items.length <= 1) return [items]
  return items.flatMap((x, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((p) => [x, ...p]))
}

function bruteForce(input: SolveInput): number {
  let best = Infinity
  for (const p of permutations([...Array(input.size).keys()])) {
    if (input.start !== null && p[0] !== input.start) continue
    best = Math.min(best, orderCost(p, input))
  }
  return best
}

function input(m: number[][], start: number | null, roundTrip: boolean): SolveInput {
  return { size: m.length, stepCost: (a, b) => m[a][b], start, roundTrip }
}

function isPermutation(order: number[], n: number) {
  return order.length === n && new Set(order).size === n && order.every((i) => i >= 0 && i < n)
}

describe("solveOrder (Held-Karp)", () => {
  it("matches brute force on 20 random 7-stop asymmetric matrices (free start, fixed start, round trip)", () => {
    const rand = seeded(42)
    for (let t = 0; t < 20; t++) {
      const m = randomMatrix(7, rand)
      for (const [start, roundTrip] of [[null, false], [0, false], [3, true], [null, true]] as const) {
        const inp = input(m, start, roundTrip)
        const order = solveOrder(inp)
        expect(isPermutation(order, 7)).toBe(true)
        if (start !== null) expect(order[0]).toBe(start)
        expect(orderCost(order, inp)).toBeCloseTo(bruteForce(inp), 9)
      }
    }
  })

  it("handles 0, 1, 2 and 3 points", () => {
    expect(solveOrder(input([], null, false))).toEqual([])
    expect(solveOrder(input([[0]], null, false))).toEqual([0])
    expect(solveOrder(input([[0, 5], [1, 0]], null, false))).toEqual([1, 0]) // asymmetric: 1->0 is cheaper
    expect(solveOrder(input([[0, 5], [1, 0]], 0, false))).toEqual([0, 1])
    const three = [[0, 1, 9], [1, 0, 1], [9, 1, 0]]
    expect(orderCost(solveOrder(input(three, null, false)), input(three, null, false))).toBe(2)
  })

  it("handles identical points (all distances zero)", () => {
    const zero = Array.from({ length: 5 }, () => Array(5).fill(0))
    const order = solveOrder(input(zero, 2, true))
    expect(isPermutation(order, 5)).toBe(true)
    expect(order[0]).toBe(2)
  })

  it("uses position-aware costs (cheapest first slot goes to the highest weight)", () => {
    const weight = [0, 0.9, 0.1, 0.5]
    const order = solveOrder({ size: 4, stepCost: (_a, b, pos) => pos * weight[b], start: 0, roundTrip: false })
    expect(order).toEqual([0, 1, 3, 2])
  })
})

describe("solveOrder above the exact limit (NN + 2-opt)", () => {
  it("12 points: valid order, not worse than plain Nearest Neighbor", () => {
    const rand = seeded(7)
    for (let t = 0; t < 5; t++) {
      const m = randomMatrix(12, rand, true)
      for (const start of [null, 0]) {
        const inp = input(m, start, false)
        const order = solveOrder(inp)
        expect(isPermutation(order, 12)).toBe(true)
        if (start !== null) expect(order[0]).toBe(start)
        expect(orderCost(order, inp)).toBeLessThanOrEqual(orderCost(nearestNeighbor(inp), inp))
      }
    }
  })

  it("heldKarp is exact where NN is not", () => {
    // NN from 0 takes the cheap 0->1 step and then pays for it.
    const m = [
      [0, 1, 2, 3],
      [1, 0, 50, 50],
      [2, 50, 0, 1],
      [3, 50, 1, 0],
    ]
    const inp = input(m, null, false)
    expect(orderCost(heldKarp(inp), inp)).toBe(bruteForce(inp))
  })
})
