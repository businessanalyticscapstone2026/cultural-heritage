/**
 * Barangay centre points, used only to spread out sites whose recorded
 * coordinate is a shared town-centre placeholder (see placeStackedSitesAtBarangay).
 * Never written to the database: a barangay centre is not a site's location.
 *
 * Source: OpenStreetMap place nodes via Nominatim, retrieved 2026-11-24.
 * © OpenStreetMap contributors, ODbL. Barangays missing from OSM are absent here
 * (Taal: Mahabang Ludlod), so those sites keep their recorded coordinate.
 */
export const BARANGAY_CENTRES: Record<string, Record<string, [lat: number, lng: number]>> = {
  Taal: {
    Balisong: [13.8802644, 120.9329707],
    Bihis: [13.8808422, 120.96291],
    "Poblacion 1": [13.8798866, 120.9202507],
    "Poblacion 2": [13.8801209, 120.9209454],
    "Poblacion 3": [13.8764598, 120.9221766],
    "Poblacion 4": [13.8788788, 120.9187246],
    "Poblacion 5": [13.8759208, 120.9176812],
    "Poblacion 6": [13.8775639, 120.9209294],
    "Poblacion 7": [13.8795897, 120.923346],
    "Poblacion 11": [13.880324, 120.9255212],
    "Poblacion 12": [13.8776212, 120.922595],
    "Poblacion 13": [13.8784961, 120.9236624],
    Seiran: [13.8865693, 120.9206638],
    "Tatlong Maria": [13.8854592, 120.9194121],
  },
}
