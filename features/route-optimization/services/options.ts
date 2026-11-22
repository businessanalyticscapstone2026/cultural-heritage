import { BALANCED_WEIGHTS, ROUTE_OPTION_ORDER } from "../constants"
import type { RouteOptionKind } from "../types"
import { solveOrder, type SolveInput } from "./solver"

/** Everything needed to build the options (pure data, no I/O). Index = point in the trip. */
export interface PlanInput {
  /** legKm[a][b]: kilometres from point a to point b. */
  legKm: number[][]
  /** legMin[a][b]: minutes from point a to point b. */
  legMin: number[][]
  /** Municipality of each point (null for "my location"). */
  towns: (string | null)[]
  /** Rating of each point, 0 (worst) to 1 (best). */
  ratings: number[]
  start: number | null
  roundTrip: boolean
  maxTravelTimeMinutes: number
  preferShortestDistance: boolean
  /** The order the user typed in, when they changed it by hand. */
  myOrder: number[] | null
}

export interface PlannedOption {
  kind: RouteOptionKind
  labels: RouteOptionKind[]
  order: number[]
  totalDistanceKm: number
  totalDurationMin: number
  townChanges: number
  exceedsTimeLimit: boolean
  deltaVsShortest: { km: number; min: number }
}

function townChange(input: PlanInput, a: number, b: number): number {
  const ta = input.towns[a]
  const tb = input.towns[b]
  return ta && tb && ta !== tb ? 1 : 0
}

/** Steps of an order, including the trip back on a round trip. */
function steps(order: number[], roundTrip: boolean): [number, number][] {
  const pairs: [number, number][] = []
  for (let i = 1; i < order.length; i++) pairs.push([order[i - 1], order[i]])
  if (roundTrip && order.length > 1) pairs.push([order[order.length - 1], order[0]])
  return pairs
}

export function summarize(order: number[], input: PlanInput) {
  let km = 0
  let min = 0
  let towns = 0
  for (const [a, b] of steps(order, input.roundTrip)) {
    km += input.legKm[a][b]
    min += input.legMin[a][b]
    towns += townChange(input, a, b)
  }
  return {
    totalDistanceKm: Math.round(km * 10) / 10,
    totalDurationMin: Math.round(min),
    townChanges: towns,
  }
}

function solve(input: PlanInput, stepCost: SolveInput["stepCost"]): number[] {
  return solveOrder({ size: input.legKm.length, stepCost, start: input.start, roundTrip: input.roundTrip })
}

/** Builds every route option, merges identical orders, and picks the recommended one. */
export function planRouteOptions(input: PlanInput): { options: PlannedOption[]; recommendedKind: RouteOptionKind } {
  const size = input.legKm.length

  const shortest = solve(input, (a, b) => input.legKm[a][b])
  const fastest = solve(input, (a, b) => input.legMin[a][b])

  // One town at a time: a town change costs more than any total distance could, so it is avoided first.
  const totalKm = input.legKm.flat().reduce((sum, v) => sum + v, 0)
  const oneTown = solve(input, (a, b) => townChange(input, a, b) * (totalKm + 1) + input.legKm[a][b])

  // Highlights first: minimize sum(position x rating) so best-rated stops come early.
  // A time penalty is raised step by step until the trip fits the time limit.
  const highlightCost = (penalty: number): SolveInput["stepCost"] => (a, b, position) =>
    (position < size ? position * input.ratings[b] : 0) + penalty * input.legMin[a][b]
  let highlights = solve(input, highlightCost(0))
  const fitsLimit = (order: number[]) => summarize(order, input).totalDurationMin <= input.maxTravelTimeMinutes
  if (!fitsLimit(highlights) && fitsLimit(fastest)) {
    highlights = fastest
    for (const penalty of [0.01, 0.03, 0.1, 0.3, 1, 3, 10]) {
      const candidate = solve(input, highlightCost(penalty))
      if (fitsLimit(candidate)) {
        highlights = candidate
        break
      }
    }
  }

  // Balanced: one extra candidate that mixes time, distance and town changes per step,
  // then the candidate with the best mixed score (each total scaled 0..1) wins.
  const maxLegKm = Math.max(...input.legKm.flat(), 1e-9)
  const maxLegMin = Math.max(...input.legMin.flat(), 1e-9)
  const mixed = solve(
    input,
    (a, b) =>
      BALANCED_WEIGHTS.time * (input.legMin[a][b] / maxLegMin) +
      BALANCED_WEIGHTS.distance * (input.legKm[a][b] / maxLegKm) +
      BALANCED_WEIGHTS.townChanges * townChange(input, a, b),
  )
  const balanced = pickBalanced([shortest, fastest, mixed, highlights, oneTown], input)

  const byKind: [RouteOptionKind, number[]][] = [
    ["shortest", shortest],
    ["fastest", fastest],
    ["balanced", balanced],
    ["highlights", highlights],
    ["one-town", oneTown],
  ]
  if (input.myOrder) byKind.push(["my-order", input.myOrder])

  // Merge options that visit the stops in exactly the same order.
  const merged = new Map<string, PlannedOption>()
  for (const kind of ROUTE_OPTION_ORDER) {
    const order = byKind.find(([k]) => k === kind)?.[1]
    if (!order) continue
    const key = order.join(",")
    const existing = merged.get(key)
    if (existing) {
      existing.labels.push(kind)
      continue
    }
    const totals = summarize(order, input)
    merged.set(key, {
      kind,
      labels: [kind],
      order,
      ...totals,
      exceedsTimeLimit: totals.totalDurationMin > input.maxTravelTimeMinutes,
      deltaVsShortest: { km: 0, min: 0 },
    })
  }

  return {
    options: withDeltas([...merged.values()]),
    recommendedKind: input.preferShortestDistance ? "shortest" : "fastest",
  }
}

function pickBalanced(candidates: number[][], input: PlanInput): number[] {
  const totals = candidates.map((order) => summarize(order, input))
  const scale = (values: number[]) => {
    const min = Math.min(...values)
    const max = Math.max(...values)
    return values.map((v) => (max === min ? 0 : (v - min) / (max - min)))
  }
  const km = scale(totals.map((t) => t.totalDistanceKm))
  const min = scale(totals.map((t) => t.totalDurationMin))
  const towns = scale(totals.map((t) => t.townChanges))
  let bestIndex = 0
  let bestScore = Infinity
  candidates.forEach((_, i) => {
    const score = BALANCED_WEIGHTS.time * min[i] + BALANCED_WEIGHTS.distance * km[i] + BALANCED_WEIGHTS.townChanges * towns[i]
    if (score < bestScore - 1e-9) {
      bestScore = score
      bestIndex = i
    }
  })
  return candidates[bestIndex]
}

/** Sets each option's difference against the Shortest option. */
export function withDeltas<T extends { labels: RouteOptionKind[]; totalDistanceKm: number; totalDurationMin: number; deltaVsShortest: { km: number; min: number } }>(
  options: T[],
): T[] {
  const shortest = options.find((o) => o.labels.includes("shortest")) ?? options[0]
  return options.map((o) => ({
    ...o,
    deltaVsShortest: {
      km: Math.round((o.totalDistanceKm - shortest.totalDistanceKm) * 10) / 10,
      min: o.totalDurationMin - shortest.totalDurationMin,
    },
  }))
}
