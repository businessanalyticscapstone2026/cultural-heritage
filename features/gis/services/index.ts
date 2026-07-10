import type { GeoFeatureCollection, MapViewport } from "../types"

export async function getHeritageGeoJSON(): Promise<GeoFeatureCollection> {
  return { type: "FeatureCollection", features: [] }
}

export async function getMunicipalityBoundaries(): Promise<GeoFeatureCollection> {
  return { type: "FeatureCollection", features: [] }
}

export function calculateViewportBounds(coordinates: [number, number][]): MapViewport {
  return { center: [120.78, 13.92], zoom: 10, bearing: 0, pitch: 0 }
}
