import { haversineDistance } from "@/utils/geo"

export const EXPLORE_SORT_VALUES = ["recommended", "alphabetical", "distance"] as const
export type ExploreSort = (typeof EXPLORE_SORT_VALUES)[number]
export const DEFAULT_EXPLORE_SORT: ExploreSort = "recommended"

export interface ExploreOrigin {
  latitude: number
  longitude: number
}

export interface ExploreSortRow {
  id: string
  siteName: string
  latitude: number | null
  longitude: number | null
  createdAt: string // ISO timestamp
}

export interface ExploreSortResult {
  orderedIds: string[]
  /** Only filled for sites that have coordinates, and only when origin was given. Kilometers. */
  distancesKm: Record<string, number>
}

export function parseExploreSort(value: string | undefined): ExploreSort {
  return EXPLORE_SORT_VALUES.includes(value as ExploreSort)
    ? (value as ExploreSort)
    : DEFAULT_EXPLORE_SORT
}

export function parseExploreOrigin(
  lat: string | undefined,
  lng: string | undefined,
): ExploreOrigin | null {
  if (!lat || !lng) return null

  const latitude = Number(lat)
  const longitude = Number(lng)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude < -90 || latitude > 90) return null
  if (longitude < -180 || longitude > 180) return null

  return { latitude, longitude }
}

export function resolveExploreSort(
  sort: ExploreSort,
  origin: ExploreOrigin | null,
): ExploreSort {
  if (sort === "distance" && origin === null) return DEFAULT_EXPLORE_SORT
  return sort
}

export function compareByName(a: string, b: string): number {
  return a.localeCompare(b, "en", { sensitivity: "base" })
}

export function sortExploreRows(
  rows: ExploreSortRow[],
  options: {
    sort: ExploreSort
    recommendedIds: ReadonlySet<string>
    origin: ExploreOrigin | null
  },
): ExploreSortResult {
  const { sort, recommendedIds, origin } = options
  const effectiveSort: ExploreSort = sort === "distance" && origin === null ? "recommended" : sort

  const sorted = [...rows]

  const distancesKm: Record<string, number> = {}
  const distanceOf = new Map<string, number>()

  if (effectiveSort === "distance" && origin) {
    for (const row of sorted) {
      if (row.latitude === null || row.longitude === null) continue
      const latitude = Number(row.latitude)
      const longitude = Number(row.longitude)
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue
      const km = haversineDistance(origin.latitude, origin.longitude, latitude, longitude)
      distanceOf.set(row.id, km)
      distancesKm[row.id] = km
    }
  }

  sorted.sort((a, b) => {
    if (effectiveSort === "alphabetical") {
      const byName = compareByName(a.siteName, b.siteName)
      if (byName !== 0) return byName
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
    }

    if (effectiveSort === "distance") {
      const aKm = distanceOf.get(a.id)
      const bKm = distanceOf.get(b.id)
      if (aKm !== undefined && bKm !== undefined) {
        if (aKm !== bKm) return aKm - bKm
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
      }
      if (aKm !== undefined) return -1
      if (bKm !== undefined) return 1
      const byName = compareByName(a.siteName, b.siteName)
      if (byName !== 0) return byName
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
    }

    // "recommended"
    const aRecommended = recommendedIds.has(a.id)
    const bRecommended = recommendedIds.has(b.id)
    if (aRecommended !== bRecommended) return aRecommended ? -1 : 1

    const aTime = Date.parse(a.createdAt)
    const bTime = Date.parse(b.createdAt)
    const aValid = Number.isFinite(aTime)
    const bValid = Number.isFinite(bTime)
    if (aValid && bValid && aTime !== bTime) return bTime - aTime
    if (aValid !== bValid) return aValid ? -1 : 1

    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  })

  return {
    orderedIds: sorted.map((row) => row.id),
    distancesKm,
  }
}
