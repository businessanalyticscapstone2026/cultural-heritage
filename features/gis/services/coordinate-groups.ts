/**
 * Groups map sites that share the exact same coordinates so stacked pins can
 * be drawn as one marker with a count, then fanned out ("spiderfied") on click.
 * MapLibre clustering cannot split points with identical coordinates, so the
 * grouping is by exact lat/lng, not by pixel distance.
 */

export interface PinnableSite {
  id: string
  latitude: number | null
  longitude: number | null
}

export interface CoordinateGroup<T extends PinnableSite> {
  key: string
  latitude: number
  longitude: number
  sites: (T & { latitude: number; longitude: number })[]
}

export function hasCoordinates<T extends PinnableSite>(
  site: T,
): site is T & { latitude: number; longitude: number } {
  return site.latitude != null && site.longitude != null
}

export function coordinateKey(latitude: number, longitude: number): string {
  return `${latitude},${longitude}`
}

/** Groups pinned sites by exact coordinate, keeping input order. Unpinned sites are skipped. */
export function groupByCoordinate<T extends PinnableSite>(sites: T[]): CoordinateGroup<T>[] {
  const groups = new Map<string, CoordinateGroup<T>>()
  for (const site of sites) {
    if (!hasCoordinates(site)) continue
    const key = coordinateKey(site.latitude, site.longitude)
    const group = groups.get(key)
    if (group) group.sites.push(site)
    else groups.set(key, { key, latitude: site.latitude, longitude: site.longitude, sites: [site] })
  }
  return [...groups.values()]
}

/**
 * Largest stack fanned out as pins. Bigger stacks are listed in a popup instead:
 * a fan of dozens of pins spreads hundreds of pixels and lands on other streets
 * or towns, so the pins no longer show where the sites are.
 */
export const SPIDERFY_MAX_SITES = 8

/** Pixel offsets placing up to SPIDERFY_MAX_SITES markers on a small circle around one point. */
export function spiderfyOffsets(count: number, markerSizePx = 28): [number, number][] {
  if (count <= 1) return [[0, 0]]
  const n = Math.min(count, SPIDERFY_MAX_SITES)
  const radius = Math.max(markerSizePx * 1.4, (markerSizePx * 1.3 * n) / (2 * Math.PI))
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2
    return [Math.round(radius * Math.cos(angle)), Math.round(radius * Math.sin(angle))]
  })
}

type BarangayCentres = Record<string, Record<string, [number, number]>>

/**
 * A coordinate shared by sites from different barangays cannot be the real
 * location of all of them: it is a placeholder (e.g. the town centre). For
 * display only, each such site is moved to its barangay's centre and marked
 * `approximateLocation: "barangay"`. Sites in same-barangay stacks, and sites
 * whose barangay centre is unknown, keep their recorded coordinate.
 */
export function placeStackedSitesAtBarangay<
  T extends PinnableSite & { barangay: string | null; municipalityName: string | null },
>(sites: T[], centres: BarangayCentres): (T & { approximateLocation: "barangay" | null })[] {
  const placeholderKeys = new Set<string>()
  for (const group of groupByCoordinate(sites)) {
    const barangays = new Set(group.sites.map((s) => s.barangay?.trim().toLowerCase()).filter(Boolean))
    if (barangays.size > 1) placeholderKeys.add(group.key)
  }

  const lookup = (municipality: string | null, barangay: string | null) => {
    if (!municipality || !barangay) return null
    const byName = centres[municipality]
    if (!byName) return null
    const wanted = barangay.trim().toLowerCase()
    const match = Object.entries(byName).find(([name]) => name.toLowerCase() === wanted)
    return match ? match[1] : null
  }

  return sites.map((site) => {
    if (!hasCoordinates(site) || !placeholderKeys.has(coordinateKey(site.latitude, site.longitude))) {
      return { ...site, approximateLocation: null }
    }
    const centre = lookup(site.municipalityName, site.barangay)
    return centre
      ? { ...site, latitude: centre[0], longitude: centre[1], approximateLocation: "barangay" as const }
      : { ...site, approximateLocation: null }
  })
}
